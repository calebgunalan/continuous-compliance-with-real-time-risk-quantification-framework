import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useControlsPassRate, useOrganizationControls } from "@/hooks/useControls";
import { useLatestMaturityAssessment } from "@/hooks/useRiskCalculations";
import { 
  Shield, 
  Download, 
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PieChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

export function ComplianceSummaryReport() {
  const { organizationId } = useOrganizationContext();
  const { data: passRate } = useControlsPassRate(organizationId || '');
  const { data: controls } = useOrganizationControls(organizationId || '');
  const { data: maturityAssessment } = useLatestMaturityAssessment(organizationId || '');
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);

  const passCount = controls?.filter(c => c.current_status === 'pass').length || 0;
  const failCount = controls?.filter(c => c.current_status === 'fail').length || 0;
  const warningCount = controls?.filter(c => c.current_status === 'warning').length || 0;
  const totalControls = controls?.length || 0;

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let yPosition = margin;

      // Header
      pdf.setFillColor(34, 197, 94);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Compliance Summary Report', margin, 18);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 28);

      yPosition = 45;

      // Overall Compliance Score
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Overall Compliance Score', margin, yPosition);
      yPosition += 10;

      pdf.setFillColor(241, 245, 249);
      pdf.roundedRect(margin, yPosition, pageWidth - margin * 2, 30, 3, 3, 'F');
      
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      const scoreColor = (passRate || 0) >= 80 ? [34, 197, 94] : (passRate || 0) >= 60 ? [234, 179, 8] : [239, 68, 68];
      pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.text(`${passRate || 0}%`, margin + 10, yPosition + 20);
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Control Pass Rate', margin + 45, yPosition + 20);

      yPosition += 45;

      // Control Summary
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Control Status Summary', margin, yPosition);
      yPosition += 10;

      const statusData = [
        { label: 'Passing', count: passCount, color: [34, 197, 94] },
        { label: 'Failing', count: failCount, color: [239, 68, 68] },
        { label: 'Warning', count: warningCount, color: [234, 179, 8] },
        { label: 'Total', count: totalControls, color: [59, 130, 246] },
      ];

      const boxWidth = (pageWidth - margin * 2 - 15) / 4;
      statusData.forEach((item, index) => {
        const x = margin + (boxWidth + 5) * index;
        pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
        pdf.roundedRect(x, yPosition, boxWidth, 25, 3, 3, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(item.label, x + 5, yPosition + 8);
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${item.count}`, x + 5, yPosition + 19);
      });

      yPosition += 40;

      // Maturity Level
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Governance Maturity', margin, yPosition);
      yPosition += 10;

      const maturityLevel = parseInt(maturityAssessment?.overall_level?.replace('level_', '') || '1');
      pdf.setFillColor(59, 130, 246);
      pdf.roundedRect(margin, yPosition, pageWidth - margin * 2, 20, 3, 3, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Level ${maturityLevel} - ${['Reactive', 'Repeatable', 'Defined', 'Managed', 'Optimized'][maturityLevel - 1] || 'Unknown'}`, margin + 10, yPosition + 13);

      yPosition += 35;

      // Control Details Table
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Control Details', margin, yPosition);
      yPosition += 8;

      // Table header
      pdf.setFillColor(241, 245, 249);
      pdf.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
      
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Control', margin + 3, yPosition + 5);
      pdf.text('Status', margin + 100, yPosition + 5);
      pdf.text('Pass Rate', margin + 130, yPosition + 5);
      pdf.text('Last Tested', margin + 155, yPosition + 5);
      yPosition += 10;

      // Table rows (first 15 controls)
      controls?.slice(0, 15).forEach((control) => {
        if (yPosition > 270) return;
        
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text((control.control?.name || 'Unknown').substring(0, 45), margin + 3, yPosition + 5);
        
        const statusColor = control.current_status === 'pass' ? [34, 197, 94] : 
                           control.current_status === 'fail' ? [239, 68, 68] : [234, 179, 8];
        pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        pdf.text(control.current_status.toUpperCase(), margin + 100, yPosition + 5);
        
        pdf.setTextColor(30, 41, 59);
        pdf.text(`${control.pass_rate || 0}%`, margin + 130, yPosition + 5);
        pdf.text(control.last_tested_at ? new Date(control.last_tested_at).toLocaleDateString() : 'Never', margin + 155, yPosition + 5);
        
        yPosition += 7;
      });

      // Footer
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.text('Generated by Continuous Compliance Framework', margin, 285);

      pdf.save(`Compliance_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: 'Report Generated',
        description: 'Compliance summary has been downloaded.',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Failed to generate report. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-success" />
            Compliance Summary
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Control status overview and compliance metrics
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

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-success/10 text-center">
          <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
          <p className="text-lg font-bold text-success">{passCount}</p>
          <p className="text-xs text-muted-foreground">Passing</p>
        </div>
        <div className="p-3 rounded-lg bg-destructive/10 text-center">
          <XCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
          <p className="text-lg font-bold text-destructive">{failCount}</p>
          <p className="text-xs text-muted-foreground">Failing</p>
        </div>
        <div className="p-3 rounded-lg bg-warning/10 text-center">
          <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-1" />
          <p className="text-lg font-bold text-warning">{warningCount}</p>
          <p className="text-xs text-muted-foreground">Warning</p>
        </div>
        <div className="p-3 rounded-lg bg-primary/10 text-center">
          <PieChart className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-primary">{passRate || 0}%</p>
          <p className="text-xs text-muted-foreground">Pass Rate</p>
        </div>
      </div>

      {/* Report Contents */}
      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Included in Report</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-foreground">Overall compliance score</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-foreground">Control status breakdown</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-foreground">Maturity level assessment</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-foreground">Detailed control listing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
