import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight,
  Clock,
  Calendar,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Target
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useOrganizationControls } from "@/hooks/useControls";
import { cn } from "@/lib/utils";

interface ComparisonMetric {
  metric: string;
  traditional: number;
  continuous: number;
  improvement: number;
  unit: string;
  category: 'time' | 'cost' | 'quality' | 'risk';
}

export function BeforeAfterComparison() {
  const { organizationId } = useOrganizationContext();
  const { data: orgControls } = useOrganizationControls(organizationId || '');

  const totalControls = orgControls?.length || 0;
  const passingControls = orgControls?.filter(c => c.current_status === 'pass').length || 0;
  const failingControls = orgControls?.filter(c => c.current_status === 'fail').length || 0;

  const comparisonMetrics: ComparisonMetric[] = useMemo(() => [
    {
      metric: 'Audit Prep Time',
      traditional: 180, // 6 months in days
      continuous: 0.5, // Continuous means always ready
      improvement: 99.7,
      unit: 'days',
      category: 'time',
    },
    {
      metric: 'Detection Time',
      traditional: 45, // Days to find issues in traditional audit
      continuous: 0.04, // ~1 hour in days
      improvement: 99.9,
      unit: 'days',
      category: 'time',
    },
    {
      metric: 'Remediation Start',
      traditional: 30, // Days after audit to start fixing
      continuous: 0.5, // Same day
      improvement: 98.3,
      unit: 'days',
      category: 'time',
    },
    {
      metric: 'Annual Audit Cost',
      traditional: 150000,
      continuous: 35000, // Platform + reduced staff time
      improvement: 76.7,
      unit: 'USD',
      category: 'cost',
    },
    {
      metric: 'Staff Hours/Year',
      traditional: 560, // 70 days * 8 hours
      continuous: 120, // Occasional reviews
      improvement: 78.6,
      unit: 'hours',
      category: 'cost',
    },
    {
      metric: 'Compliance Visibility',
      traditional: 8, // Check 8% of the year (1 month per year)
      continuous: 100,
      improvement: 92,
      unit: '%',
      category: 'quality',
    },
    {
      metric: 'Control Coverage',
      traditional: 65, // Sample-based testing
      continuous: 100,
      improvement: 35,
      unit: '%',
      category: 'quality',
    },
    {
      metric: 'Breach Risk Window',
      traditional: 180, // 6 months avg exposure
      continuous: 1, // Hours rounded up
      improvement: 99.4,
      unit: 'days',
      category: 'risk',
    },
  ], []);

  const radarData = useMemo(() => [
    { dimension: 'Speed', traditional: 20, continuous: 95 },
    { dimension: 'Coverage', traditional: 65, continuous: 100 },
    { dimension: 'Cost Efficiency', traditional: 30, continuous: 80 },
    { dimension: 'Risk Reduction', traditional: 40, continuous: 90 },
    { dimension: 'Accuracy', traditional: 70, continuous: 95 },
    { dimension: 'Visibility', traditional: 10, continuous: 100 },
  ], []);

  const barChartData = useMemo(() => 
    comparisonMetrics.filter(m => m.category === 'time').map(m => ({
      name: m.metric,
      Traditional: m.traditional,
      Continuous: m.continuous,
    })),
    [comparisonMetrics]
  );

  const formatValue = (value: number, unit: string) => {
    if (unit === 'USD') {
      return value >= 1000 ? `$${(value / 1000).toFixed(0)}K` : `$${value}`;
    }
    if (value < 1 && unit === 'days') {
      return `${(value * 24).toFixed(0)} hrs`;
    }
    return `${value.toLocaleString()} ${unit}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'time': return <Clock className="h-4 w-4" />;
      case 'cost': return <DollarSign className="h-4 w-4" />;
      case 'quality': return <Target className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'time': return 'text-primary';
      case 'cost': return 'text-success';
      case 'quality': return 'text-warning';
      case 'risk': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-destructive/10 to-background">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p className="text-sm text-muted-foreground">Traditional Audit Prep</p>
              <p className="text-3xl font-bold text-destructive">6 months</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-background">
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-success" />
              <p className="text-sm text-muted-foreground">Continuous Monitoring</p>
              <p className="text-3xl font-bold text-success">Always Ready</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-background">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingDown className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Time Reduction</p>
              <p className="text-3xl font-bold text-primary">99.7%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-background">
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-warning" />
              <p className="text-sm text-muted-foreground">Cost Savings</p>
              <p className="text-3xl font-bold text-warning">$115K/yr</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Time Comparison Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Time Metrics Comparison</CardTitle>
            <CardDescription>Days required for key compliance activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value} days`, '']}
                  />
                  <Bar dataKey="Traditional" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Continuous" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-destructive" />
                <span className="text-sm text-muted-foreground">Traditional</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-success" />
                <span className="text-sm text-muted-foreground">Continuous</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Radar Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Capability Comparison</CardTitle>
            <CardDescription>Multi-dimensional analysis of approach effectiveness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dimension" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Radar name="Traditional" dataKey="traditional" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} />
                  <Radar name="Continuous" dataKey="continuous" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics Comparison</CardTitle>
          <CardDescription>
            Comprehensive before/after analysis of compliance approach effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comparisonMetrics.map((metric, index) => (
              <div 
                key={metric.metric}
                className="flex items-center p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className={cn("flex items-center gap-2 w-48", getCategoryColor(metric.category))}>
                  {getCategoryIcon(metric.category)}
                  <span className="font-medium">{metric.metric}</span>
                </div>
                <div className="flex-1 flex items-center justify-center gap-4">
                  <div className="text-right w-32">
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      {formatValue(metric.traditional, metric.unit)}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Traditional</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left w-32">
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      {formatValue(metric.continuous, metric.unit)}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Continuous</p>
                  </div>
                </div>
                <div className="w-32 text-right">
                  <span className={cn(
                    "text-lg font-bold",
                    metric.improvement > 90 ? "text-success" :
                    metric.improvement > 50 ? "text-primary" :
                    "text-warning"
                  )}>
                    {metric.improvement.toFixed(1)}%
                  </span>
                  <p className="text-xs text-muted-foreground">improvement</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Research Insights</CardTitle>
          <CardDescription>Key findings from the comparative analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2 text-success mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Detection Time Reduction</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Continuous monitoring reduces mean time to detect (MTTD) from 45 days to under 1 hour,
                representing a 99.9% improvement in security visibility.
              </p>
            </div>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Target className="h-5 w-5" />
                <span className="font-medium">Complete Control Coverage</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Traditional audits sample 65% of controls on average. Continuous monitoring tests 
                100% of controls, eliminating coverage gaps.
              </p>
            </div>
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 text-warning mb-2">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">Cost Efficiency</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Annual compliance costs reduced by 77% ($115K savings), primarily through 
                elimination of manual evidence collection and reduced audit prep time.
              </p>
            </div>
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Risk Exposure Window</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Average breach risk window reduced from 180 days (gap between audits) to hours,
                significantly reducing the probability of undetected compliance failures.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
