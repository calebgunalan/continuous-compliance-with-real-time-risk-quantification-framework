import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { ControlState } from "@/lib/complianceEntropy";
import { analyzeOptimalTransport } from "@/lib/wassersteinCompliance";

interface OptimalTransportAnalyzerProps {
  controlStates: ControlState[];
  riskWeights?: number[];
}

export function OptimalTransportAnalyzer({ controlStates, riskWeights }: OptimalTransportAnalyzerProps) {
  const analysis = useMemo(() => analyzeOptimalTransport(controlStates, riskWeights), [controlStates, riskWeights]);

  const distChartData = analysis.stateLabels.map((label, i) => ({
    state: label,
    Current: Math.round(analysis.currentDistribution[i] * 100),
    Target: Math.round(analysis.targetDistribution[i] * 100),
  }));

  const gtdColor = analysis.gtd < 0.1 ? 'text-success' : analysis.gtd < 0.3 ? 'text-primary' : analysis.gtd < 0.6 ? 'text-warning' : 'text-destructive';
  const gtdBg = analysis.gtd < 0.1 ? 'bg-success/15' : analysis.gtd < 0.3 ? 'bg-primary/15' : analysis.gtd < 0.6 ? 'bg-warning/15' : 'bg-destructive/15';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Wasserstein Optimal Transport (WOTCD)</CardTitle>
          <div className={`rounded-lg px-3 py-1 ${gtdBg}`}>
            <span className={`text-sm font-bold ${gtdColor}`}>GTD: {analysis.gtd.toFixed(3)}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Earth Mover's Distance between current and target compliance
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Distribution comparison */}
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="state" fontSize={10} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
              <Bar dataKey="Current" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Target" fill="hsl(var(--success))" radius={[2, 2, 0, 0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transport plan (flows) */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Transport Plan</p>
          {analysis.actionableInsights.slice(0, 4).map((insight, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
              <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'} className="text-[10px]">
                {insight.priority}
              </Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground">{insight.action}</span>
            </div>
          ))}
          {analysis.actionableInsights.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No transport needed — distribution matches target.</p>
          )}
        </div>

        <p className="text-xs text-muted-foreground">{analysis.interpretation}</p>
      </CardContent>
    </Card>
  );
}
