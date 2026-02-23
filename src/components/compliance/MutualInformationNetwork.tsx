import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Network, Minimize2, Star } from "lucide-react";
import {
  runMutualInformationAnalysis,
  generateSyntheticMIData,
  type MutualInformationAnalysis,
} from "@/lib/mutualInformationCoverage";

export function MutualInformationNetwork() {
  const [analysis, setAnalysis] = useState<MutualInformationAnalysis | null>(null);

  const runAnalysis = () => {
    const data = generateSyntheticMIData(10, 100);
    const result = runMutualInformationAnalysis(data, 5);
    setAnalysis(result);
  };

  const coverageData = useMemo(() => {
    if (!analysis) return [];
    return analysis.coverageGapScores
      .sort((a, b) => b.gapScore - a.gapScore)
      .map(s => ({
        control: s.controlId,
        uniqueness: Math.round(s.gapScore * 100),
        isOptimal: analysis.mrmrOptimalSet.includes(s.controlId),
      }));
  }, [analysis]);

  const topEdges = useMemo(() => {
    if (!analysis) return [];
    return analysis.networkEdges.slice(0, 10);
  }, [analysis]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Mutual Information Coverage Network</CardTitle>
          </div>
          <Button size="sm" onClick={runAnalysis}>
            {analysis ? "Recalculate" : "Run Analysis"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Information-theoretic analysis identifying redundant and unique controls via NMI and mRMR selection
        </p>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-8 text-muted-foreground">
            Click "Run Analysis" to compute mutual information between all control pairs
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Coverage Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {(analysis.totalCoverage * 100).toFixed(0)}%
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Redundancy Clusters</p>
                <p className="text-2xl font-bold text-foreground">{analysis.redundancyClusters.length}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Optimal Set Size</p>
                <p className="text-2xl font-bold text-primary">{analysis.mrmrOptimalSet.length}</p>
              </div>
            </div>

            {/* Coverage Gap Chart */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Minimize2 className="h-4 w-4" />
                Control Uniqueness (Coverage Gap Score)
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coverageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="control" fontSize={10} stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={50} />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Bar dataKey="uniqueness" name="Uniqueness %" radius={[4, 4, 0, 0]}>
                      {coverageData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.isOptimal ? "hsl(var(--primary))" : entry.uniqueness > 50 ? "hsl(var(--success))" : "hsl(var(--warning))"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* mRMR Optimal Set */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                mRMR Optimal Control Set
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Minimum set providing maximum coverage with minimum redundancy
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.mrmrOptimalSet.map((c) => (
                  <Badge key={c} className="bg-primary text-primary-foreground">{c}</Badge>
                ))}
              </div>
            </div>

            {/* Strongest Connections */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Strongest Information Links (NMI)</h4>
              <div className="space-y-1">
                {topEdges.map((edge, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-xs text-muted-foreground w-20">{edge.source}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${edge.nmi * 100}%`, opacity: 0.3 + edge.nmi * 0.7 }}
                      />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground w-20 text-right">{edge.target}</span>
                    <span className="text-xs font-semibold w-12 text-right">{(edge.nmi * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Redundancy Clusters */}
            {analysis.redundancyClusters.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Redundancy Clusters</h4>
                <div className="space-y-2">
                  {analysis.redundancyClusters.map((cluster) => (
                    <div key={cluster.id} className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="border-warning text-warning">
                          Cluster {cluster.id}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Avg NMI: {(cluster.avgNMI * 100).toFixed(0)}%
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
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
