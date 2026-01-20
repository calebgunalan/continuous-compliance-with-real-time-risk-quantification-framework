import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Mail, 
  Users, 
  Calendar,
  Send,
  FileText,
  TrendingUp,
  Building2,
  GraduationCap,
  Briefcase,
  Copy,
  Check,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsletterTemplate {
  id: string;
  title: string;
  type: "monthly" | "quarterly" | "special";
  sections: {
    title: string;
    content: string;
  }[];
}

interface EngagementRecord {
  organizationId: string;
  organizationName: string;
  lastContact: string;
  contactType: string;
  nextScheduled: string;
  engagementScore: number;
  notes: string;
}

export function StakeholderCommunication() {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("january-2026");

  const newsletterTemplates: NewsletterTemplate[] = [
    {
      id: "monthly-jan",
      title: "Monthly Research Update - January 2026",
      type: "monthly",
      sections: [
        {
          title: "Study Progress Update",
          content: `Dear Research Participants,

We're excited to share our January 2026 progress update for the Continuous Compliance with Real-Time Risk Quantification study.

**Key Milestones This Month:**
- 52 organizations now actively participating (87% of target)
- Average control pass rate improved to 76.3% across all participants
- 3 new evidence source integrations deployed (ServiceNow, Splunk, CrowdStrike)

**Aggregate Findings (Anonymized):**
- Organizations using continuous monitoring detected control failures 94% faster than baseline
- Mean time to detect (MTTD) reduced from 127 days to 8.3 hours on average
- Correlation coefficient between maturity level and breach rate: r = -0.67 (strong negative)

**Coming Next Month:**
- New What-If Scenario Modeler for investment planning
- Enhanced executive dashboard with ROI projections
- Industry benchmark comparisons

Thank you for your continued participation!`
        },
        {
          title: "Feature Spotlight",
          content: `**This Month: Investment Prioritizer**

The new Investment Prioritizer helps you identify which security investments provide the highest risk-reduction-per-dollar. 

How to use it:
1. Navigate to Risk Quantification → Investment Prioritizer
2. Review the ranked list of potential improvements
3. Click any item to see detailed ROI calculations
4. Export recommendations for executive presentations

*Tip: Controls with high pass rate but low implementation cost often provide quick wins for improving overall maturity.*`
        },
        {
          title: "Best Practices Corner",
          content: `**Maximizing Value from Continuous Compliance**

This month's best practice comes from a participating financial services organization that improved their maturity from Level 2.1 to Level 3.4 in just 6 months:

"We assigned ownership for each control to specific team members and set up Slack notifications for any control failures. This created accountability and reduced our mean time to remediate from 72 hours to under 4 hours."

*Share your success stories with us for future newsletters!*`
        }
      ]
    },
    {
      id: "quarterly-q4",
      title: "Q4 2025 Executive Briefing",
      type: "quarterly",
      sections: [
        {
          title: "Executive Summary",
          content: `**Quarterly Executive Briefing - Q4 2025**

To: Executive Sponsors and CISOs
From: Research Team
Date: January 2026

**Key Performance Indicators:**

| Metric | Q3 2025 | Q4 2025 | Change |
|--------|---------|---------|--------|
| Organizations Enrolled | 38 | 52 | +37% |
| Avg Maturity Level | 2.3 | 2.7 | +0.4 |
| Avg Risk Exposure | $423M | $312M | -26% |
| Control Pass Rate | 68% | 76% | +8% |

**Hypothesis Validation Progress:**
- H1 (Maturity-Breach Correlation): 72% confidence, on track for validation
- H2 (Detection Time): VALIDATED (94% confidence, p < 0.001)
- H3 (Decision Quality): 65% confidence, continuing data collection

**Strategic Implications:**
Organizations demonstrating maturity improvements show statistically significant reductions in calculated risk exposure. Early data supports the exponential decay model for breach probability.`
        },
        {
          title: "Peer Comparison",
          content: `**Your Organization vs. Study Average (Anonymized)**

[Insert organization-specific metrics here]

| Category | Your Org | Study Avg | Percentile |
|----------|----------|-----------|------------|
| Maturity Level | X.X | 2.7 | XXth |
| Control Pass Rate | XX% | 76% | XXth |
| MTTD (hours) | XX | 8.3 | XXth |
| Risk Reduction | XX% | 26% | XXth |

**Recommendations Based on Your Position:**
1. [Personalized recommendation 1]
2. [Personalized recommendation 2]
3. [Personalized recommendation 3]`
        },
        {
          title: "Looking Ahead",
          content: `**Q1 2026 Objectives:**

1. **Complete Participant Recruitment**
   - Target: 60-80 organizations by March 2026
   - Currently at: 52 organizations

2. **Enhance Risk Quantification**
   - Deploy improved Monte Carlo simulation engine
   - Add industry-specific threat scenario libraries

3. **Prepare Interim Findings**
   - 6-month analysis report for all participants
   - Conference submission for preliminary results

**Your Action Items:**
- Schedule Q1 executive briefing call
- Ensure all evidence sources remain connected
- Complete quarterly feedback survey`
        }
      ]
    }
  ];

  const engagementRecords: EngagementRecord[] = [
    {
      organizationId: "org-001",
      organizationName: "First National Bank",
      lastContact: "2026-01-15",
      contactType: "Monthly Check-in",
      nextScheduled: "2026-02-15",
      engagementScore: 92,
      notes: "Very engaged, providing excellent feedback on new features"
    },
    {
      organizationId: "org-002",
      organizationName: "Metro Healthcare System",
      lastContact: "2026-01-10",
      contactType: "Technical Support",
      nextScheduled: "2026-02-10",
      engagementScore: 78,
      notes: "Some challenges with Azure AD integration, resolved"
    },
    {
      organizationId: "org-003",
      organizationName: "TechStart Solutions",
      lastContact: "2026-01-18",
      contactType: "Executive Briefing",
      nextScheduled: "2026-04-18",
      engagementScore: 95,
      notes: "CISO very impressed with ROI calculations, sharing internally"
    },
    {
      organizationId: "org-004",
      organizationName: "Global Manufacturing Inc",
      lastContact: "2025-12-20",
      contactType: "Monthly Check-in",
      nextScheduled: "2026-01-20",
      engagementScore: 65,
      notes: "Lower engagement - schedule follow-up to address concerns"
    },
    {
      organizationId: "org-005",
      organizationName: "Regional Credit Union",
      lastContact: "2026-01-12",
      contactType: "Feature Demo",
      nextScheduled: "2026-02-12",
      engagementScore: 88,
      notes: "Interested in custom reporting capabilities"
    }
  ];

  const audienceChannels = [
    {
      audience: "Participating Organizations",
      icon: Building2,
      channels: [
        { name: "Monthly Newsletters", frequency: "Monthly", status: "active" },
        { name: "Check-in Calls", frequency: "Monthly", status: "active" },
        { name: "Executive Briefings", frequency: "Quarterly", status: "active" },
        { name: "Support Tickets", frequency: "As needed", status: "active" }
      ]
    },
    {
      audience: "Academic Community",
      icon: GraduationCap,
      channels: [
        { name: "Conference Presentations", frequency: "2-3/year", status: "planned" },
        { name: "Research Seminars", frequency: "Quarterly", status: "active" },
        { name: "Working Papers", frequency: "As ready", status: "in_progress" },
        { name: "Dataset Sharing", frequency: "Post-study", status: "planned" }
      ]
    },
    {
      audience: "Practitioner Community",
      icon: Briefcase,
      channels: [
        { name: "Trade Publications", frequency: "Quarterly", status: "planned" },
        { name: "Webinars", frequency: "Bi-annual", status: "planned" },
        { name: "Industry Conferences", frequency: "2-3/year", status: "planned" },
        { name: "Blog Posts", frequency: "Monthly", status: "active" }
      ]
    }
  ];

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const exportNewsletter = (newsletter: NewsletterTemplate) => {
    let content = `# ${newsletter.title}\n\n`;
    newsletter.sections.forEach(section => {
      content += `## ${section.title}\n\n${section.content}\n\n---\n\n`;
    });

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${newsletter.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Newsletter exported" });
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return "text-success bg-success/15";
    if (score >= 60) return "text-warning bg-warning/15";
    return "text-destructive bg-destructive/15";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/15 text-success border-0">Active</Badge>;
      case "in_progress":
        return <Badge className="bg-primary/15 text-primary border-0">In Progress</Badge>;
      case "planned":
        return <Badge variant="secondary">Planned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Stakeholder Communication Hub
          </CardTitle>
          <CardDescription>
            Manage participant newsletters, executive briefings, and stakeholder engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="newsletters">
            <TabsList className="mb-4">
              <TabsTrigger value="newsletters" className="gap-2">
                <FileText className="h-4 w-4" />
                Newsletters
              </TabsTrigger>
              <TabsTrigger value="engagement" className="gap-2">
                <Users className="h-4 w-4" />
                Engagement
              </TabsTrigger>
              <TabsTrigger value="channels" className="gap-2">
                <Send className="h-4 w-4" />
                Channels
              </TabsTrigger>
            </TabsList>

            <TabsContent value="newsletters">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>Select Newsletter</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="january-2026">January 2026 - Monthly Update</SelectItem>
                        <SelectItem value="q4-2025">Q4 2025 - Executive Briefing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-6">
                    <Button 
                      onClick={() => exportNewsletter(newsletterTemplates[selectedMonth === "january-2026" ? 0 : 1])}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[500px] border rounded-lg p-4">
                  {newsletterTemplates
                    .filter(n => 
                      (selectedMonth === "january-2026" && n.id === "monthly-jan") ||
                      (selectedMonth === "q4-2025" && n.id === "quarterly-q4")
                    )
                    .map(newsletter => (
                      <div key={newsletter.id} className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold">{newsletter.title}</h3>
                          <Badge variant="outline">
                            {newsletter.type === "monthly" ? "Monthly" : "Quarterly"}
                          </Badge>
                        </div>
                        
                        {newsletter.sections.map((section, idx) => (
                          <Card key={idx} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-lg">{section.title}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(section.content, `${newsletter.id}-${idx}`)}
                              >
                                {copied === `${newsletter.id}-${idx}` ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {section.content}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ))}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="engagement">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Total Organizations</div>
                    <div className="text-2xl font-bold">52</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Avg Engagement Score</div>
                    <div className="text-2xl font-bold">83.6%</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Contacts This Month</div>
                    <div className="text-2xl font-bold">47</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">At-Risk Participants</div>
                    <div className="text-2xl font-bold text-destructive">3</div>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Participant Engagement Tracker</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {engagementRecords.map((record) => (
                        <div 
                          key={record.organizationId}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getEngagementColor(record.engagementScore)}`}>
                              {record.engagementScore}
                            </div>
                            <div>
                              <div className="font-medium">{record.organizationName}</div>
                              <div className="text-sm text-muted-foreground">
                                Last: {record.contactType} on {record.lastContact}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              Next: {record.nextScheduled}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                              {record.notes}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="channels">
              <div className="grid gap-4 md:grid-cols-3">
                {audienceChannels.map((audience, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <audience.icon className="h-4 w-4" />
                        {audience.audience}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {audience.channels.map((channel, cidx) => (
                          <div 
                            key={cidx}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded"
                          >
                            <div>
                              <div className="text-sm font-medium">{channel.name}</div>
                              <div className="text-xs text-muted-foreground">{channel.frequency}</div>
                            </div>
                            {getStatusBadge(channel.status)}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Communication Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-primary/10 rounded border-l-4 border-primary">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">January Newsletter</div>
                        <div className="text-sm text-muted-foreground">Send to all 52 participants</div>
                      </div>
                      <Badge>Jan 31</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-secondary/50 rounded border-l-4 border-secondary-foreground/30">
                      <Calendar className="h-4 w-4 text-secondary-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">Research Seminar - University</div>
                        <div className="text-sm text-muted-foreground">Present preliminary findings</div>
                      </div>
                      <Badge>Feb 15</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-success/10 rounded border-l-4 border-success">
                      <Calendar className="h-4 w-4 text-success" />
                      <div className="flex-1">
                        <div className="font-medium">Q1 Executive Briefings</div>
                        <div className="text-sm text-muted-foreground">Individual calls with CISOs</div>
                      </div>
                      <Badge>Mar 1-15</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-warning/10 rounded border-l-4 border-warning">
                      <Calendar className="h-4 w-4 text-warning" />
                      <div className="flex-1">
                        <div className="font-medium">RSA Conference Presentation</div>
                        <div className="text-sm text-muted-foreground">Practitioner community engagement</div>
                      </div>
                      <Badge>Apr 2026</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
