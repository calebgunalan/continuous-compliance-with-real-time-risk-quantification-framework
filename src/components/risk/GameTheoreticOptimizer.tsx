import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";
import { Swords, Shield, TrendingDown } from "lucide-react";
import {
  runGameTheoreticAnalysis,
  generateSampleTargets,
  type GameAnalysis,
} from "@/lib/gameTheoreticAllocation";

export function GameTheoreticOptimizer() {
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [budget, setBudget] = useState(800000);

  const runOptimization = () => {
    const targets = generateSampleTargets();
    const result = runGameTheoreticAnalysis(targets, budget);
    setAnalysis(result);
  };

  const allocationData = useMemo(() => {
    if (!analysis) return [];
    return analysis.targets.map((t, i) => ({
      target: t.name.split(" ").slice(0, 2).join(" "),
      defender: Math.round(analysis.equilibrium.defenderAllocation[i] * 100),
      attacker: Math.round(analysis.equilibrium.attackerStrategy[i] * 100),
    }));
  }, [analysis]);

  const attackSurfaceData = useMemo(() => {
    if (!analysis) return [];
    return analysis.attackSurface.map(a => ({
      target: a.targetName.split(" ").slice(0, 2).join(" "),
      undefended: Math.round(a.undefendedRisk / 1000000),
      defended: Math.round(a.defendedRisk / 1000000),
    }));
  }, [analysis]);

  const sensitivityData = useMemo(() => {
    if (!analysis) return [];
    return analysis.sensitivityData.map(s => ({
      budget: `${(s.budgetFraction * 100).toFixed(0)}%`,
      risk: Math.round(s.defenderRisk / 1000000),
    }));
  }, [analysis]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Game-Theoretic Control Allocation</CardTitle>
          </div>
          <Button size="sm" onClick={runOptimization}>
            {analysis ? "Recalculate" : "Solve Equilibrium"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Stackelberg game model optimizing defender allocation against strategic adversaries
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground">
            Defense Budget: ${(budget / 1000).toFixed(0)}K
          </label>
          <Slider
            value={[budget]}
            onValueChange={([v]) => setBudget(v)}
            min={200000}
            max={2000000}
            step={50000}
            className="mt-2"
          />
        </div>

        {!analysis ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Set budget and click "Solve Equilibrium" to compute Stackelberg game solution
          </div>
        ) : (
          <div className="space-y-6">
            {/* Equilibrium Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-primary" />
                  <p className="text-xs font-medium text-foreground">Defender Risk</p>
                </div>
                <p className="text-xl font-bold text-foreground">
                  ${(analysis.equilibrium.totalRiskAtEquilibrium / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Swords className="h-4 w-4 text-destructive" />
                  <p className="text-xs font-medium text-foreground">Attacker Payoff</p>
                </div>
                <p className="text-xl font-bold text-foreground">
                  ${(analysis.equilibrium.attackerPayoff / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>

            {/* Stackelberg Advantage */}
            <div className="rounded-lg border border-success/30 bg-success/5 p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Stackelberg Advantage over Nash</p>
                <p className="text-xs text-muted-foreground">Risk reduction from first-mover advantage</p>
              </div>
              <Badge className="bg-success text-success-foreground text-lg px-3">
                {analysis.equilibrium.nashComparison.stackelbergAdvantage.toFixed(1)}%
              </Badge>
            </div>

            {/* Strategy Allocation */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Equilibrium Strategies</h4>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={allocationData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="target" width={90} fontSize={10} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Bar dataKey="defender" name="Defender %" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="attacker" name="Attacker %" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Budget Sensitivity */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Budget Sensitivity
              </h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensitivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="budget" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => `$${v}M`} />
                    <Line type="monotone" dataKey="risk" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attack Surface */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Attack Surface Reduction</h4>
              <div className="space-y-2">
                {analysis.attackSurface.map((a) => (
                  <div key={a.targetId} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 truncate">{a.targetName}</span>
                    <div className="flex-1 h-2 bg-destructive/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-success"
                        style={{ width: `${a.reductionPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-10 text-right">{a.reductionPercent.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
