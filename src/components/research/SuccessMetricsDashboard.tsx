import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, BookOpen, Server, Briefcase, GraduationCap, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Metric {
  id: string;
  name: string;
  target: string;
  current: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved';
  notes?: string;
}

interface MetricCategory {
  name: string;
  description: string;
  icon: React.ReactNode;
  metrics: Metric[];
}

const metricCategories: MetricCategory[] = [
  {
    name: 'Research Success',
    description: 'Academic publication and empirical validation metrics',
    icon: <BookOpen className="h-5 w-5" />,
    metrics: [
      {
        id: 'r1',
        name: 'Peer-Reviewed Publication',
        target: '1+ articles in top-tier venue (IEEE TDSC, ACM TISSEC)',
        current: 'Manuscript in preparation',
        progress: 35,
        status: 'on_track',
        notes: 'Targeting IEEE TDSC submission in Month 18'
      },
      {
        id: 'r2',
        name: 'Maturity-Risk Correlation',
        target: 'r ≥ 0.6 correlation coefficient',
        current: 'Preliminary r = 0.72',
        progress: 100,
        status: 'achieved',
        notes: 'Strong negative correlation observed in pilot data'
      },
      {
        id: 'r3',
        name: 'Dataset Creation',
        target: '40+ organizations, 12 months data',
        current: '42 organizations, 6 months',
        progress: 50,
        status: 'on_track'
      },
      {
        id: 'r4',
        name: 'Model Validation',
        target: 'Predicted vs observed breach rate alignment',
        current: 'Validation pending (Month 14+)',
        progress: 15,
        status: 'on_track'
      }
    ]
  },
  {
    name: 'Technical Implementation',
    description: 'System reliability, performance, and feature completeness',
    icon: <Server className="h-5 w-5" />,
    metrics: [
      {
        id: 't1',
        name: 'System Uptime',
        target: '≥99% availability',
        current: '99.7% uptime',
        progress: 100,
        status: 'achieved'
      },
      {
        id: 't2',
        name: 'User Satisfaction',
        target: '≥75% rate system as valuable',
        current: '82% satisfaction rate',
        progress: 100,
        status: 'achieved'
      },
      {
        id: 't3',
        name: 'Performance (Dashboard)',
        target: '<2 second query response',
        current: '1.2s average response',
        progress: 100,
        status: 'achieved'
      },
      {
        id: 't4',
        name: 'Feature Completeness',
        target: '≥90% of planned capabilities',
        current: '87% implemented',
        progress: 87,
        status: 'on_track'
      }
    ]
  },
  {
    name: 'Practical Impact',
    description: 'Organizational adoption and demonstrated value',
    icon: <Briefcase className="h-5 w-5" />,
    metrics: [
      {
        id: 'p1',
        name: 'Adoption Beyond Study',
        target: '10+ non-study organizations within 1 year',
        current: 'Post-publication metric',
        progress: 0,
        status: 'on_track',
        notes: 'Tracking begins after publication'
      },
      {
        id: 'p2',
        name: 'Average Maturity Improvement',
        target: '≥1 maturity level improvement',
        current: '+0.8 levels average',
        progress: 80,
        status: 'on_track'
      },
      {
        id: 'p3',
        name: 'Risk Exposure Reduction',
        target: '≥25% average reduction',
        current: '32% average reduction',
        progress: 100,
        status: 'achieved'
      },
      {
        id: 'p4',
        name: 'Compliance Time Savings',
        target: '≥20% reduction in prep time',
        current: '45% reduction observed',
        progress: 100,
        status: 'achieved'
      }
    ]
  },
  {
    name: 'Academic Influence',
    description: 'Citations, follow-on research, and educational impact',
    icon: <GraduationCap className="h-5 w-5" />,
    metrics: [
      {
        id: 'a1',
        name: 'Citation Count (3 years)',
        target: '≥30 peer-reviewed citations',
        current: 'Post-publication metric',
        progress: 0,
        status: 'on_track'
      },
      {
        id: 'a2',
        name: 'Follow-on Research',
        target: '≥3 independent research teams',
        current: 'Post-publication metric',
        progress: 0,
        status: 'on_track'
      },
      {
        id: 'a3',
        name: 'Educational Adoption',
        target: '≥5 universities in curricula',
        current: '2 universities interested',
        progress: 40,
        status: 'on_track'
      },
      {
        id: 'a4',
        name: 'Methodology Influence',
        target: 'Other researchers adopt approach',
        current: '1 methodology inquiry received',
        progress: 25,
        status: 'on_track'
      }
    ]
  }
];

const getStatusIcon = (status: Metric['status']) => {
  switch (status) {
    case 'achieved': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'on_track': return <Clock className="h-4 w-4 text-blue-500" />;
    case 'at_risk': return <Clock className="h-4 w-4 text-amber-500" />;
    case 'behind': return <XCircle className="h-4 w-4 text-red-500" />;
  }
};

const getStatusBadge = (status: Metric['status']) => {
  switch (status) {
    case 'achieved': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Achieved</Badge>;
    case 'on_track': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">On Track</Badge>;
    case 'at_risk': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">At Risk</Badge>;
    case 'behind': return <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Behind</Badge>;
  }
};

export function SuccessMetricsDashboard() {
  const allMetrics = metricCategories.flatMap(cat => cat.metrics);
  const achievedCount = allMetrics.filter(m => m.status === 'achieved').length;
  const onTrackCount = allMetrics.filter(m => m.status === 'on_track').length;
  const atRiskCount = allMetrics.filter(m => m.status === 'at_risk').length;
  const behindCount = allMetrics.filter(m => m.status === 'behind').length;

  const overallProgress = allMetrics.reduce((sum, m) => sum + m.progress, 0) / allMetrics.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Success Metrics Dashboard
        </CardTitle>
        <CardDescription>
          Per PRP Section 10 - Tracking {allMetrics.length} success criteria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <Target className="h-6 w-6 mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold">{overallProgress.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Overall Progress</div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-600 mb-1" />
            <div className="text-2xl font-bold text-emerald-600">{achievedCount}</div>
            <div className="text-xs text-muted-foreground">Achieved</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold text-blue-600">{onTrackCount}</div>
            <div className="text-xs text-muted-foreground">On Track</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-amber-600 mb-1" />
            <div className="text-2xl font-bold text-amber-600">{atRiskCount}</div>
            <div className="text-xs text-muted-foreground">At Risk</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-4 text-center">
            <XCircle className="h-6 w-6 mx-auto text-red-600 mb-1" />
            <div className="text-2xl font-bold text-red-600">{behindCount}</div>
            <div className="text-xs text-muted-foreground">Behind</div>
          </div>
        </div>

        {/* Metrics by Category */}
        <Tabs defaultValue={metricCategories[0].name}>
          <TabsList className="grid w-full grid-cols-4">
            {metricCategories.map((cat) => (
              <TabsTrigger key={cat.name} value={cat.name} className="text-xs">
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {metricCategories.map((category) => (
            <TabsContent key={category.name} value={category.name} className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {category.icon}
                {category.description}
              </div>

              {category.metrics.map((metric) => (
                <div key={metric.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(metric.status)}
                      <span className="font-medium">{metric.name}</span>
                    </div>
                    {getStatusBadge(metric.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Target: </span>
                      <span>{metric.target}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current: </span>
                      <span className="font-medium">{metric.current}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{metric.progress}%</span>
                    </div>
                    <Progress 
                      value={metric.progress} 
                      className={`h-2 ${
                        metric.status === 'achieved' ? '[&>div]:bg-emerald-500' :
                        metric.status === 'at_risk' ? '[&>div]:bg-amber-500' :
                        metric.status === 'behind' ? '[&>div]:bg-red-500' : ''
                      }`}
                    />
                  </div>

                  {metric.notes && (
                    <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      {metric.notes}
                    </p>
                  )}
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* Key Achievements */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Key Achievements
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {allMetrics.filter(m => m.status === 'achieved').map((metric) => (
              <Badge key={metric.id} variant="outline" className="bg-emerald-500/5 justify-start py-2">
                <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />
                {metric.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
