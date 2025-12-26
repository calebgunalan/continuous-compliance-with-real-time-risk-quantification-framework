import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Building2,
  Users
} from "lucide-react";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useControlsPassRate } from "@/hooks/useControls";

interface BenchmarkData {
  metric: string;
  yourValue: number;
  industryAvg: number;
  topQuartile: number;
  unit: string;
}

// Simulated industry benchmark data by industry
const industryBenchmarks: Record<string, BenchmarkData[]> = {
  'financial_services': [
    { metric: 'Control Pass Rate', yourValue: 0, industryAvg: 78, topQuartile: 92, unit: '%' },
    { metric: 'MTTD (hours)', yourValue: 4.2, industryAvg: 8.5, topQuartile: 2.1, unit: 'h' },
    { metric: 'Compliance Score', yourValue: 0, industryAvg: 82, topQuartile: 95, unit: '%' },
    { metric: 'Risk Exposure (M)', yourValue: 0, industryAvg: 450, topQuartile: 180, unit: '$M' },
  ],
  'healthcare': [
    { metric: 'Control Pass Rate', yourValue: 0, industryAvg: 72, topQuartile: 88, unit: '%' },
    { metric: 'MTTD (hours)', yourValue: 4.2, industryAvg: 12.3, topQuartile: 3.5, unit: 'h' },
    { metric: 'Compliance Score', yourValue: 0, industryAvg: 75, topQuartile: 91, unit: '%' },
    { metric: 'Risk Exposure (M)', yourValue: 0, industryAvg: 320, topQuartile: 150, unit: '$M' },
  ],
  'technology': [
    { metric: 'Control Pass Rate', yourValue: 0, industryAvg: 82, topQuartile: 94, unit: '%' },
    { metric: 'MTTD (hours)', yourValue: 4.2, industryAvg: 6.2, topQuartile: 1.8, unit: 'h' },
    { metric: 'Compliance Score', yourValue: 0, industryAvg: 85, topQuartile: 96, unit: '%' },
    { metric: 'Risk Exposure (M)', yourValue: 0, industryAvg: 280, topQuartile: 120, unit: '$M' },
  ],
  'default': [
    { metric: 'Control Pass Rate', yourValue: 0, industryAvg: 75, topQuartile: 90, unit: '%' },
    { metric: 'MTTD (hours)', yourValue: 4.2, industryAvg: 10, topQuartile: 3, unit: 'h' },
    { metric: 'Compliance Score', yourValue: 0, industryAvg: 78, topQuartile: 92, unit: '%' },
    { metric: 'Risk Exposure (M)', yourValue: 0, industryAvg: 380, topQuartile: 160, unit: '$M' },
  ],
};

export function IndustryBenchmark() {
  const { organizationId } = useOrganizationContext();
  const { data: organization } = useOrganization(organizationId || '');
  const { data: passRate } = useControlsPassRate(organizationId || '');

  const industry = organization?.industry?.toLowerCase().replace(/\s+/g, '_') || 'default';
  const benchmarks = useMemo(() => {
    const base = industryBenchmarks[industry] || industryBenchmarks['default'];
    // Update with actual values
    return base.map(b => {
      if (b.metric === 'Control Pass Rate' || b.metric === 'Compliance Score') {
        return { ...b, yourValue: passRate || 0 };
      }
      if (b.metric === 'Risk Exposure (M)') {
        return { ...b, yourValue: (organization?.current_risk_exposure || 0) / 1000000 };
      }
      return b;
    });
  }, [industry, passRate, organization]);

  const getComparison = (yours: number, avg: number, isLowerBetter: boolean) => {
    const diff = yours - avg;
    const percentDiff = avg !== 0 ? (diff / avg) * 100 : 0;
    
    if (isLowerBetter) {
      if (diff < -10) return { status: 'better', icon: TrendingUp, color: 'text-success' };
      if (diff > 10) return { status: 'worse', icon: TrendingDown, color: 'text-destructive' };
    } else {
      if (diff > 5) return { status: 'better', icon: TrendingUp, color: 'text-success' };
      if (diff < -5) return { status: 'worse', icon: TrendingDown, color: 'text-destructive' };
    }
    return { status: 'similar', icon: Minus, color: 'text-muted-foreground' };
  };

  const chartData = benchmarks.map(b => ({
    name: b.metric.split(' ')[0],
    you: b.yourValue,
    industry: b.industryAvg,
    top: b.topQuartile,
  }));

  const organizationCount = 73; // Simulated study participants

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Industry Benchmark</CardTitle>
              <CardDescription>Compare against anonymized peer data</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Building2 className="h-3 w-3" />
            {organization?.industry || 'All Industries'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Peer Count */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Comparing against <span className="font-medium text-foreground">{organizationCount}</span> organizations in your industry
          </span>
        </div>

        {/* Bar Chart Comparison */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={70} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="you" name="You" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="industry" name="Industry Avg" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="top" name="Top Quartile" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-primary" />
            <span className="text-muted-foreground">Your Organization</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-muted-foreground" />
            <span className="text-muted-foreground">Industry Average</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-success" />
            <span className="text-muted-foreground">Top Quartile</span>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-3">
          {benchmarks.map((benchmark, idx) => {
            const isLowerBetter = benchmark.metric.includes('MTTD') || benchmark.metric.includes('Risk');
            const comparison = getComparison(benchmark.yourValue, benchmark.industryAvg, isLowerBetter);
            const ComparisonIcon = comparison.icon;
            
            return (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div>
                  <p className="text-sm font-medium">{benchmark.metric}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      Industry: {benchmark.industryAvg}{benchmark.unit}
                    </span>
                    <span className="text-xs text-success">
                      Top: {benchmark.topQuartile}{benchmark.unit}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {benchmark.yourValue.toFixed(benchmark.unit === 'h' ? 1 : 0)}{benchmark.unit}
                  </span>
                  <ComparisonIcon className={`h-4 w-4 ${comparison.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Percentile Ranking */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20">
          <p className="text-sm font-medium mb-2">Your Percentile Ranking</p>
          <div className="flex items-center gap-3">
            <Progress value={65} className="flex-1 h-3" />
            <span className="text-lg font-bold text-primary">65th</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            You're performing better than 65% of organizations in your industry
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
