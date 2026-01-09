import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Beaker, 
  CheckCircle2, 
  DollarSign, 
  Shield, 
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  FileText
} from "lucide-react";
import { toast } from "sonner";

interface DecisionScenario {
  id: string;
  title: string;
  description: string;
  context: string;
  traditionalData?: {
    complianceStatus: string;
    riskRating: string;
    auditFindings: number;
  };
  quantifiedData?: {
    riskExposure: number;
    breachProbability: number;
    expectedROI: number;
    paybackMonths: number;
  };
  options: {
    id: string;
    label: string;
    investment: number;
    description: string;
  }[];
}

export function DecisionExperiment() {
  const [experimentGroup, setExperimentGroup] = useState<"A" | "B" | null>(null);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [responses, setResponses] = useState<Record<string, { choice: string; confidence: number; reasoning: string }>>({});
  const [selectedChoice, setSelectedChoice] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(3);
  const [reasoning, setReasoning] = useState("");
  const [experimentComplete, setExperimentComplete] = useState(false);

  const scenarios: DecisionScenario[] = [
    {
      id: "scenario_1",
      title: "Identity Access Management Investment",
      description: "Your organization needs to improve privileged access controls.",
      context: "Current state: Basic access controls with manual reviews quarterly. Executive pressure to reduce risk exposure.",
      traditionalData: {
        complianceStatus: "Partial Compliance",
        riskRating: "High",
        auditFindings: 12
      },
      quantifiedData: {
        riskExposure: 4200000,
        breachProbability: 0.23,
        expectedROI: 312,
        paybackMonths: 8
      },
      options: [
        { id: "a", label: "Basic MFA Rollout", investment: 150000, description: "Deploy MFA for privileged accounts only" },
        { id: "b", label: "Comprehensive IAM Platform", investment: 450000, description: "Full identity governance with PAM integration" },
        { id: "c", label: "Maintain Current State", investment: 25000, description: "Continue manual reviews, minor improvements" },
        { id: "d", label: "Phased Implementation", investment: 280000, description: "MFA now, full platform in 18 months" }
      ]
    },
    {
      id: "scenario_2",
      title: "Security Monitoring Enhancement",
      description: "Board requests improved threat detection capabilities.",
      context: "Recent industry peers experienced breaches. Current SIEM captures 40% of critical events.",
      traditionalData: {
        complianceStatus: "Non-Compliant",
        riskRating: "Critical",
        auditFindings: 24
      },
      quantifiedData: {
        riskExposure: 8500000,
        breachProbability: 0.45,
        expectedROI: 425,
        paybackMonths: 6
      },
      options: [
        { id: "a", label: "Upgrade Existing SIEM", investment: 200000, description: "Add detection rules, increase retention" },
        { id: "b", label: "Next-Gen XDR Platform", investment: 750000, description: "AI-powered detection with auto-response" },
        { id: "c", label: "Managed Detection Service", investment: 480000, description: "24/7 SOC-as-a-service with dedicated analysts" },
        { id: "d", label: "Hybrid Approach", investment: 550000, description: "Enhanced SIEM plus managed threat hunting" }
      ]
    },
    {
      id: "scenario_3",
      title: "Data Protection Program",
      description: "Customer data protection requirements increasing due to new regulations.",
      context: "GDPR-like regulations coming to your primary market. Current encryption coverage at 60%.",
      traditionalData: {
        complianceStatus: "At Risk",
        riskRating: "High",
        auditFindings: 18
      },
      quantifiedData: {
        riskExposure: 12000000,
        breachProbability: 0.18,
        expectedROI: 580,
        paybackMonths: 4
      },
      options: [
        { id: "a", label: "Encryption Expansion", investment: 180000, description: "Encrypt remaining data at rest and in transit" },
        { id: "b", label: "Full DLP Implementation", investment: 650000, description: "Data loss prevention across all channels" },
        { id: "c", label: "Privacy Platform", investment: 420000, description: "Automated data discovery, classification, protection" },
        { id: "d", label: "Minimal Compliance", investment: 90000, description: "Meet minimum regulatory requirements only" }
      ]
    }
  ];

  const startExperiment = (group: "A" | "B") => {
    setExperimentGroup(group);
    setCurrentScenario(0);
    setResponses({});
  };

  const handleNext = () => {
    if (!selectedChoice) {
      toast.error("Please select an option before continuing");
      return;
    }

    setResponses(prev => ({
      ...prev,
      [scenarios[currentScenario].id]: {
        choice: selectedChoice,
        confidence,
        reasoning
      }
    }));

    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(prev => prev + 1);
      setSelectedChoice("");
      setConfidence(3);
      setReasoning("");
    } else {
      setExperimentComplete(true);
      toast.success("Experiment completed! Thank you for participating.");
    }
  };

  const handlePrevious = () => {
    if (currentScenario > 0) {
      setCurrentScenario(prev => prev - 1);
      const prevResponse = responses[scenarios[currentScenario - 1].id];
      if (prevResponse) {
        setSelectedChoice(prevResponse.choice);
        setConfidence(prevResponse.confidence);
        setReasoning(prevResponse.reasoning);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!experimentGroup) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-primary" />
              <CardTitle>Decision Quality Experiment</CardTitle>
            </div>
            <CardDescription>
              A/B study comparing decision-making with traditional vs quantified risk data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Experiment Protocol</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Participants are randomly assigned to one of two groups:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-background p-4 rounded-lg border">
                    <Badge className="mb-2">Group A</Badge>
                    <h4 className="font-medium">Traditional Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Compliance status, risk ratings (High/Medium/Low), audit findings count
                    </p>
                  </div>
                  <div className="bg-background p-4 rounded-lg border">
                    <Badge variant="secondary" className="mb-2">Group B</Badge>
                    <h4 className="font-medium">Quantified Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Financial risk exposure, breach probability, expected ROI, payback period
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground">Select experiment group to begin:</p>
                <div className="flex gap-4">
                  <Button onClick={() => startExperiment("A")} variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Start Group A (Traditional)
                  </Button>
                  <Button onClick={() => startExperiment("B")} className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Start Group B (Quantified)
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (experimentComplete) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <CardTitle>Experiment Complete</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                <h3 className="font-semibold text-success mb-2">Thank You!</h3>
                <p className="text-sm text-muted-foreground">
                  Your responses have been recorded for Group {experimentGroup} ({experimentGroup === "A" ? "Traditional" : "Quantified"} data).
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Your Responses Summary</h4>
                {scenarios.map(scenario => {
                  const response = responses[scenario.id];
                  const selectedOption = scenario.options.find(o => o.id === response?.choice);
                  return (
                    <div key={scenario.id} className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium">{scenario.title}</h5>
                          <p className="text-sm text-muted-foreground">
                            Choice: {selectedOption?.label} ({formatCurrency(selectedOption?.investment || 0)})
                          </p>
                        </div>
                        <Badge variant="outline">Confidence: {response?.confidence}/5</Badge>
                      </div>
                      {response?.reasoning && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{response.reasoning}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button onClick={() => {
                setExperimentGroup(null);
                setExperimentComplete(false);
                setCurrentScenario(0);
                setResponses({});
                setSelectedChoice("");
                setConfidence(3);
                setReasoning("");
              }} variant="outline">
                Run Another Experiment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scenario = scenarios[currentScenario];
  const progress = ((currentScenario) / scenarios.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-primary" />
              <CardTitle>Decision Scenario {currentScenario + 1} of {scenarios.length}</CardTitle>
            </div>
            <Badge variant={experimentGroup === "A" ? "outline" : "secondary"}>
              Group {experimentGroup}: {experimentGroup === "A" ? "Traditional" : "Quantified"}
            </Badge>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Scenario Description */}
            <div>
              <h3 className="text-lg font-semibold">{scenario.title}</h3>
              <p className="text-muted-foreground">{scenario.description}</p>
              <p className="text-sm text-muted-foreground mt-2 italic">{scenario.context}</p>
            </div>

            {/* Data Display Based on Group */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Available Information</h4>
              
              {experimentGroup === "A" && scenario.traditionalData && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Compliance Status</p>
                    <Badge variant={scenario.traditionalData.complianceStatus === "Non-Compliant" ? "destructive" : "outline"}>
                      {scenario.traditionalData.complianceStatus}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Risk Rating</p>
                    <div className="flex items-center justify-center gap-1">
                      <AlertTriangle className={`h-4 w-4 ${
                        scenario.traditionalData.riskRating === "Critical" ? "text-destructive" :
                        scenario.traditionalData.riskRating === "High" ? "text-warning" : "text-muted-foreground"
                      }`} />
                      <span className="font-semibold">{scenario.traditionalData.riskRating}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Audit Findings</p>
                    <p className="font-semibold">{scenario.traditionalData.auditFindings} issues</p>
                  </div>
                </div>
              )}

              {experimentGroup === "B" && scenario.quantifiedData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Risk Exposure</p>
                    <p className="font-semibold text-destructive">
                      {formatCurrency(scenario.quantifiedData.riskExposure)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Breach Probability</p>
                    <p className="font-semibold">{(scenario.quantifiedData.breachProbability * 100).toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Expected ROI</p>
                    <p className="font-semibold text-success">{scenario.quantifiedData.expectedROI}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Payback Period</p>
                    <p className="font-semibold">{scenario.quantifiedData.paybackMonths} months</p>
                  </div>
                </div>
              )}
            </div>

            {/* Investment Options */}
            <div>
              <h4 className="font-medium mb-3">Investment Options</h4>
              <RadioGroup value={selectedChoice} onValueChange={setSelectedChoice}>
                <div className="grid gap-3">
                  {scenario.options.map(option => (
                    <div 
                      key={option.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                        selectedChoice === option.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            {formatCurrency(option.investment)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Confidence Rating */}
            <div>
              <h4 className="font-medium mb-3">How confident are you in this decision?</h4>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Not confident</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <Button
                      key={level}
                      size="sm"
                      variant={confidence === level ? "default" : "outline"}
                      onClick={() => setConfidence(level)}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">Very confident</span>
              </div>
            </div>

            {/* Reasoning */}
            <div>
              <h4 className="font-medium mb-2">Brief reasoning (optional)</h4>
              <Textarea
                placeholder="What factors influenced your decision?"
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                rows={2}
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentScenario === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleNext} className="gap-2">
                {currentScenario === scenarios.length - 1 ? "Complete" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
