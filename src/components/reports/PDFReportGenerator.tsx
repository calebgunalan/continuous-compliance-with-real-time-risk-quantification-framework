import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useLatestRiskCalculation, useLatestMaturityAssessment } from "@/hooks/useRiskCalculations";
import { useThreatScenarios } from "@/hooks/useThreatScenarios";
import { useControlsPassRate } from "@/hooks/useControls";
import { 
  FileText, 
  Download, 
  Loader2,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from "recharts";

interface PDFReportGeneratorProps {
  className?: string;
  whatIfData?: {
    targetMaturity: number;
    investment: number;
    projectedReduction: number;
    roi: number;
  };
}

export function PDFReportGenerator({ className, whatIfData }: PDFReportGeneratorProps) {
  const { organizationId } = useOrganizationContext();
  const { data: riskCalc } = useLatestRiskCalculation(organizationId || '');
  const { data: maturityAssessment } = useLatestMaturityAssessment(organizationId || '');
  const { data: threatScenarios } = useThreatScenarios(organizationId || '');
  const { data: passRate } = useControlsPassRate(organizationId || '');
  const { toast } = useToast();
  const chartRef = useRef<HTMLDivElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const totalALE = threatScenarios?.reduce((sum, s) => sum + (s.annual_loss_exposure || 0), 0) || 0;

  const riskChartData = threatScenarios?.slice(0, 5).map(s => ({
    name: s.name.split(' ').slice(0, 2).join(' '),
    value: s.annual_loss_exposure || 0,
    level: s.risk_level,
  })) || [];

  const maturityData = [
    { name: 'Current', value: parseInt(maturityAssessment?.overall_level?.replace('level_', '') || '1') },
    { name: 'Target', value: whatIfData?.targetMaturity || 5 },
  ];

  const statusData = [
    { name: 'Pass', value: passRate || 0 },
    { name: 'Fail', value: 100 - (passRate || 0) },
  ];

  const COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
    primary: '#3b82f6',
  };

  const handleGeneratePDF = async () => {
    if (!chartRef.current) return;
    
    setIsGenerating(true);
    
    try {
      // Wait for charts to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Header
      pdf.setFillColor(30, 41, 59);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Risk Report', margin, 20);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 30);
      pdf.text('Continuous Compliance & Risk Framework', pageWidth - margin - 70, 30);

      yPosition = 50;

      // Executive Summary Section
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', margin, yPosition);
      yPosition += 10;

      // Summary boxes
      const boxWidth = (pageWidth - margin * 2 - 15) / 4;
      const boxHeight = 25;
      
      const summaryData = [
        { label: 'Total ALE', value: formatCurrency(totalALE), color: [239, 68, 68] },
        { label: 'Pass Rate', value: `${passRate || 0}%`, color: [34, 197, 94] },
        { label: 'Maturity', value: `Level ${maturityAssessment?.overall_level?.replace('level_', '') || '1'}`, color: [59, 130, 246] },
        { label: 'Scenarios', value: `${threatScenarios?.length || 0}`, color: [234, 179, 8] },
      ];

      summaryData.forEach((item, index) => {
        const x = margin + (boxWidth + 5) * index;
        pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
        pdf.roundedRect(x, yPosition, boxWidth, boxHeight, 3, 3, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(item.label, x + 5, yPosition + 8);
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.value, x + 5, yPosition + 18);
      });

      yPosition += boxHeight + 15;

      // Capture and add charts
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        backgroundColor: '#1e293b',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, Math.min(imgHeight, 100));
      yPosition += Math.min(imgHeight, 100) + 15;

      // Threat Scenarios Table
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Top Threat Scenarios', margin, yPosition);
      yPosition += 8;

      // Table header
      pdf.setFillColor(241, 245, 249);
      pdf.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
      
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Scenario', margin + 3, yPosition + 5);
      pdf.text('Risk Level', margin + 80, yPosition + 5);
      pdf.text('TEF', margin + 110, yPosition + 5);
      pdf.text('Vulnerability', margin + 130, yPosition + 5);
      pdf.text('ALE', margin + 160, yPosition + 5);
      yPosition += 10;

      // Table rows
      threatScenarios?.slice(0, 5).forEach((scenario, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(scenario.name.substring(0, 35), margin + 3, yPosition + 5);
        
        const riskColor = COLORS[scenario.risk_level as keyof typeof COLORS] || COLORS.medium;
        pdf.setTextColor(parseInt(riskColor.slice(1, 3), 16), parseInt(riskColor.slice(3, 5), 16), parseInt(riskColor.slice(5, 7), 16));
        pdf.text(scenario.risk_level.toUpperCase(), margin + 80, yPosition + 5);
        
        pdf.setTextColor(30, 41, 59);
        pdf.text(`${scenario.threat_event_frequency}/yr`, margin + 110, yPosition + 5);
        pdf.text(`${(scenario.vulnerability_factor * 100).toFixed(0)}%`, margin + 130, yPosition + 5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(formatCurrency(scenario.annual_loss_exposure || 0), margin + 160, yPosition + 5);
        
        yPosition += 8;
      });

      // What-If Section
      if (whatIfData) {
        yPosition += 10;
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('What-If Analysis', margin, yPosition);
        yPosition += 10;

        pdf.setFillColor(59, 130, 246);
        pdf.roundedRect(margin, yPosition, pageWidth - margin * 2, 30, 3, 3, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Target Maturity: Level ${whatIfData.targetMaturity}`, margin + 10, yPosition + 10);
        pdf.text(`Required Investment: ${formatCurrency(whatIfData.investment)}`, margin + 70, yPosition + 10);
        pdf.text(`Projected Risk Reduction: ${formatCurrency(whatIfData.projectedReduction)}`, margin + 10, yPosition + 22);
        pdf.text(`ROI: ${whatIfData.roi.toFixed(0)}%`, margin + 100, yPosition + 22);
      }

      // Footer
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Generated by Continuous Compliance & Risk Framework', margin, pageHeight - 10);
      pdf.text(`Page 1 of ${pdf.getNumberOfPages()}`, pageWidth - margin - 20, pageHeight - 10);

      // Save PDF
      pdf.save(`Risk_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: 'PDF Report Generated',
        description: 'Your executive report has been downloaded.',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Failed to generate PDF report. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={cn("metric-card", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            PDF Report with Charts
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Generate visual executive report with embedded charts
          </p>
        </div>
        <Button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Generate PDF
            </>
          )}
        </Button>
      </div>

      {/* Hidden charts for PDF capture */}
      <div 
        ref={chartRef} 
        className="absolute -left-[9999px] w-[800px] bg-[#1e293b] p-6 rounded-lg"
        style={{ opacity: isGenerating ? 1 : 0 }}
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Risk by Scenario Chart */}
          <div className="bg-[#0f172a] p-4 rounded-lg">
            <h4 className="text-white text-sm font-medium mb-3">Annual Loss Exposure by Scenario</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `$${v}M`} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={80} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {riskChartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[entry.level as keyof typeof COLORS] || COLORS.medium} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Control Status Pie Chart */}
          <div className="bg-[#0f172a] p-4 rounded-lg">
            <h4 className="text-white text-sm font-medium mb-3">Control Status</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <CheckCircle className="h-5 w-5 text-success mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Risk Charts</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <CheckCircle className="h-5 w-5 text-success mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Threat Analysis</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <CheckCircle className="h-5 w-5 text-success mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">What-If Data</p>
        </div>
      </div>
    </div>
  );
}
