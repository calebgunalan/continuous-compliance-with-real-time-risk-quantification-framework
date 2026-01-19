import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Download, 
  TrendingUp, 
  Shield, 
  DollarSign,
  Calendar,
  Building2,
  Target,
  CheckCircle2,
  ArrowRight,
  Quote,
  FileText
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface CaseStudyData {
  organizationId: string;
  organizationName: string;
  industry: string;
  size: string;
  studyPeriod: { start: string; end: string };
  baselineMaturity: number;
  finalMaturity: number;
  baselineRisk: number;
  finalRisk: number;
  keyMilestones: { date: string; event: string; impact: string }[];
  controlImprovements: { control: string; before: string; after: string }[];
  challenges: string[];
  successFactors: string[];
  executiveQuote: string;
  roi: number;
}

export function CaseStudyGenerator() {
  const [selectedOrg, setSelectedOrg] = useState<string>("org-1");
  const [narrativeNotes, setNarrativeNotes] = useState("");

  // Mock case study data for demonstration
  const caseStudies: CaseStudyData[] = useMemo(() => [
    {
      organizationId: "org-1",
      organizationName: "Regional Financial Services Corp",
      industry: "Financial Services",
      size: "500-1000 employees",
      studyPeriod: { start: "2025-02", end: "2026-01" },
      baselineMaturity: 2.1,
      finalMaturity: 3.7,
      baselineRisk: 823000000,
      finalRisk: 312000000,
      keyMilestones: [
        { date: "2025-02", event: "Framework deployment", impact: "Baseline assessment completed" },
        { date: "2025-04", event: "MFA implementation", impact: "58% → 94% privileged account coverage" },
        { date: "2025-06", event: "Access review automation", impact: "Orphaned accounts reduced by 72%" },
        { date: "2025-08", event: "Vulnerability management upgrade", impact: "Critical remediation time: 45d → 7d" },
        { date: "2025-11", event: "SOC 2 Type II achieved", impact: "First continuous compliance certification" },
        { date: "2026-01", event: "Study completion", impact: "Level 3.7 maturity achieved" }
      ],
      controlImprovements: [
        { control: "Identity & Access Management", before: "Manual quarterly reviews", after: "Continuous monitoring with automated alerts" },
        { control: "Vulnerability Management", before: "Monthly scans, manual prioritization", after: "Continuous scanning with risk-based prioritization" },
        { control: "Security Awareness", before: "Annual training completion", after: "Continuous phishing simulations + targeted training" },
        { control: "Incident Response", before: "Ad-hoc response procedures", after: "Automated playbooks with 15-minute initial response" }
      ],
      challenges: [
        "Legacy system integration required custom evidence collectors",
        "Initial resistance from IT teams accustomed to periodic audits",
        "Executive buy-in required demonstrating early quick wins"
      ],
      successFactors: [
        "Strong CISO sponsorship and board visibility",
        "Phased rollout starting with highest-risk controls",
        "Regular communication of quantified risk improvements"
      ],
      executiveQuote: "For the first time, I can tell the board exactly how much our security investments reduce our risk exposure. That changes every budget conversation.",
      roi: 784
    },
    {
      organizationId: "org-2",
      organizationName: "Healthcare Network Systems",
      industry: "Healthcare",
      size: "1000-5000 employees",
      studyPeriod: { start: "2025-03", end: "2026-02" },
      baselineMaturity: 1.8,
      finalMaturity: 3.2,
      baselineRisk: 1250000000,
      finalRisk: 520000000,
      keyMilestones: [
        { date: "2025-03", event: "HIPAA gap assessment", impact: "47 control gaps identified" },
        { date: "2025-05", event: "PHI access monitoring deployed", impact: "Inappropriate access incidents: 23 → 2/month" },
        { date: "2025-07", event: "Encryption rollout complete", impact: "Data-at-rest: 34% → 100% encrypted" },
        { date: "2025-10", event: "Third-party risk program", impact: "Vendor assessments automated" },
        { date: "2026-02", event: "Study completion", impact: "Level 3.2 maturity achieved" }
      ],
      controlImprovements: [
        { control: "PHI Access Controls", before: "Role-based access, annual reviews", after: "Attribute-based with continuous monitoring" },
        { control: "Data Encryption", before: "Partial encryption, manual key management", after: "Full encryption with automated key rotation" },
        { control: "Audit Logging", before: "30-day retention, manual review", after: "365-day retention, ML-based anomaly detection" }
      ],
      challenges: [
        "Complex EHR integrations across multiple facilities",
        "Regulatory requirements for maintaining legacy systems",
        "Staff training across geographically distributed locations"
      ],
      successFactors: [
        "Dedicated compliance team with IT integration",
        "Board-level commitment to security culture",
        "Investment in automation to reduce manual burden"
      ],
      executiveQuote: "The continuous compliance framework transformed our audit preparation from a 6-month project to a dashboard check. Our auditors were impressed.",
      roi: 1240
    },
    {
      organizationId: "org-3",
      organizationName: "TechScale SaaS Platform",
      industry: "Technology",
      size: "100-500 employees",
      studyPeriod: { start: "2025-01", end: "2025-12" },
      baselineMaturity: 2.8,
      finalMaturity: 4.2,
      baselineRisk: 340000000,
      finalRisk: 85000000,
      keyMilestones: [
        { date: "2025-01", event: "Cloud security baseline", impact: "AWS/GCP configurations assessed" },
        { date: "2025-03", event: "IaC security integration", impact: "Pre-deployment security checks automated" },
        { date: "2025-05", event: "Zero trust network deployed", impact: "Lateral movement risk reduced 89%" },
        { date: "2025-08", event: "SOC 2 + ISO 27001 dual cert", impact: "Customer trust score improved 34%" },
        { date: "2025-12", event: "Study completion", impact: "Level 4.2 maturity achieved" }
      ],
      controlImprovements: [
        { control: "Cloud Security Posture", before: "Periodic configuration reviews", after: "Real-time CSPM with auto-remediation" },
        { control: "DevSecOps Pipeline", before: "Security as gate before production", after: "Shift-left with developer security champions" },
        { control: "API Security", before: "Manual penetration testing quarterly", after: "Continuous API monitoring and fuzzing" }
      ],
      challenges: [
        "Rapid development velocity conflicting with security reviews",
        "Multi-cloud complexity requiring unified visibility",
        "Balancing developer productivity with security controls"
      ],
      successFactors: [
        "Engineering-first security culture",
        "API-driven automation for all security processes",
        "Quantified risk metrics driving prioritization"
      ],
      executiveQuote: "Showing customers our real-time compliance dashboard during sales calls has become a competitive advantage. Security is now a feature.",
      roi: 3000
    }
  ], []);

  const selectedStudy = caseStudies.find(cs => cs.organizationId === selectedOrg) || caseStudies[0];

  // Generate journey timeline data
  const journeyData = useMemo(() => {
    const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
    const baseMaturity = selectedStudy.baselineMaturity;
    const finalMaturity = selectedStudy.finalMaturity;
    const maturityGrowth = (finalMaturity - baseMaturity) / 11;
    
    const baseRisk = selectedStudy.baselineRisk;
    const finalRisk = selectedStudy.finalRisk;
    
    return months.map((month, i) => ({
      month,
      maturity: Number((baseMaturity + maturityGrowth * i).toFixed(1)),
      risk: Math.round(baseRisk - ((baseRisk - finalRisk) * (i / 11)))
    }));
  }, [selectedStudy]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${value.toLocaleString()}`;
  };

  const riskReduction = selectedStudy.baselineRisk - selectedStudy.finalRisk;
  const riskReductionPercent = ((riskReduction / selectedStudy.baselineRisk) * 100).toFixed(0);
  const maturityImprovement = (selectedStudy.finalMaturity - selectedStudy.baselineMaturity).toFixed(1);

  const generateNarrative = () => {
    return `
# Case Study: ${selectedStudy.organizationName}

## Executive Summary

${selectedStudy.organizationName}, a ${selectedStudy.size} organization in the ${selectedStudy.industry} sector, participated in a 12-month study evaluating the effectiveness of continuous compliance monitoring integrated with real-time risk quantification. Over the study period (${selectedStudy.studyPeriod.start} to ${selectedStudy.studyPeriod.end}), the organization improved their governance maturity from Level ${selectedStudy.baselineMaturity} to Level ${selectedStudy.finalMaturity}, achieving a ${riskReductionPercent}% reduction in quantified risk exposure.

## Starting Point

At the beginning of the study, ${selectedStudy.organizationName} operated with traditional periodic compliance processes. Their baseline assessment revealed:

- **Governance Maturity Level:** ${selectedStudy.baselineMaturity} (${selectedStudy.baselineMaturity < 2 ? "Reactive" : selectedStudy.baselineMaturity < 3 ? "Repeatable" : "Defined"})
- **Annual Risk Exposure:** ${formatCurrency(selectedStudy.baselineRisk)}
- **Primary Compliance Framework:** ${selectedStudy.industry === "Healthcare" ? "HIPAA" : selectedStudy.industry === "Financial Services" ? "SOC 2" : "ISO 27001"}

## Transformation Journey

### Key Milestones

${selectedStudy.keyMilestones.map(m => `- **${m.date}:** ${m.event} — ${m.impact}`).join('\n')}

### Control Improvements

${selectedStudy.controlImprovements.map(c => `**${c.control}**
- Before: ${c.before}
- After: ${c.after}`).join('\n\n')}

## Challenges Encountered

${selectedStudy.challenges.map(c => `- ${c}`).join('\n')}

## Success Factors

${selectedStudy.successFactors.map(s => `- ${s}`).join('\n')}

## Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Maturity Level | ${selectedStudy.baselineMaturity} | ${selectedStudy.finalMaturity} | +${maturityImprovement} levels |
| Risk Exposure | ${formatCurrency(selectedStudy.baselineRisk)} | ${formatCurrency(selectedStudy.finalRisk)} | -${riskReductionPercent}% |
| ROI | — | ${selectedStudy.roi}% | — |

## Executive Perspective

> "${selectedStudy.executiveQuote}"
> 
> — CISO, ${selectedStudy.organizationName}

## Research Implications

This case study demonstrates that continuous compliance monitoring, when integrated with quantified risk metrics, enables organizations to:

1. **Accelerate maturity improvement** through real-time feedback loops
2. **Justify security investments** with clear financial risk reduction data
3. **Transform audit processes** from periodic preparation burdens to continuous assurance
4. **Align security with business objectives** through shared risk language

${narrativeNotes ? `\n## Additional Notes\n\n${narrativeNotes}` : ''}
`;
  };

  const handleExport = () => {
    const narrative = generateNarrative();
    const blob = new Blob([narrative], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `case-study-${selectedStudy.organizationId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Case Study Generator
          </h2>
          <p className="text-muted-foreground mt-1">
            Compile organization journey narratives from collected research data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {caseStudies.map(cs => (
                <SelectItem key={cs.organizationId} value={cs.organizationId}>
                  {cs.organizationName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export Markdown
          </Button>
        </div>
      </div>

      {/* Organization Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {selectedStudy.organizationName}
              </CardTitle>
              <CardDescription className="mt-1">
                {selectedStudy.industry} • {selectedStudy.size} • Study Period: {selectedStudy.studyPeriod.start} to {selectedStudy.studyPeriod.end}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-1">
              ROI: {selectedStudy.roi}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Baseline Maturity</div>
              <div className="text-2xl font-bold text-destructive">{selectedStudy.baselineMaturity}</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Final Maturity</div>
              <div className="text-2xl font-bold text-success">{selectedStudy.finalMaturity}</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Baseline Risk</div>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(selectedStudy.baselineRisk)}</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Final Risk</div>
              <div className="text-2xl font-bold text-success">{formatCurrency(selectedStudy.finalRisk)}</div>
            </div>
          </div>

          {/* Journey Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Maturity Journey</span>
              <span className="text-sm text-muted-foreground">+{maturityImprovement} levels</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="destructive">{selectedStudy.baselineMaturity}</Badge>
              <Progress value={((selectedStudy.finalMaturity - 1) / 4) * 100} className="flex-1" />
              <Badge className="bg-success">{selectedStudy.finalMaturity}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="journey" className="space-y-4">
        <TabsList>
          <TabsTrigger value="journey" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Journey
          </TabsTrigger>
          <TabsTrigger value="milestones" className="gap-2">
            <Target className="h-4 w-4" />
            Milestones
          </TabsTrigger>
          <TabsTrigger value="improvements" className="gap-2">
            <Shield className="h-4 w-4" />
            Improvements
          </TabsTrigger>
          <TabsTrigger value="narrative" className="gap-2">
            <FileText className="h-4 w-4" />
            Narrative
          </TabsTrigger>
        </TabsList>

        <TabsContent value="journey" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Maturity Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={journeyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis domain={[1, 5]} className="text-xs" />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="maturity" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Reduction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={journeyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis 
                        tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`}
                        className="text-xs" 
                      />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Area 
                        type="monotone" 
                        dataKey="risk" 
                        stroke="hsl(var(--destructive))" 
                        fill="hsl(var(--destructive) / 0.2)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Executive Quote */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Quote className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <p className="text-lg italic">"{selectedStudy.executiveQuote}"</p>
                  <p className="text-sm text-muted-foreground mt-2">— CISO, {selectedStudy.organizationName}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle>Key Milestones</CardTitle>
              <CardDescription>Critical events in the organization's transformation journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6">
                  {selectedStudy.keyMilestones.map((milestone, index) => (
                    <div key={index} className="relative pl-10">
                      <div className="absolute left-2 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{milestone.date}</Badge>
                            <span className="font-medium">{milestone.event}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{milestone.impact}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Control Improvements</CardTitle>
              <CardDescription>Before and after comparison of key security controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedStudy.controlImprovements.map((improvement, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">{improvement.control}</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-destructive/10 rounded-lg">
                        <div className="text-xs text-destructive font-medium mb-1">BEFORE</div>
                        <p className="text-sm">{improvement.before}</p>
                      </div>
                      <div className="p-3 bg-success/10 rounded-lg">
                        <div className="text-xs text-success font-medium mb-1">AFTER</div>
                        <p className="text-sm">{improvement.after}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Challenges Encountered</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedStudy.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                      {challenge}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Success Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedStudy.successFactors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="narrative">
          <Card>
            <CardHeader>
              <CardTitle>Narrative Editor</CardTitle>
              <CardDescription>Add additional notes and observations for the case study narrative</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add researcher notes, additional context, or observations to include in the exported case study..."
                value={narrativeNotes}
                onChange={(e) => setNarrativeNotes(e.target.value)}
                className="min-h-[150px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Complete Case Study
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-[400px] whitespace-pre-wrap">
                  {generateNarrative()}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
