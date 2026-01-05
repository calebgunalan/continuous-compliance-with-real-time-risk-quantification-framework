import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreachIncidentTracker } from "@/components/research/BreachIncidentTracker";
import { CorrelationValidator } from "@/components/research/CorrelationValidator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FlaskConical, 
  TrendingDown, 
  Clock, 
  Users,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function ResearchValidationPage() {
  // Mock hypothesis validation status
  const hypotheses = [
    {
      id: "H1",
      title: "Maturity-Breach Correlation",
      description: "Higher maturity = lower breach probability (exponential decay)",
      status: "in_progress",
      confidence: 72,
      sampleSize: 45,
      targetSampleSize: 60,
      pValue: 0.023,
    },
    {
      id: "H2", 
      title: "Detection Time Improvement",
      description: "Continuous monitoring reduces MTTD from months to hours",
      status: "validated",
      confidence: 94,
      sampleSize: 38,
      targetSampleSize: 30,
      pValue: 0.001,
    },
    {
      id: "H3",
      title: "Decision Quality Enhancement", 
      description: "Risk quantification improves executive resource allocation",
      status: "in_progress",
      confidence: 65,
      sampleSize: 22,
      targetSampleSize: 40,
      pValue: 0.078,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validated":
        return <Badge className="bg-success/15 text-success border-0">Validated</Badge>;
      case "in_progress":
        return <Badge className="bg-warning/15 text-warning border-0">In Progress</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/15 text-destructive border-0">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 text-primary mb-2">
          <FlaskConical className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Research Validation</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Hypothesis Testing & Validation
        </h1>
        <p className="mt-1 text-muted-foreground">
          Track empirical validation of research hypotheses with real-world data
        </p>
      </div>

      {/* Hypothesis Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {hypotheses.map((h, index) => (
          <Card key={h.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono">{h.id}</Badge>
                {getStatusBadge(h.status)}
              </div>
              <CardTitle className="text-lg mt-2">{h.title}</CardTitle>
              <CardDescription className="text-sm">{h.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Confidence</span>
                  <span className="font-semibold">{h.confidence}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      h.confidence >= 80 ? 'bg-success' : 
                      h.confidence >= 60 ? 'bg-warning' : 'bg-destructive'
                    }`}
                    style={{ width: `${h.confidence}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{h.sampleSize}/{h.targetSampleSize} samples</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {h.pValue < 0.05 ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-warning" />
                    )}
                    <span className={h.pValue < 0.05 ? 'text-success' : 'text-muted-foreground'}>
                      p={h.pValue.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="incidents" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="incidents" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Breach Incidents
          </TabsTrigger>
          <TabsTrigger value="correlation" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Correlation Analysis
          </TabsTrigger>
          <TabsTrigger value="detection" className="gap-2">
            <Clock className="h-4 w-4" />
            Detection Time
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="animate-fade-in">
          <BreachIncidentTracker />
        </TabsContent>

        <TabsContent value="correlation" className="animate-fade-in">
          <CorrelationValidator />
        </TabsContent>

        <TabsContent value="detection" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Detection Time Analysis
              </CardTitle>
              <CardDescription>
                Compare mean time to detect (MTTD) between continuous monitoring and periodic audits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Detection time analysis will be populated as control failures are tracked over time.</p>
                <p className="text-sm mt-2">Track failures in the Compliance Controls section to generate data.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
