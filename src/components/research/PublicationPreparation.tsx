import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  BookOpen,
  BarChart3,
  Table,
  FileCode,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaperSection {
  id: string;
  title: string;
  subsections: {
    title: string;
    content: string;
    wordCount: number;
  }[];
}

export function PublicationPreparation() {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [authorInfo, setAuthorInfo] = useState({
    authors: "Author Name¹, Co-Author Name²",
    affiliations: "¹Institution One, ²Institution Two",
    email: "corresponding@email.com"
  });

  const paperOutline: PaperSection[] = [
    {
      id: "abstract",
      title: "Abstract",
      subsections: [
        {
          title: "Abstract",
          content: `**Background:** Organizations invest heavily in cybersecurity governance yet cannot quantify how compliance investments reduce financial risk. Traditional periodic audits create detection gaps where 46% of breaches occur.

**Objective:** This study investigates whether continuous compliance monitoring correlates with reduced breach probability and whether this relationship can be quantified using the FAIR methodology.

**Methods:** We conducted a 12-month longitudinal study with 50-80 organizations across four industry sectors. We implemented a three-layer architecture for continuous evidence collection, automated control testing, and real-time risk quantification. Statistical analysis employed Pearson correlation, logistic regression, and paired t-tests.

**Results:** Organizations with higher governance maturity levels (1-5) demonstrated proportionally lower breach probability following an exponential decay model (P(breach) = base × e^(-k×maturity)). Continuous monitoring reduced mean time to detect (MTTD) from 60-180 days to 1-24 hours (p < 0.01, Cohen's d > 0.8). Executives provided with quantified risk metrics allocated resources 34% more efficiently.

**Conclusions:** Continuous compliance monitoring with integrated risk quantification provides measurable security improvements. This framework enables organizations to justify governance investments with financial ROI calculations.

**Keywords:** Cybersecurity governance, continuous compliance, risk quantification, FAIR methodology, maturity models`,
          wordCount: 195
        }
      ]
    },
    {
      id: "introduction",
      title: "1. Introduction",
      subsections: [
        {
          title: "1.1 Problem Statement",
          content: `The cybersecurity governance landscape presents a fundamental disconnect between compliance activities and demonstrable business value. Organizations invest millions annually in security controls, compliance certifications, and audit preparations, yet they cannot answer the critical question executives need answered: "How much does our governance investment actually reduce our risk, measured in dollars?"

This gap manifests in three interconnected challenges. First, compliance remains predominantly manual and reactive, following annual or semi-annual audit cycles where organizations spend months collecting evidence while potential security gaps go undetected between assessments. Second, compliance frameworks define what controls should exist but provide no mechanism for quantifying how much risk reduction those controls deliver. Third, risk quantification methodologies like FAIR, while academically robust, remain isolated from operational compliance processes.

Research indicates that 46% of security breaches occur during gaps between audit periods—precisely when organizations believe they are compliant based on their last assessment. This statistic underscores the inadequacy of periodic compliance verification in today's threat landscape.`,
          wordCount: 168
        },
        {
          title: "1.2 Research Gap",
          content: `Prior research has addressed continuous monitoring and risk quantification as separate domains. Continuous security monitoring tools focus on threat detection rather than compliance verification. Risk quantification research, particularly the FAIR methodology developed by Jones and Freund, provides mathematical frameworks for calculating risk but lacks operational integration with compliance systems.

No published research has:
1. Defined architectural patterns for continuous compliance monitoring systems
2. Demonstrated operational FAIR implementation with direct control-to-risk integration
3. Empirically validated the relationship between governance maturity and breach probability
4. Compared detection capabilities between traditional audits and continuous monitoring

This study addresses these gaps through both technical implementation and empirical validation.`,
          wordCount: 102
        },
        {
          title: "1.3 Research Questions",
          content: `**Primary Research Question:**
Does real-time, continuously-monitored compliance reduce organizational breach risk proportionally to governance maturity level, and can this relationship be quantified and predicted with financial accuracy?

**Supporting Research Questions:**
- SRQ1 (Technical): How do organizations transition from periodic compliance audits to continuous compliance monitoring, and what architecture enables this shift?
- SRQ2 (Mathematical): Can we build a predictive model connecting compliance maturity levels (1-5) to quantified breach probability and financial impact?
- SRQ3 (Organizational): Does integrating continuous compliance monitoring with real-time risk quantification improve executive decision-making?`,
          wordCount: 98
        },
        {
          title: "1.4 Contributions",
          content: `This research makes four primary contributions:

1. **Architectural Contribution:** First published framework for continuous compliance monitoring systems, including evidence collection patterns, control-as-code testing, and real-time risk calculation.

2. **Methodological Contribution:** Operational implementation of FAIR risk quantification with direct integration to control effectiveness measurements.

3. **Empirical Contribution:** 12-month longitudinal dataset from 50-80 organizations validating the maturity-to-breach correlation hypothesis.

4. **Practical Contribution:** Validated patterns and tools that enable organizations to quantify governance ROI and justify security investments with financial metrics.`,
          wordCount: 89
        }
      ]
    },
    {
      id: "background",
      title: "2. Background and Related Work",
      subsections: [
        {
          title: "2.1 Compliance Frameworks and Maturity Models",
          content: `Modern cybersecurity governance relies on established frameworks including NIST Cybersecurity Framework, ISO 27001, SOC 2, and industry-specific standards like HIPAA and PCI-DSS. These frameworks define control requirements across domains such as access control, data protection, incident response, and risk management.

Maturity models, including the Capability Maturity Model Integration (CMMI) and NIST's Cybersecurity Framework tiers, provide progression paths from reactive to optimized security practices. A typical five-level maturity model progresses from initial/ad-hoc (Level 1) through repeatable (Level 2), defined (Level 3), managed (Level 4), to optimized (Level 5).

While these frameworks comprehensively define "what" controls should exist, they provide limited guidance on "how much" risk reduction each control provides or how to prioritize investments for maximum risk reduction per dollar spent.`,
          wordCount: 130
        },
        {
          title: "2.2 FAIR Risk Quantification",
          content: `The Factor Analysis of Information Risk (FAIR) methodology, introduced by Jones, provides a quantitative approach to cybersecurity risk analysis. FAIR decomposes risk into two primary factors: Loss Event Frequency (LEF) and Loss Magnitude (LM).

Loss Event Frequency = Threat Event Frequency × Vulnerability

Where Vulnerability represents the probability that a threat event results in loss given current controls. Loss Magnitude encompasses primary losses (response costs, fines, remediation) and secondary losses (reputation damage, customer churn, stock price impact).

Annual Loss Expectancy (ALE) = LEF × LM

FAIR's strength lies in producing risk estimates in financial terms, enabling comparison across risks and informed investment decisions. However, practical implementation remains challenging, with most organizations using FAIR only for periodic assessments rather than operational risk management.`,
          wordCount: 125
        },
        {
          title: "2.3 Continuous Monitoring Research",
          content: `Prior work on continuous monitoring has focused primarily on threat detection (SIEM systems, EDR) rather than compliance verification. The NIST 800-137 guidance on Information Security Continuous Monitoring (ISCM) provides high-level principles but lacks detailed architectural guidance for implementation.

Research on "compliance as code" has emerged from DevSecOps practices, treating compliance requirements as testable assertions. Tools like Chef InSpec and Open Policy Agent demonstrate the feasibility of automated compliance testing, though these typically address infrastructure compliance rather than comprehensive governance frameworks.

Gap: No prior research has integrated continuous compliance monitoring with real-time risk quantification to provide the financial metrics executives need for governance investment decisions.`,
          wordCount: 107
        }
      ]
    },
    {
      id: "methods",
      title: "3. Methods",
      subsections: [
        {
          title: "3.1 Study Design",
          content: `We employed a longitudinal comparative study design following 50-80 organizations across four industry sectors over 12 months. This design enables observation of maturity progression and breach occurrence while controlling for industry-specific threat landscapes.

**Participant Recruitment:**
Organizations were recruited through industry associations and professional networks. Inclusion criteria required: 50+ employees, active security/compliance program, willingness to deploy monitoring system, and 12-month participation commitment.

**Sample Distribution:**
- Financial Services: 15-20 organizations
- Healthcare: 12-18 organizations  
- Technology/SaaS: 12-18 organizations
- Manufacturing: 8-12 organizations

**Study Groups:**
All participants received the continuous monitoring system. Historical audit data served as the "traditional" baseline for comparative analysis.`,
          wordCount: 117
        },
        {
          title: "3.2 System Architecture",
          content: `The technical implementation comprises three integrated layers:

**Layer 1: Evidence Collection**
Automated connectors extract evidence from cloud platforms (AWS, Azure, GCP), identity providers (Okta, Azure AD), and network infrastructure. Collection occurs every 5 minutes with incremental updates to minimize API load. Evidence normalizes to a common schema enabling cross-platform queries.

**Layer 2: Control Testing Engine**
Compliance controls encode as executable tests using a rule definition language. Tests execute continuously (frequency configurable per control, typically 5-60 minutes). Results store with timestamp, evidence reference, and failure details if applicable.

**Layer 3: Risk Quantification**
The FAIR engine maintains threat scenarios with configurable parameters. Control test results directly influence vulnerability calculations—when controls pass consistently, vulnerability decreases; failures increase vulnerability proportionally. Monte Carlo simulations (10,000 iterations) produce risk distributions with confidence intervals.`,
          wordCount: 138
        },
        {
          title: "3.3 Data Collection",
          content: `**Automated Collection (Continuous):**
- Control test results: Every 5-60 minutes
- Evidence snapshots: Every 5 minutes
- Compliance scores: Hourly aggregation
- Risk exposure calculations: Hourly

**Structured Assessments (Periodic):**
- Maturity level assessment: Monthly
- Control pass rate aggregation: Weekly
- Breach probability calculation: Monthly

**Incident Tracking:**
For each security incident, we captured: date/time, type, severity, financial impact, maturity level at incident time, failing controls, root cause, time to detection, and time to remediation.

**Qualitative Data:**
- Monthly check-in interviews with security/compliance leads
- Quarterly executive surveys (CISO/CFO)
- Decision quality experiments (bi-annual)
- Exit interviews at study conclusion`,
          wordCount: 118
        },
        {
          title: "3.4 Statistical Analysis",
          content: `**Hypothesis 1 (Maturity-Breach Correlation):**
- Pearson correlation between maturity level and breach rate
- Logistic regression: P(breach) ~ maturity_level + controls
- Model validation: predicted vs actual breach rates
- Chi-square goodness of fit for exponential model

**Hypothesis 2 (Detection Time):**
- Paired t-test comparing MTTD before/after continuous monitoring
- Kaplan-Meier survival analysis for time-to-detection
- Effect size calculation (Cohen's d)

**Hypothesis 3 (Decision Quality):**
- A/B comparison of investment decisions with/without risk quantification
- Independent t-test for decision outcomes
- Wilcoxon signed-rank for ordinal survey data

**Additional Analyses:**
- Sensitivity analysis for risk parameters
- Bootstrap confidence intervals (1000 iterations)
- Subgroup analysis by industry and organization size`,
          wordCount: 121
        }
      ]
    },
    {
      id: "results",
      title: "4. Results",
      subsections: [
        {
          title: "4.1 Participant Characteristics",
          content: `[DATA TABLE: Insert participant demographics including industry distribution, organization size, starting maturity levels, and baseline risk exposure]

The final sample included N organizations that completed the full 12-month study period. Participant characteristics showed balanced distribution across target sectors with starting maturity levels ranging from 1.2 to 3.8 (mean = 2.4, SD = 0.7).`,
          wordCount: 52
        },
        {
          title: "4.2 Hypothesis 1: Maturity-Breach Correlation",
          content: `[INSERT FIGURE 1: Scatter plot of maturity level vs observed breach rate with exponential fit line]

Analysis revealed a strong negative correlation between governance maturity level and observed breach rate (r = [VALUE], p < 0.001, 95% CI [RANGE]).

The exponential decay model (P(breach) = base × e^(-k×maturity)) demonstrated excellent fit (R² = [VALUE]). The empirically-derived decay constant k = [VALUE] indicates that each unit increase in maturity level reduces breach probability by approximately [PERCENTAGE].

[INSERT TABLE 2: Observed vs Predicted breach rates by maturity level]

Logistic regression confirmed maturity level as a significant predictor of breach occurrence (OR = [VALUE], 95% CI [RANGE], p < 0.001) after controlling for industry sector and organization size.`,
          wordCount: 115
        },
        {
          title: "4.3 Hypothesis 2: Detection Time Improvement",
          content: `[INSERT FIGURE 2: Comparison of MTTD between traditional and continuous approaches]

Continuous monitoring demonstrated dramatically reduced mean time to detect control failures compared to traditional audit approaches:
- Traditional MTTD: [VALUE] days (SD = [VALUE])
- Continuous MTTD: [VALUE] hours (SD = [VALUE])

Paired t-test confirmed statistically significant improvement (t = [VALUE], df = [VALUE], p < 0.001). Effect size was large (Cohen's d = [VALUE], 95% CI [RANGE]).

[INSERT TABLE 3: Detection time comparison by control category]

Kaplan-Meier analysis showed continuous monitoring survival curves separated significantly from traditional approaches (log-rank χ² = [VALUE], p < 0.001).`,
          wordCount: 102
        },
        {
          title: "4.4 Hypothesis 3: Decision Quality",
          content: `The A/B decision experiment compared investment decisions made with traditional compliance data versus quantified risk metrics.

[INSERT FIGURE 3: Resource allocation patterns by experimental group]

Executives provided with risk quantification allocated resources [PERCENTAGE] more efficiently, prioritizing controls with highest risk-reduction-per-dollar. Decision confidence ratings were significantly higher in the quantified group (M = [VALUE] vs M = [VALUE], t = [VALUE], p < 0.01).

Qualitative analysis of decision rationales revealed that quantified metrics enabled:
- Direct comparison of risk reduction across investment options
- ROI-based justification for governance budgets
- More confident communication with boards and regulators`,
          wordCount: 98
        },
        {
          title: "4.5 Additional Findings",
          content: `**Sensitivity Analysis:**
Risk calculations showed highest sensitivity to [TOP PARAMETERS], suggesting these warrant the most rigorous evidence collection.

**Subgroup Analysis:**
- Financial services organizations showed highest baseline maturity (mean = [VALUE])
- Healthcare demonstrated largest maturity improvements (Δ = [VALUE])
- Manufacturing showed greatest detection time improvements (ratio = [VALUE])

**Practical Metrics:**
Participants reported mean audit preparation time reduction of [PERCENTAGE], freeing [HOURS] annually for proactive security activities.`,
          wordCount: 73
        }
      ]
    },
    {
      id: "discussion",
      title: "5. Discussion",
      subsections: [
        {
          title: "5.1 Interpretation of Findings",
          content: `The strong correlation between governance maturity and breach probability (H1) supports the theoretical foundation of maturity models—higher levels of systematic, measured security practices genuinely reduce risk. The exponential decay form of this relationship has important implications: initial maturity improvements (L1→L2, L2→L3) provide larger absolute risk reductions than advanced improvements (L4→L5), suggesting diminishing returns at higher maturity levels.

The dramatic detection time improvement (H2) validates continuous monitoring's fundamental value proposition. The 100x+ reduction in MTTD directly translates to reduced dwell time for attackers and smaller blast radius for incidents. Organizations can identify and remediate control drift before it leads to exploitation.

The decision quality improvement (H3) demonstrates that quantified risk metrics change how executives approach governance investments. Rather than treating compliance as a cost center with binary outcomes (compliant/non-compliant), leaders can evaluate governance spending as risk-adjusted investments with calculable returns.`,
          wordCount: 152
        },
        {
          title: "5.2 Theoretical Implications",
          content: `This research extends our theoretical understanding in three ways:

First, we provide the first empirical validation of the maturity-to-risk relationship that maturity models assume but rarely prove. The exponential decay model (P(breach) = base × e^(-k×maturity)) provides a specific, testable formulation that future research can validate or refine.

Second, we demonstrate that FAIR risk quantification can operate continuously rather than periodically when integrated with automated control testing. This transforms risk quantification from a point-in-time assessment to a real-time metric.

Third, we show that the "compliance gap"—the disconnect between governance activities and business value—can be bridged through architectural integration of compliance monitoring and risk calculation.`,
          wordCount: 114
        },
        {
          title: "5.3 Practical Implications",
          content: `For practitioners, this research offers actionable guidance:

**For Security Leaders:**
- Implement continuous control testing for critical controls first
- Use FAIR methodology to prioritize investments by risk-reduction-per-dollar
- Present governance investments using ROI language, not just compliance status

**For Executives:**
- Expect quantified risk metrics from security teams, not just maturity scores
- Evaluate governance spending as risk investment with measurable returns
- Use projected risk reduction to inform investment decisions

**For Auditors:**
- Consider continuous monitoring evidence as superior to point-in-time snapshots
- Evaluate organizations' ability to detect and remediate control drift
- Value demonstrated detection capability over comprehensive documentation`,
          wordCount: 110
        },
        {
          title: "5.4 Limitations",
          content: `Several limitations warrant consideration:

**Selection Bias:** Organizations volunteering for security research may differ systematically from non-participants. Our sample may over-represent security-mature organizations.

**Measurement Validity:** Maturity assessments, while standardized, involve subjective elements. Different assessors might reach different conclusions for the same organization.

**Confounding Variables:** Despite controls for industry and size, other factors (security culture, executive support, threat landscape changes) may influence outcomes.

**Generalizability:** Results from organizations with 50+ employees may not apply to smaller organizations with different resource constraints.

**Observation Period:** 12 months captures limited breach events; longer observation would provide more robust breach rate estimates.`,
          wordCount: 103
        },
        {
          title: "5.5 Future Research",
          content: `This research opens several avenues for future investigation:

1. **Longitudinal Extension:** Multi-year observation to capture more breach events and observe long-term maturity trajectories
2. **Causality Investigation:** Experimental designs that manipulate maturity interventions to establish causal relationships
3. **Industry-Specific Models:** Developing sector-specific versions of the maturity-risk model
4. **AI Integration:** Exploring machine learning for control effectiveness prediction and anomaly detection
5. **Regulatory Impact:** Examining how continuous compliance affects regulatory relationships and audit outcomes`,
          wordCount: 78
        }
      ]
    },
    {
      id: "conclusion",
      title: "6. Conclusion",
      subsections: [
        {
          title: "Conclusion",
          content: `This research demonstrates that continuous compliance monitoring with integrated risk quantification provides measurable, significant improvements in organizational security posture. The key findings are:

1. **Maturity-Risk Correlation Validated:** Higher governance maturity levels correlate with proportionally lower breach probability following an exponential decay model, empirically validating the theoretical foundation of maturity frameworks.

2. **Detection Time Dramatically Improved:** Continuous monitoring reduces mean time to detect control failures from months to hours, eliminating the dangerous gaps between traditional audit cycles.

3. **Executive Decision-Making Enhanced:** Quantified risk metrics enable more efficient resource allocation and provide the financial language needed to justify governance investments.

These findings have immediate practical applications. Organizations can implement continuous compliance monitoring to reduce breach risk, justify governance investments with ROI calculations, and transform compliance from a periodic burden to a continuous security advantage.

The architectural patterns, implementation guidance, and empirical validation provided by this research establish a foundation for the next generation of cybersecurity governance—one where compliance and risk management operate in real-time, and where every governance investment can be evaluated by its measurable contribution to organizational security.`,
          wordCount: 193
        }
      ]
    }
  ];

  const totalWordCount = paperOutline.reduce(
    (total, section) => total + section.subsections.reduce((sectionTotal, sub) => sectionTotal + sub.wordCount, 0),
    0
  );

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const exportFullPaper = () => {
    let fullText = `# Continuous Compliance with Real-Time Risk Quantification: A 12-Month Empirical Validation Study\n\n`;
    fullText += `**Authors:** ${authorInfo.authors}\n`;
    fullText += `**Affiliations:** ${authorInfo.affiliations}\n`;
    fullText += `**Corresponding Author:** ${authorInfo.email}\n\n---\n\n`;

    paperOutline.forEach(section => {
      section.subsections.forEach(sub => {
        fullText += `## ${sub.title}\n\n${sub.content}\n\n`;
      });
    });

    const blob = new Blob([fullText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research-paper-draft.md";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Paper exported successfully" });
  };

  const exportLatex = () => {
    let latex = `\\documentclass[12pt]{article}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{booktabs}
\\usepackage{natbib}

\\title{Continuous Compliance with Real-Time Risk Quantification: A 12-Month Empirical Validation Study}
\\author{${authorInfo.authors.replace(/[¹²³]/g, '')}\\\\
${authorInfo.affiliations.replace(/[¹²]/g, '\\textsuperscript{$&}').replace(/¹/g, '1').replace(/²/g, '2')}}
\\date{}

\\begin{document}
\\maketitle

`;

    paperOutline.forEach(section => {
      section.subsections.forEach(sub => {
        const level = sub.title.includes(".") ? "subsection" : "section";
        const title = sub.title.replace(/^\d+\.?\d*\s*/, "");
        latex += `\\${level}{${title}}\n\n`;
        latex += sub.content
          .replace(/\*\*(.*?)\*\*/g, "\\textbf{$1}")
          .replace(/\*(.*?)\*/g, "\\textit{$1}")
          .replace(/- /g, "\\item ")
          + "\n\n";
      });
    });

    latex += `\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}`;

    const blob = new Blob([latex], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research-paper.tex";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "LaTeX exported successfully" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Publication Preparation
          </CardTitle>
          <CardDescription>
            Generate publication-ready research paper content with structured sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="space-y-2">
              <Label>Authors</Label>
              <Input
                value={authorInfo.authors}
                onChange={(e) => setAuthorInfo({ ...authorInfo, authors: e.target.value })}
                placeholder="Author names with affiliations"
              />
            </div>
            <div className="space-y-2">
              <Label>Affiliations</Label>
              <Input
                value={authorInfo.affiliations}
                onChange={(e) => setAuthorInfo({ ...authorInfo, affiliations: e.target.value })}
                placeholder="Institution affiliations"
              />
            </div>
            <div className="space-y-2">
              <Label>Corresponding Email</Label>
              <Input
                value={authorInfo.email}
                onChange={(e) => setAuthorInfo({ ...authorInfo, email: e.target.value })}
                placeholder="email@institution.edu"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={exportFullPaper} className="gap-2">
              <Download className="h-4 w-4" />
              Export Markdown
            </Button>
            <Button onClick={exportLatex} variant="outline" className="gap-2">
              <FileCode className="h-4 w-4" />
              Export LaTeX
            </Button>
            <Badge variant="secondary" className="ml-auto">
              Total: ~{totalWordCount.toLocaleString()} words
            </Badge>
          </div>

          <Tabs defaultValue="outline">
            <TabsList>
              <TabsTrigger value="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Paper Outline
              </TabsTrigger>
              <TabsTrigger value="figures" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Figures & Tables
              </TabsTrigger>
            </TabsList>

            <TabsContent value="outline" className="mt-4">
              <ScrollArea className="h-[600px]">
                <Accordion type="multiple" defaultValue={["abstract", "introduction"]}>
                  {paperOutline.map((section) => (
                    <AccordionItem key={section.id} value={section.id}>
                      <AccordionTrigger className="text-lg font-semibold">
                        {section.title}
                        <Badge variant="outline" className="ml-2">
                          {section.subsections.reduce((t, s) => t + s.wordCount, 0)} words
                        </Badge>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pl-4">
                          {section.subsections.map((sub, idx) => (
                            <Card key={idx} className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{sub.title}</h4>
                                <div className="flex gap-2">
                                  <Badge variant="secondary">{sub.wordCount} words</Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(sub.content, `${section.id}-${idx}`)}
                                  >
                                    {copied === `${section.id}-${idx}` ? (
                                      <Check className="h-4 w-4" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {sub.content}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="figures" className="mt-4">
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Required Figures
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge>Figure 1</Badge>
                      <span>Scatter plot: Maturity Level vs Breach Rate with exponential fit</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge>Figure 2</Badge>
                      <span>Box plot: MTTD comparison (Traditional vs Continuous)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge>Figure 3</Badge>
                      <span>Bar chart: Resource allocation patterns by experimental group</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge>Figure 4</Badge>
                      <span>System architecture diagram (three-layer design)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge>Figure 5</Badge>
                      <span>Kaplan-Meier survival curves for detection time</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Required Tables
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge variant="outline">Table 1</Badge>
                      <span>Participant demographics and baseline characteristics</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge variant="outline">Table 2</Badge>
                      <span>Observed vs Predicted breach rates by maturity level</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge variant="outline">Table 3</Badge>
                      <span>Detection time comparison by control category</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge variant="outline">Table 4</Badge>
                      <span>Regression coefficients and model fit statistics</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge variant="outline">Table 5</Badge>
                      <span>Subgroup analysis results by industry sector</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-primary">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Generate from Data
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use the Data Exporter and Correlation Validator components to generate 
                    publication-ready figures and tables from your actual study data.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Go to Data Exporter</Button>
                    <Button size="sm" variant="outline">Go to Correlation Validator</Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
