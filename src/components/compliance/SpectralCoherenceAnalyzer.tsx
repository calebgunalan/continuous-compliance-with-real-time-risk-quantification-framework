import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis } from "recharts";
import { Layers, Eye, Target } from "lucide-react";
import {
  runSpectralAnalysis,
  generateSyntheticControlSeries,
  type SpectralAnalysis,
} from "@/lib/spectralRiskCoherence";

export function SpectralCoherenceAnalyzer() {
  const [analysis, setAnalysis] = useState<SpectralAnalysis | null>(null);

  const runAnalysis = () => {
    const series = generateSyntheticControlSeries(12, 60);
    const result = runSpectralAnalysis(series);
    setAnalysis(result);
  };

  const screeData = useMemo(() => {
    if (!analysis) return [];
    const total = analysis.eigenvalues.reduce((a, b) => a + b, 0);
    let cumulative = 0;
    return analysis.eigenvalues.slice(0, 10).map((ev, i) => {
      cumulative += ev;
      return {
        pc: `PC${i + 1}`,
        eigenvalue: Math.round(ev * 100) / 100,
        varianceExplained: Math.round((ev / total) * 1000) / 10,
        cumulative: Math.round((cumulative / total) * 1000) / 10,
      };
    });
  }, [analysis]);

  const redundancyData = useMemo(() => {
    if (!analysis) return [];
    return analysis.redundancyScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(r => ({
        control: r.controlId,
        redundancy: Math.round(r.score * 100),
        correlatedWith: r.mostCorrelatedWith,
      }));
  }, [analysis]);

  const getSRCIColor = (srci: number) => {
    if (srci >= 0.7) return "text-success";
    if (srci >= 0.4) return "text-warning";
    return "text-destructive";
  };

  const getSRCILabel = (srci: number) => {
    if (srci >= 0.7) return "Good Coverage";
    if (srci >= 0.4) return "Moderate Redundancy";
    return "High Redundancy";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Spectral Risk Coherence Analysis</CardTitle>
          </div>
          <Button size="sm" onClick={runAnalysis}>
            {analysis ? "Recalculate" : "Run Analysis"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Eigendecomposition of control correlation matrix to measure portfolio diversity
        </p>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-8 text-muted-foreground">
            Click "Run Analysis" to perform spectral decomposition on control pass/fail time series
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">SRCI</p>
                <p className={`text-2xl font-bold ${getSRCIColor(analysis.srci)}`}>
                  {analysis.srci.toFixed(3)}
                </p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {getSRCILabel(analysis.srci)}
                </Badge>
              </div>
              <div className="rounded-lg bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Effective Dimensions</p>
                <p className="text-2xl font-bold text-foreground">
                  {analysis.effectiveDimensionality.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">of {analysis.eigenvalues.length} controls</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Clusters Found</p>
                <p className="text-2xl font-bold text-foreground">
                  {analysis.controlClusters.length}
                </p>
                <p className="text-xs text-muted-foreground">correlated groups</p>
              </div>
            </div>

            {/* Scree Plot */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Eigenvalue Scree Plot
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={screeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="pc" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number, name: string) => [name === 'varianceExplained' ? `${v}%` : v, name === 'varianceExplained' ? 'Variance' : 'Eigenvalue']} />
                    <Bar dataKey="varianceExplained" name="Variance %" radius={[4, 4, 0, 0]}>
                      {screeData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "hsl(var(--destructive))" : i < 3 ? "hsl(var(--warning))" : "hsl(var(--primary))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Redundancy Scores */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Control Redundancy Ranking
              </h4>
              <div className="space-y-2">
                {redundancyData.map((r) => (
                  <div key={r.control} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-20">{r.control}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${r.redundancy}%`,
                          backgroundColor: r.redundancy > 70 ? "hsl(var(--destructive))" : r.redundancy > 40 ? "hsl(var(--warning))" : "hsl(var(--success))",
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-10 text-right">{r.redundancy}%</span>
                    <span className="text-xs text-muted-foreground">↔ {r.correlatedWith}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clusters */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Correlated Control Clusters</h4>
              <div className="space-y-2">
                {analysis.controlClusters.map((cluster) => (
                  <div key={cluster.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">Cluster {cluster.id}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {(cluster.varianceExplained * 100).toFixed(1)}% variance
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cluster.controls.map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Principal Controls */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Principal Controls (Highest Influence)</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.principalControls.map((c) => (
                  <Badge key={c} className="bg-primary/20 text-primary">{c}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
