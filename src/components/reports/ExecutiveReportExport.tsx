import { useState } from "react";
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
  Building2,
  Shield,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExecutiveReportExportProps {
  className?: string;
  whatIfData?: {
    targetMaturity: number;
    investment: number;
    projectedReduction: number;
    roi: number;
  };
}

export function ExecutiveReportExport({ className, whatIfData }: ExecutiveReportExportProps) {
  const { organizationId } = useOrganizationContext();
  const { data: riskCalc } = useLatestRiskCalculation(organizationId || '');
  const { data: maturityAssessment } = useLatestMaturityAssessment(organizationId || '');
  const { data: threatScenarios } = useThreatScenarios(organizationId || '');
  const { data: passRate } = useControlsPassRate(organizationId || '');
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatMaturityLevel = (level: string) => {
    const levels: Record<string, string> = {
      level_1: 'Level 1 - Reactive',
      level_2: 'Level 2 - Repeatable',
      level_3: 'Level 3 - Defined',
      level_4: 'Level 4 - Managed',
      level_5: 'Level 5 - Optimized',
    };
    return levels[level] || level;
  };

  const generateReportContent = () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const totalALE = threatScenarios?.reduce((sum, s) => sum + (s.annual_loss_exposure || 0), 0) || 0;
    const criticalThreats = threatScenarios?.filter(s => s.risk_level === 'critical').length || 0;
    const highThreats = threatScenarios?.filter(s => s.risk_level === 'high').length || 0;

    const report = `
═══════════════════════════════════════════════════════════════════════════════
                    EXECUTIVE RISK QUANTIFICATION REPORT
                    Continuous Compliance & Risk Framework
═══════════════════════════════════════════════════════════════════════════════
Generated: ${currentDate}
Report Type: Executive Summary with FAIR Risk Quantification

───────────────────────────────────────────────────────────────────────────────
                              EXECUTIVE SUMMARY
───────────────────────────────────────────────────────────────────────────────

CURRENT RISK POSTURE
• Total Annual Loss Exposure (ALE): ${formatCurrency(totalALE)}
• Control Pass Rate: ${passRate || 0}%
• Governance Maturity Level: ${formatMaturityLevel(maturityAssessment?.overall_level || riskCalc?.maturity_level || 'level_1')}
• Compliance Score: ${riskCalc?.compliance_score?.toFixed(1) || 'N/A'}%

THREAT LANDSCAPE
• Total Threat Scenarios Analyzed: ${threatScenarios?.length || 0}
• Critical Risk Scenarios: ${criticalThreats}
• High Risk Scenarios: ${highThreats}

───────────────────────────────────────────────────────────────────────────────
                           RISK QUANTIFICATION (FAIR)
───────────────────────────────────────────────────────────────────────────────

The Factor Analysis of Information Risk (FAIR) methodology provides quantified
risk estimates based on:
  • Threat Event Frequency (TEF): Expected annual attack attempts
  • Vulnerability: Probability of successful exploitation
  • Loss Event Frequency (LEF): TEF × Vulnerability
  • Loss Magnitude: Primary + Secondary loss impacts
  • Annual Loss Exposure (ALE): LEF × Loss Magnitude

TOP THREAT SCENARIOS BY ANNUAL LOSS EXPOSURE:
${threatScenarios?.sort((a, b) => (b.annual_loss_exposure || 0) - (a.annual_loss_exposure || 0))
  .slice(0, 5)
  .map((s, i) => `  ${i + 1}. ${s.name}
     Risk Level: ${s.risk_level.toUpperCase()}
     ALE: ${formatCurrency(s.annual_loss_exposure || 0)}
     TEF: ${s.threat_event_frequency}/year | Vulnerability: ${(s.vulnerability_factor * 100).toFixed(1)}%`)
  .join('\n\n') || '  No threat scenarios configured.'}

───────────────────────────────────────────────────────────────────────────────
                          MATURITY ASSESSMENT
───────────────────────────────────────────────────────────────────────────────

Current Maturity Level: ${formatMaturityLevel(maturityAssessment?.overall_level || 'level_1')}

MATURITY LEVEL DEFINITIONS:
  Level 1 - Reactive: Minimal formal processes, ad-hoc security responses
  Level 2 - Repeatable: Documented policies, inconsistent application
  Level 3 - Defined: Standardized processes, consistent organization-wide
  Level 4 - Managed: Continuous monitoring, metrics-driven improvements
  Level 5 - Optimized: Predictive analytics, automated response capabilities

${whatIfData ? `
───────────────────────────────────────────────────────────────────────────────
                         WHAT-IF SCENARIO ANALYSIS
───────────────────────────────────────────────────────────────────────────────

PROPOSED INVESTMENT ANALYSIS:
• Target Maturity Level: Level ${whatIfData.targetMaturity}
• Required Investment: ${formatCurrency(whatIfData.investment)}
• Projected Risk Reduction: ${formatCurrency(whatIfData.projectedReduction)}
• Return on Investment (ROI): ${whatIfData.roi.toFixed(0)}%

RECOMMENDATION:
${whatIfData.roi > 200 ? 'STRONGLY RECOMMENDED - Exceptional ROI exceeds 200%' :
  whatIfData.roi > 100 ? 'RECOMMENDED - Strong ROI exceeds 100%' :
  whatIfData.roi > 50 ? 'CONDITIONALLY RECOMMENDED - Moderate ROI' :
  'REVIEW REQUIRED - ROI below threshold for automatic approval'}
` : ''}

───────────────────────────────────────────────────────────────────────────────
                              RECOMMENDATIONS
───────────────────────────────────────────────────────────────────────────────

PRIORITY ACTIONS:
${(maturityAssessment?.improvement_recommendations as { title: string }[] | undefined)?.slice(0, 5).map((rec, i: number) => 
  `  ${i + 1}. ${typeof rec === 'string' ? rec : rec.title}`
).join('\n') || `  1. Enable continuous compliance monitoring for all critical controls
  2. Complete maturity assessment across all security domains
  3. Implement automated evidence collection from key platforms
  4. Establish quarterly executive risk review process
  5. Define risk tolerance thresholds and escalation procedures`}

───────────────────────────────────────────────────────────────────────────────
                                APPENDIX
───────────────────────────────────────────────────────────────────────────────

METHODOLOGY NOTES:
• Risk calculations follow the FAIR (Factor Analysis of Information Risk) framework
• Monte Carlo simulations used for probability distribution analysis
• 90% confidence intervals applied to all risk estimates
• Control effectiveness derived from continuous automated testing

LIMITATIONS:
• Threat event frequencies based on industry benchmarks and historical data
• Loss magnitude estimates include uncertainty ranges
• Risk quantification should be validated against actual incident history

═══════════════════════════════════════════════════════════════════════════════
                    END OF EXECUTIVE RISK REPORT
═══════════════════════════════════════════════════════════════════════════════
`;

    return report;
  };

  const handleExport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate generation time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const reportContent = generateReportContent();
      
      // Create blob and download
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Executive_Risk_Report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Report generated',
        description: 'Executive risk report has been downloaded.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: 'Failed to generate report. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const totalALE = threatScenarios?.reduce((sum, s) => sum + (s.annual_loss_exposure || 0), 0) || 0;

  return (
    <div className={cn("metric-card", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Executive Report Export
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Generate comprehensive risk quantification report
          </p>
        </div>
        <Button
          onClick={handleExport}
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
              Export Report
            </>
          )}
        </Button>
      </div>

      {/* Report Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <DollarSign className="h-3 w-3" />
            Total ALE
          </div>
          <p className="text-lg font-bold text-foreground">{formatCurrency(totalALE)}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Shield className="h-3 w-3" />
            Pass Rate
          </div>
          <p className="text-lg font-bold text-success">{passRate || 0}%</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <TrendingUp className="h-3 w-3" />
            Maturity
          </div>
          <p className="text-lg font-bold text-primary">
            {maturityAssessment?.overall_level?.replace('level_', 'L') || 'L1'}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <AlertTriangle className="h-3 w-3" />
            Scenarios
          </div>
          <p className="text-lg font-bold text-warning">{threatScenarios?.length || 0}</p>
        </div>
      </div>

      {/* Report Contents Preview */}
      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Report Contents</h4>
        <div className="space-y-2">
          {[
            { icon: Building2, label: 'Executive Summary', included: true },
            { icon: DollarSign, label: 'FAIR Risk Quantification', included: true },
            { icon: AlertTriangle, label: 'Threat Scenario Analysis', included: true },
            { icon: TrendingUp, label: 'Maturity Assessment', included: true },
            { icon: Shield, label: 'What-If Projections', included: !!whatIfData },
            { icon: CheckCircle, label: 'Recommendations', included: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <item.icon className={cn("h-4 w-4", item.included ? "text-success" : "text-muted-foreground")} />
              <span className={item.included ? "text-foreground" : "text-muted-foreground"}>
                {item.label}
              </span>
              {item.included && <CheckCircle className="h-3 w-3 text-success ml-auto" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
