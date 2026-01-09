import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  ClipboardList, 
  Users, 
  Calendar, 
  Clock,
  Save,
  Download,
  CheckCircle2,
  MessageSquare,
  Building,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";

interface InterviewSection {
  id: string;
  title: string;
  duration: string;
  questions: {
    id: string;
    question: string;
    probes?: string[];
    notes?: string;
  }[];
}

export function InterviewGuide() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("monthly");

  const monthlyCheckIn: InterviewSection[] = [
    {
      id: "usage",
      title: "System Usage & Adoption",
      duration: "5-7 min",
      questions: [
        {
          id: "m1",
          question: "How frequently have you or your team accessed the compliance dashboard this month?",
          probes: ["Daily, weekly, or less?", "Who on your team uses it most?", "What triggers them to check it?"]
        },
        {
          id: "m2",
          question: "Which features have been most valuable in your daily operations?",
          probes: ["Control status monitoring?", "Risk quantification?", "Alerts and notifications?"]
        },
        {
          id: "m3",
          question: "Have you encountered any technical issues or barriers to using the system?",
          probes: ["Integration problems?", "Performance issues?", "Usability challenges?"]
        }
      ]
    },
    {
      id: "value",
      title: "Value Perception",
      duration: "5-7 min",
      questions: [
        {
          id: "m4",
          question: "Compared to your previous compliance approach, how would you describe the value of continuous monitoring?",
          probes: ["Time savings?", "Better visibility?", "Earlier detection of issues?"]
        },
        {
          id: "m5",
          question: "Have there been any 'aha moments' where the system surfaced something you wouldn't have caught otherwise?",
          probes: ["Control failures?", "Configuration drift?", "Access anomalies?"]
        }
      ]
    },
    {
      id: "decisions",
      title: "Decision Impact",
      duration: "5-7 min",
      questions: [
        {
          id: "m6",
          question: "Has the risk quantification data influenced any resource allocation or investment decisions this month?",
          probes: ["Budget requests?", "Project prioritization?", "Tool purchases?"]
        },
        {
          id: "m7",
          question: "How have executives or board members responded to the quantified risk metrics?",
          probes: ["More engaged?", "Asking different questions?", "Requesting regular updates?"]
        }
      ]
    }
  ];

  const quarterlyReview: InterviewSection[] = [
    {
      id: "strategic",
      title: "Strategic Impact Assessment",
      duration: "10-12 min",
      questions: [
        {
          id: "q1",
          question: "Looking at the past quarter, how has continuous compliance monitoring changed your security program's operations?",
          probes: ["Team workflows?", "Meeting cadences?", "Reporting practices?"]
        },
        {
          id: "q2",
          question: "Have you made any significant process changes based on insights from the system?",
          probes: ["New procedures?", "Changed responsibilities?", "Automated responses?"]
        },
        {
          id: "q3",
          question: "How has your organization's security posture evolved over the quarter?",
          probes: ["Maturity improvements?", "Control coverage?", "Risk reduction?"]
        }
      ]
    },
    {
      id: "executive",
      title: "Executive & Board Engagement",
      duration: "8-10 min",
      questions: [
        {
          id: "q4",
          question: "Describe how executive/board engagement with security metrics has changed.",
          probes: ["Meeting frequency?", "Types of questions asked?", "Level of detail requested?"]
        },
        {
          id: "q5",
          question: "Have you been able to justify security investments more effectively using quantified data?",
          probes: ["Specific examples?", "Budget approval rates?", "Speed of decisions?"]
        },
        {
          id: "q6",
          question: "What metrics resonate most with your executive stakeholders?",
          probes: ["Financial risk exposure?", "Breach probability?", "ROI projections?"]
        }
      ]
    },
    {
      id: "audit",
      title: "Audit & Compliance Experience",
      duration: "8-10 min",
      questions: [
        {
          id: "q7",
          question: "If you've had any audits this quarter, how did continuous monitoring affect your preparation?",
          probes: ["Time spent?", "Evidence gathering?", "Auditor feedback?"]
        },
        {
          id: "q8",
          question: "Have you noticed any changes in regulatory compliance confidence?",
          probes: ["Gap awareness?", "Remediation speed?", "Documentation quality?"]
        }
      ]
    }
  ];

  const exitInterview: InterviewSection[] = [
    {
      id: "journey",
      title: "Participant Journey Reflection",
      duration: "15-20 min",
      questions: [
        {
          id: "e1",
          question: "Thinking back to when you started, what were your initial expectations for this study?",
          probes: ["Goals?", "Concerns?", "Hopes?"]
        },
        {
          id: "e2",
          question: "How did your experience compare to those initial expectations?",
          probes: ["Exceeded?", "Met?", "Fell short?", "Unexpected benefits?"]
        },
        {
          id: "e3",
          question: "Walk me through the most significant changes your organization experienced during the study.",
          probes: ["Security posture?", "Team capabilities?", "Executive engagement?"]
        }
      ]
    },
    {
      id: "outcomes",
      title: "Measurable Outcomes",
      duration: "10-15 min",
      questions: [
        {
          id: "e4",
          question: "What concrete improvements can you point to as a result of participating?",
          probes: ["Time savings?", "Cost reductions?", "Risk reductions?", "Incident prevention?"]
        },
        {
          id: "e5",
          question: "How has your maturity level changed from the beginning to now?",
          probes: ["Specific domains?", "Control pass rates?", "Process maturity?"]
        },
        {
          id: "e6",
          question: "If you could quantify the ROI of participating, what would you estimate?",
          probes: ["Time saved?", "Incidents avoided?", "Better investments?"]
        }
      ]
    },
    {
      id: "challenges",
      title: "Challenges & Lessons Learned",
      duration: "10-12 min",
      questions: [
        {
          id: "e7",
          question: "What were the biggest challenges you faced during the study?",
          probes: ["Technical?", "Organizational?", "Resource constraints?"]
        },
        {
          id: "e8",
          question: "What would you do differently if you were starting over?",
          probes: ["Preparation?", "Team involvement?", "Executive buy-in?"]
        },
        {
          id: "e9",
          question: "What advice would you give to an organization considering this approach?",
          probes: ["Prerequisites?", "Success factors?", "Pitfalls to avoid?"]
        }
      ]
    },
    {
      id: "future",
      title: "Future Plans & Recommendations",
      duration: "5-8 min",
      questions: [
        {
          id: "e10",
          question: "Do you plan to continue using continuous compliance monitoring after the study?",
          probes: ["Same system?", "Different approach?", "Expanded scope?"]
        },
        {
          id: "e11",
          question: "Would you recommend this approach to peer organizations?",
          probes: ["Which types?", "With what caveats?", "For what use cases?"]
        },
        {
          id: "e12",
          question: "Is there anything else you'd like to share about your experience?",
          probes: ["Insights?", "Suggestions?", "Testimonial?"]
        }
      ]
    }
  ];

  const handleNoteChange = (questionId: string, value: string) => {
    setNotes(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSaveNotes = () => {
    // In production, this would save to the database
    toast.success("Interview notes saved successfully!");
  };

  const handleExportNotes = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      interviewType: activeTab,
      notes
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-notes-${activeTab}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Interview notes exported!");
  };

  const renderInterviewGuide = (sections: InterviewSection[], type: string) => (
    <div className="space-y-6">
      {/* Interview Header */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Total: {sections.reduce((acc, s) => acc + parseInt(s.duration), 0)}-
                  {sections.reduce((acc, s) => acc + parseInt(s.duration.split('-')[1] || s.duration), 0)} min
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">
                  {sections.reduce((acc, s) => acc + s.questions.length, 0)} questions
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveNotes} className="gap-2">
                <Save className="h-4 w-4" />
                Save Notes
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportNotes} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participant Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="h-4 w-4" />
            Participant Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Organization</label>
              <Textarea 
                placeholder="Organization name..."
                value={notes[`${type}_org`] || ""}
                onChange={(e) => handleNoteChange(`${type}_org`, e.target.value)}
                rows={1}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Interviewee</label>
              <Textarea 
                placeholder="Name and role..."
                value={notes[`${type}_interviewee`] || ""}
                onChange={(e) => handleNoteChange(`${type}_interviewee`, e.target.value)}
                rows={1}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Textarea 
                placeholder="Interview date..."
                value={notes[`${type}_date`] || ""}
                onChange={(e) => handleNoteChange(`${type}_date`, e.target.value)}
                rows={1}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Sections */}
      <Accordion type="multiple" className="space-y-4">
        {sections.map((section, sectionIndex) => (
          <AccordionItem key={section.id} value={section.id} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono">
                  {sectionIndex + 1}
                </Badge>
                <span className="font-semibold">{section.title}</span>
                <Badge variant="secondary" className="text-xs">
                  {section.duration}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-4">
                {section.questions.map((q, qIndex) => (
                  <div key={q.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex-shrink-0">
                        {qIndex + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{q.question}</p>
                        {q.probes && (
                          <div className="mt-2 pl-4 border-l-2 border-muted">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Follow-up probes:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {q.probes.map((probe, i) => (
                                <li key={i}>• {probe}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-9">
                      <Textarea
                        placeholder="Capture key points, quotes, and observations..."
                        value={notes[q.id] || ""}
                        onChange={(e) => handleNoteChange(q.id, e.target.value)}
                        rows={3}
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Summary Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Interview Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Key Themes & Insights</label>
            <Textarea
              placeholder="Main themes that emerged during the interview..."
              value={notes[`${type}_themes`] || ""}
              onChange={(e) => handleNoteChange(`${type}_themes`, e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Notable Quotes</label>
            <Textarea
              placeholder="Capture verbatim quotes for potential use in publications..."
              value={notes[`${type}_quotes`] || ""}
              onChange={(e) => handleNoteChange(`${type}_quotes`, e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Action Items & Follow-ups</label>
            <Textarea
              placeholder="Any follow-up items or actions needed..."
              value={notes[`${type}_actions`] || ""}
              onChange={(e) => handleNoteChange(`${type}_actions`, e.target.value)}
              rows={2}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle>Structured Interview Guides</CardTitle>
          </div>
          <CardDescription>
            Standardized interview protocols for consistent qualitative data collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">Monthly Check-ins</span>
              </div>
              <p className="text-sm text-muted-foreground">
                15-20 minute calls covering usage, value perception, and decision impact
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="font-medium">Quarterly Reviews</span>
              </div>
              <p className="text-sm text-muted-foreground">
                30-40 minute deep dives into strategic impact and executive engagement
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">Exit Interviews</span>
              </div>
              <p className="text-sm text-muted-foreground">
                45-60 minute comprehensive review of the entire study experience
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="monthly" className="gap-2">
            <Calendar className="h-4 w-4" />
            Monthly Check-in
          </TabsTrigger>
          <TabsTrigger value="quarterly" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Quarterly Review
          </TabsTrigger>
          <TabsTrigger value="exit" className="gap-2">
            <Users className="h-4 w-4" />
            Exit Interview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          {renderInterviewGuide(monthlyCheckIn, "monthly")}
        </TabsContent>

        <TabsContent value="quarterly">
          {renderInterviewGuide(quarterlyReview, "quarterly")}
        </TabsContent>

        <TabsContent value="exit">
          {renderInterviewGuide(exitInterview, "exit")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
