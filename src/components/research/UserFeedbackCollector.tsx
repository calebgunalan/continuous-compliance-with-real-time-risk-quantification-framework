import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  ThumbsDown,
  Send,
  CheckCircle2,
  TrendingUp,
  Clock,
  Users,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

interface FeedbackQuestion {
  id: string;
  category: string;
  question: string;
  type: "rating" | "scale" | "multiselect" | "text";
  options?: string[];
  required: boolean;
}

export function UserFeedbackCollector() {
  const [activeTab, setActiveTab] = useState("monthly");
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const monthlyQuestions: FeedbackQuestion[] = [
    {
      id: "m1",
      category: "System Usage",
      question: "How often did you access the compliance dashboard this month?",
      type: "scale",
      options: ["Daily", "2-3 times/week", "Weekly", "Rarely", "Never"],
      required: true
    },
    {
      id: "m2",
      category: "System Usage",
      question: "Which features did you use most frequently?",
      type: "multiselect",
      options: ["Control status monitoring", "Risk quantification dashboard", "Remediation workflow", "Reports generation", "Threat scenario modeling", "Evidence collection status"],
      required: true
    },
    {
      id: "m3",
      category: "Value Perception",
      question: "How would you rate the value of continuous compliance monitoring vs your previous approach?",
      type: "rating",
      required: true
    },
    {
      id: "m4",
      category: "Decision Making",
      question: "Did the risk quantification data influence any resource allocation decisions this month?",
      type: "scale",
      options: ["Significantly influenced", "Somewhat influenced", "Slightly influenced", "Not at all", "Not applicable"],
      required: true
    },
    {
      id: "m5",
      category: "Improvements",
      question: "What improvements would make the system more valuable for your daily work?",
      type: "text",
      required: false
    }
  ];

  const quarterlyQuestions: FeedbackQuestion[] = [
    {
      id: "q1",
      category: "Strategic Impact",
      question: "Has the continuous compliance approach changed how your organization views security investment?",
      type: "scale",
      options: ["Transformative change", "Significant change", "Moderate change", "Minimal change", "No change"],
      required: true
    },
    {
      id: "q2",
      category: "Executive Engagement",
      question: "How has executive/board engagement with security metrics changed?",
      type: "scale",
      options: ["Much more engaged", "Somewhat more engaged", "No change", "Somewhat less engaged", "Much less engaged"],
      required: true
    },
    {
      id: "q3",
      category: "Audit Experience",
      question: "Compared to previous audits, how has preparation time changed?",
      type: "scale",
      options: ["Reduced 75%+", "Reduced 50-75%", "Reduced 25-50%", "Reduced <25%", "No change", "Increased"],
      required: true
    },
    {
      id: "q4",
      category: "Risk Awareness",
      question: "Rate your confidence in understanding your organization's actual risk exposure (1-10)",
      type: "rating",
      required: true
    },
    {
      id: "q5",
      category: "Process Changes",
      question: "Describe any significant process changes you've made based on continuous monitoring insights.",
      type: "text",
      required: false
    },
    {
      id: "q6",
      category: "Business Case",
      question: "Have you been able to justify security investments more effectively using quantified risk data?",
      type: "scale",
      options: ["Much more effectively", "Somewhat more effectively", "About the same", "Less effectively", "N/A - haven't tried"],
      required: true
    }
  ];

  const exitQuestions: FeedbackQuestion[] = [
    {
      id: "e1",
      category: "Overall Value",
      question: "Overall, how would you rate your experience with the continuous compliance framework?",
      type: "rating",
      required: true
    },
    {
      id: "e2",
      category: "Recommendation",
      question: "How likely are you to recommend this approach to peer organizations? (NPS)",
      type: "rating",
      required: true
    },
    {
      id: "e3",
      category: "Key Benefits",
      question: "What were the most valuable aspects of participating in this study?",
      type: "multiselect",
      options: ["Real-time visibility into compliance status", "Financial risk quantification", "Reduced audit preparation time", "Better executive communication", "Faster issue detection", "Improved security posture", "Data-driven investment decisions"],
      required: true
    },
    {
      id: "e4",
      category: "Challenges",
      question: "What were the biggest challenges you faced?",
      type: "multiselect",
      options: ["Technical integration complexity", "Staff training/adoption", "Data quality issues", "Executive buy-in", "Time commitment", "Interpreting results", "Process changes"],
      required: true
    },
    {
      id: "e5",
      category: "Continuation",
      question: "Do you plan to continue using this approach after the study concludes?",
      type: "scale",
      options: ["Definitely yes", "Probably yes", "Undecided", "Probably no", "Definitely no"],
      required: true
    },
    {
      id: "e6",
      category: "Testimonial",
      question: "Please share any comments or a brief testimonial about your experience.",
      type: "text",
      required: false
    }
  ];

  const handleResponse = (questionId: string, value: string | string[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMultiSelect = (questionId: string, option: string, checked: boolean) => {
    const current = (responses[questionId] as string[]) || [];
    if (checked) {
      handleResponse(questionId, [...current, option]);
    } else {
      handleResponse(questionId, current.filter(o => o !== option));
    }
  };

  const handleSubmit = (surveyType: string) => {
    setSubmitted(prev => ({ ...prev, [surveyType]: true }));
    toast.success(`${surveyType.charAt(0).toUpperCase() + surveyType.slice(1)} feedback submitted successfully!`);
  };

  const renderQuestion = (question: FeedbackQuestion) => {
    switch (question.type) {
      case "rating":
        return (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
              <Button
                key={rating}
                size="sm"
                variant={responses[question.id] === String(rating) ? "default" : "outline"}
                onClick={() => handleResponse(question.id, String(rating))}
                className="w-8 h-8 p-0"
              >
                {rating}
              </Button>
            ))}
          </div>
        );

      case "scale":
        return (
          <RadioGroup
            value={responses[question.id] as string}
            onValueChange={(value) => handleResponse(question.id, value)}
          >
            <div className="space-y-2">
              {question.options?.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                  <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "multiselect":
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={((responses[question.id] as string[]) || []).includes(option)}
                  onCheckedChange={(checked) => handleMultiSelect(question.id, option, checked as boolean)}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case "text":
        return (
          <Textarea
            placeholder="Enter your response..."
            value={(responses[question.id] as string) || ""}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            rows={3}
          />
        );

      default:
        return null;
    }
  };

  const renderSurvey = (questions: FeedbackQuestion[], surveyType: string, icon: React.ReactNode, title: string, description: string) => {
    if (submitted[surveyType]) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Thank You!</h3>
              <p className="text-muted-foreground">Your {title.toLowerCase()} has been recorded.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSubmitted(prev => ({ ...prev, [surveyType]: false }));
                  questions.forEach(q => {
                    setResponses(prev => {
                      const { [q.id]: _, ...rest } = prev;
                      return rest;
                    });
                  });
                }}
              >
                Submit Another Response
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {index + 1}
                  </Badge>
                  <div className="flex-1">
                    <Label className="text-base font-medium">
                      {question.question}
                      {question.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {question.category}
                    </Badge>
                  </div>
                </div>
                <div className="ml-8">
                  {renderQuestion(question)}
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => handleSubmit(surveyType)} className="gap-2">
                <Send className="h-4 w-4" />
                Submit Feedback
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Total Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <ThumbsUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">8.4</p>
                <p className="text-sm text-muted-foreground">Avg. Satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">72</p>
                <p className="text-sm text-muted-foreground">NPS Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">48</p>
                <p className="text-sm text-muted-foreground">Active Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Survey Forms */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="monthly" className="gap-2">
            <Clock className="h-4 w-4" />
            Monthly Check-in
          </TabsTrigger>
          <TabsTrigger value="quarterly" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Quarterly Review
          </TabsTrigger>
          <TabsTrigger value="exit" className="gap-2">
            <Star className="h-4 w-4" />
            Exit Survey
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          {renderSurvey(
            monthlyQuestions,
            "monthly",
            <Clock className="h-5 w-5 text-primary" />,
            "Monthly Check-in Survey",
            "Quick monthly feedback on system usage and value perception (5-10 minutes)"
          )}
        </TabsContent>

        <TabsContent value="quarterly">
          {renderSurvey(
            quarterlyQuestions,
            "quarterly",
            <BarChart3 className="h-5 w-5 text-primary" />,
            "Quarterly Executive Review",
            "Deeper assessment of strategic impact and organizational changes (15-20 minutes)"
          )}
        </TabsContent>

        <TabsContent value="exit">
          {renderSurvey(
            exitQuestions,
            "exit",
            <Star className="h-5 w-5 text-primary" />,
            "Study Exit Survey",
            "Final comprehensive feedback for research documentation (20-30 minutes)"
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
