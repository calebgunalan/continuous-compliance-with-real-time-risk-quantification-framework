import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { generateControlVectors, analyzeTopology } from "@/lib/persistentHomology";

export function TopologicalCoverageAnalyzer() {
  const analysis = useMemo(() => {
    const { vectors } = generateControlVectors(15, 20, 4);
    return analyzeTopology(vectors);
  }, []);

  const persistenceDiagram = useMemo(() =>
    analysis.intervals
      .filter(i => i.death !== Infinity && i.persistence > 0.01)
      .map((interval, idx) => ({
        id: idx,
        birth: Math.round(interval.birth * 1000) / 1000,
        death: Math.round(interval.death * 1000) / 1000,
        dim: interval.dimension,
        persistence: Math.round(interval.persistence * 1000) / 1000,
      })),
    [analysis.intervals]
  );

  const bettiData = useMemo(() =>
    analysis.bettiCurve.filter((_, i) => i % 2 === 0),
    [analysis.bettiCurve]
  );

  const ctiColor = analysis.cti < 0.05 ? 'text-success' : analysis.cti < 0.15 ? 'text-primary' : analysis.cti < 0.3 ? 'text-warning' : 'text-destructive';
  const ctiBg = analysis.cti < 0.05 ? 'bg-success/15' : analysis.cti < 0.15 ? 'bg-primary/15' : analysis.cti < 0.3 ? 'bg-warning/15' : 'bg-destructive/15';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Topological Coverage Analysis (PHCC)</CardTitle>
          <div className={`rounded-lg px-3 py-1 ${ctiBg}`}>
            <span className={`text-sm font-bold ${ctiColor}`}>CTI: {analysis.cti.toFixed(3)}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Persistent homology detects multi-dimensional coverage gaps
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Controls</p>
            <p className="text-sm font-bold text-foreground">{analysis.numControls}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">H₀ features</p>
            <p className="text-sm font-bold text-foreground">{analysis.h0Count}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">H₁ holes</p>
            <p className="text-sm font-bold text-warning">{analysis.h1Count}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Significant</p>
            <p className="text-sm font-bold text-destructive">{analysis.significantHoles.length}</p>
          </div>
        </div>

        {/* Persistence Diagram */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Persistence Diagram (birth vs death)</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" dataKey="birth" fontSize={10} stroke="hsl(var(--muted-foreground))" name="Birth" />
                <YAxis type="number" dataKey="death" fontSize={10} stroke="hsl(var(--muted-foreground))" name="Death" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                <Scatter data={persistenceDiagram.filter(d => d.dim === 0)} fill="hsl(var(--primary))" name="H₀ (components)" />
                <Scatter data={persistenceDiagram.filter(d => d.dim === 1)} fill="hsl(var(--destructive))" name="H₁ (holes)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Betti curve */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Betti Numbers vs Filtration</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bettiData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="epsilon" fontSize={10} stroke="hsl(var(--muted-foreground))" label={{ value: 'ε', position: 'bottom', offset: -5, fontSize: 10 }} />
                <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="stepAfter" dataKey="beta0" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="β₀" />
                <Line type="stepAfter" dataKey="beta1" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="β₁" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{analysis.interpretation}</p>
      </CardContent>
    </Card>
  );
}
