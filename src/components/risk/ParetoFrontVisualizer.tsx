import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar } from "recharts";
import { Maximize2, Target, Zap } from "lucide-react";
import {
  runNSGAII,
  generateSampleInvestments,
  type ParetoAnalysis,
} from "@/lib/paretoOptimizer";

export function ParetoFrontVisualizer() {
  const [analysis, setAnalysis] = useState<ParetoAnalysis | null>(null);
  const [budget, setBudget] = useState(1000000);
  const baselineRisk = 50000000;

  const runOptimization = () => {
    const controls = generateSampleInvestments();
    const result = runNSGAII(controls, baselineRisk, budget, 70, 80, 60);
    setAnalysis(result);
  };

  const scatterData = useMemo(() => {
    if (!analysis) return [];
    return analysis.paretoFront.map((s, i) => ({
      cost: Math.round(s.objectives.totalCost / 1000),
      risk: Math.round(s.objectives.residualRisk / 1000000),
      time: s.objectives.implementationTime,
      isKnee: analysis.kneePoint?.id === s.id,
      id: i,
    }));
  }, [analysis]);

  const kneeControls = useMemo(() => {
    if (!analysis?.kneePoint) return [];
    return analysis.controlInvestments
      .map((c, i) => ({ ...c, selected: analysis.kneePoint!.selectedControls[i] }))
      .filter(c => c.selected);
  }, [analysis]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Multi-Objective Pareto Optimizer</CardTitle>
          </div>
          <Button size="sm" onClick={runOptimization}>
            {analysis ? "Re-optimize" : "Run NSGA-II"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          NSGA-II genetic algorithm finding Pareto-optimal governance investment portfolios
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground">
            Budget Constraint: ${(budget / 1000000).toFixed(1)}M
          </label>
          <Slider
            value={[budget]}
            onValueChange={([v]) => setBudget(v)}
            min={200000}
            max={3000000}
            step={50000}
            className="mt-2"
          />
        </div>

        {!analysis ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Set budget and click "Run NSGA-II" to find Pareto-optimal investment portfolios
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Pareto Solutions</p>
                <p className="text-xl font-bold text-foreground">{analysis.paretoFront.length}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Hypervolume</p>
                <p className="text-xl font-bold text-foreground">{(analysis.hypervolumeIndicator * 100).toFixed(1)}%</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Generations</p>
                <p className="text-xl font-bold text-foreground">{analysis.generations}</p>
              </div>
            </div>

            {/* Pareto Front Scatter */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Pareto Front: Cost vs. Residual Risk
              </h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="cost" name="Cost ($K)" fontSize={11} stroke="hsl(var(--muted-foreground))" label={{ value: "Cost ($K)", position: "bottom", offset: -5, fontSize: 10 }} />
                    <YAxis dataKey="risk" name="Risk ($M)" fontSize={11} stroke="hsl(var(--muted-foreground))" label={{ value: "Risk ($M)", angle: -90, position: "insideLeft", fontSize: 10 }} />
                    <Tooltip formatter={(v: number, name: string) => [name === 'Cost ($K)' ? `$${v}K` : `$${v}M`, name]} />
                    <Scatter data={scatterData} fill="hsl(var(--primary))">
                      {scatterData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.isKnee ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                          r={entry.isKnee ? 8 : 5}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Knee Point Recommendation */}
            {analysis.kneePoint && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Recommended Portfolio (Knee Point)
                </h4>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Residual Risk</p>
                    <p className="text-lg font-bold text-foreground">
                      ${(analysis.kneePoint.objectives.residualRisk / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Investment</p>
                    <p className="text-lg font-bold text-foreground">
                      ${(analysis.kneePoint.objectives.totalCost / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Timeline</p>
                    <p className="text-lg font-bold text-foreground">
                      {analysis.kneePoint.objectives.implementationTime} months
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {kneeControls.map((c) => (
                    <Badge key={c.id} variant="secondary" className="text-xs">
                      {c.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
