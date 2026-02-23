import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { GitBranch, Clock, TrendingUp } from "lucide-react";
import {
  runMarkovAnalysis,
  generateSyntheticObservations,
  STATES,
  type MarkovAnalysis,
} from "@/lib/complianceMarkovChain";

const STATE_COLORS: Record<string, string> = {
  pass: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  fail: "hsl(var(--destructive))",
  not_tested: "hsl(var(--muted-foreground))",
};

const STATE_LABELS: Record<string, string> = {
  pass: "Pass",
  warning: "Warning",
  fail: "Fail",
  not_tested: "Not Tested",
};

export function MarkovSteadyStatePredictor() {
  const [analysis, setAnalysis] = useState<MarkovAnalysis | null>(null);

  const runAnalysis = () => {
    const observations = generateSyntheticObservations(25);
    const result = runMarkovAnalysis(observations);
    setAnalysis(result);
  };

  const steadyStateData = useMemo(() => {
    if (!analysis) return [];
    return STATES.map((state, i) => ({
      name: STATE_LABELS[state],
      value: Math.round(analysis.steadyStateDistribution[i] * 1000) / 10,
      fill: STATE_COLORS[state],
    }));
  }, [analysis]);

  const meanTimeData = useMemo(() => {
    if (!analysis) return [];
    return STATES.map((state, i) => ({
      name: STATE_LABELS[state],
      hours: Math.min(500, Math.round(analysis.meanTimeInState[i] * 10) / 10),
      fill: STATE_COLORS[state],
    }));
  }, [analysis]);

  const transientLabels = ["24h", "72h", "1 week", "1 month"];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Markov Steady-State Predictor</CardTitle>
          </div>
          <Button size="sm" onClick={runAnalysis}>
            {analysis ? "Recalculate" : "Run Analysis"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Continuous-time Markov chain model predicting long-term control state distribution
        </p>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-8 text-muted-foreground">
            Click "Run Analysis" to compute steady-state predictions from control transition data
          </div>
        ) : (
          <div className="space-y-6">
            {/* Steady-State Distribution */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Steady-State Distribution (π)
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                If current governance practices continue unchanged, controls will converge to:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={steadyStateData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={70} strokeWidth={2}>
                        {steadyStateData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 flex flex-col justify-center">
                  {steadyStateData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.fill }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mean Time in State */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Mean Sojourn Time (hours)
              </h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={meanTimeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" width={80} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                      {meanTimeData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transient Probabilities */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Transient Probabilities (starting from Pass)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 text-left text-muted-foreground font-medium">Time</th>
                      {STATES.map(s => (
                        <th key={s} className="py-2 text-right text-muted-foreground font-medium">{STATE_LABELS[s]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.transientProbabilities.map((probs, t) => (
                      <tr key={t} className="border-b border-border/50">
                        <td className="py-2 font-medium text-foreground">{transientLabels[t]}</td>
                        {probs.map((p, i) => (
                          <td key={i} className="py-2 text-right">
                            <span className="font-mono" style={{ color: STATE_COLORS[STATES[i]] }}>
                              {(p * 100).toFixed(1)}%
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MTTF */}
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Mean Time to Failure</p>
                  <p className="text-xs text-muted-foreground">Expected hours from Pass to Fail state</p>
                </div>
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  {analysis.meanTimeToFailure.toFixed(0)}h
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
