import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { analyzeOptimalGovernance } from "@/lib/hjbOptimalControl";

export function OptimalGovernanceTrajectory() {
  const analysis = useMemo(() => analyzeOptimalGovernance(2.0, 100000), []);

  const maturityData = useMemo(() => {
    const maxLen = Math.min(analysis.optimalTrajectory.length, analysis.constantTrajectory.length);
    return Array.from({ length: maxLen }, (_, i) => {
      if (i % 2 !== 0 && i !== maxLen - 1) return null;
      return {
        month: Math.round(analysis.optimalTrajectory[i].t * 10) / 10,
        'HJB Optimal': Math.round(analysis.optimalTrajectory[i].maturity * 100) / 100,
        'Constant Invest': Math.round(analysis.constantTrajectory[i].maturity * 100) / 100,
      };
    }).filter(Boolean);
  }, [analysis]);

  const investmentData = useMemo(() => {
    return analysis.optimalTrajectory
      .filter((_, i) => i % 3 === 0)
      .map(p => ({
        month: Math.round(p.t * 10) / 10,
        investment: Math.round(p.investment / 1000),
        risk: Math.round(p.riskExposure / 1000000),
      }));
  }, [analysis]);

  const formatCost = (v: number) => v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">HJB Optimal Governance Trajectory</CardTitle>
          <Badge variant={analysis.savingsPercent > 0 ? 'default' : 'secondary'} className="text-xs">
            {analysis.savingsPercent > 0 ? `${analysis.savingsPercent.toFixed(0)}% savings` : 'Higher maturity'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Stochastic optimal control — mathematically optimal investment path
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cost comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="text-[10px] text-muted-foreground">HJB Optimal Total Cost</p>
            <p className="text-lg font-bold text-primary">{formatCost(analysis.optimalTotalCost)}</p>
          </div>
          <div className="rounded-lg border border-muted bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground">Constant Investment Cost</p>
            <p className="text-lg font-bold text-foreground">{formatCost(analysis.constantTotalCost)}</p>
          </div>
        </div>

        {/* Maturity trajectories */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Maturity Trajectories</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={maturityData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={10} stroke="hsl(var(--muted-foreground))" label={{ value: 'Months', position: 'bottom', offset: -5, fontSize: 10 }} />
                <YAxis domain={[1, 5]} fontSize={10} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="HJB Optimal" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Constant Invest" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Optimal investment rate over time */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Optimal Investment Rate ($K/month)</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={investmentData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v}K`} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                <Line type="monotone" dataKey="investment" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="Investment ($K)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{analysis.interpretation}</p>
      </CardContent>
    </Card>
  );
}
