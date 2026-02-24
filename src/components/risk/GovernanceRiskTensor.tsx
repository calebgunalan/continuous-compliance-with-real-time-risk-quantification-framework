import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { generateDemoTensor, tuckerDecomposition } from "@/lib/governanceRiskTensor";

export function GovernanceRiskTensor() {
  const { decomposition, controlLabels, scenarioLabels } = useMemo(() => {
    const demo = generateDemoTensor();
    const decomp = tuckerDecomposition(demo.tensor, [3, 3, 3]);
    return { decomposition: decomp, ...demo };
  }, []);

  const gcsColor = decomposition.gcs > 0.7 ? 'text-success' : decomposition.gcs > 0.4 ? 'text-warning' : 'text-destructive';
  const gcsBg = decomposition.gcs > 0.7 ? 'bg-success/15' : decomposition.gcs > 0.4 ? 'bg-warning/15' : 'bg-destructive/15';

  const controlLoadingData = decomposition.controlLoadings.slice(0, 8).map(l => ({
    name: controlLabels[l.index] || `C${l.index}`,
    loading: Math.round(l.loading * 1000) / 1000,
  }));

  const scenarioLoadingData = decomposition.scenarioLoadings.slice(0, 5).map(l => ({
    name: scenarioLabels[l.index] || `S${l.index}`,
    loading: Math.round(l.loading * 1000) / 1000,
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Governance Risk Tensor (UGRT)</CardTitle>
          <div className={`rounded-lg px-3 py-1 ${gcsBg}`}>
            <span className={`text-sm font-bold ${gcsColor}`}>GCS: {decomposition.gcs.toFixed(3)}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Tucker decomposition reveals latent risk factors across controls × time × scenarios
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Core tensor info */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Core shape</p>
            <p className="text-sm font-bold text-foreground">{decomposition.coreShape.join('×')}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Coherence</p>
            <p className={`text-sm font-bold ${gcsColor}`}>{(decomposition.gcs * 100).toFixed(1)}%</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Latent factors</p>
            <p className="text-sm font-bold text-foreground">{decomposition.coreShape.reduce((a, b) => a + b, 0)}</p>
          </div>
        </div>

        {/* Control mode loadings */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Control-Mode Factor Loadings</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={controlLoadingData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={9} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                <Bar dataKey="loading" radius={[3, 3, 0, 0]}>
                  {controlLoadingData.map((_, i) => (
                    <Cell key={i} fill={i < 3 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} opacity={i < 3 ? 1 : 0.4} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scenario mode loadings */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Scenario-Mode Factor Loadings</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioLoadingData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" fontSize={9} stroke="hsl(var(--muted-foreground))" width={80} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
                <Bar dataKey="loading" fill="hsl(var(--warning))" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {decomposition.gcs > 0.6
            ? 'Governance is well-structured — few latent factors explain most risk variance. Investment can be focused.'
            : 'Governance is fragmented — risk is driven by many independent factors. Broad-spectrum improvement needed.'}
        </p>
      </CardContent>
    </Card>
  );
}
