import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Badge } from "@/components/ui/badge";
import type { ControlState } from "@/lib/complianceEntropy";
import { analyzeRenyiSpectrum } from "@/lib/renyiEntropySpectrum";

interface RenyiEntropySpectrumProps {
  controlStates: ControlState[];
}

export function RenyiEntropySpectrum({ controlStates }: RenyiEntropySpectrumProps) {
  const analysis = useMemo(() => analyzeRenyiSpectrum(controlStates), [controlStates]);

  const chartData = useMemo(() => {
    return analysis.spectrum.filter((_, i) => i % 3 === 0 || i === analysis.spectrum.length - 1).map(p => ({
      alpha: p.alpha,
      Current: Math.round(p.normalizedEntropy * 1000) / 1000,
      Uniform: Math.round(analysis.uniformSpectrum[analysis.spectrum.indexOf(p)]?.normalizedEntropy * 1000 || 1000) / 1000,
      Concentrated: Math.round(analysis.concentratedSpectrum[analysis.spectrum.indexOf(p)]?.normalizedEntropy * 1000 || 0) / 1000,
    }));
  }, [analysis]);

  const segColor = analysis.seg < 0.3 ? 'text-warning' : analysis.seg < 0.8 ? 'text-primary' : analysis.seg <= 1 ? 'text-success' : 'text-destructive';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Rényi Entropy Spectrum (RESC)</CardTitle>
          <Badge variant="outline" className={segColor}>
            SEG: {analysis.seg.toFixed(2)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Generalized information-theoretic compliance fingerprint
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key entropy values */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'H₀ (Hartley)', value: analysis.keyEntropies.hartley, desc: 'States occupied' },
            { label: 'H₁ (Shannon)', value: analysis.keyEntropies.shannon, desc: 'Average surprise' },
            { label: 'H₂ (Collision)', value: analysis.keyEntropies.collision, desc: 'Collision prob.' },
            { label: 'H∞ (Min)', value: analysis.keyEntropies.minEntropy, desc: 'Worst-case' },
          ].map(e => (
            <div key={e.label} className="rounded-lg bg-muted/30 p-2 text-center">
              <p className="text-xs text-muted-foreground">{e.label}</p>
              <p className="text-lg font-bold text-foreground">{e.value.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">{e.desc}</p>
            </div>
          ))}
        </div>

        {/* Spectrum chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="alpha" fontSize={10} stroke="hsl(var(--muted-foreground))" label={{ value: 'α', position: 'bottom', offset: -5, fontSize: 10 }} />
              <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" domain={[0, 1.1]} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
              <Line type="monotone" dataKey="Current" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Uniform" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="Concentrated" stroke="hsl(var(--destructive))" strokeWidth={1} strokeDasharray="4 4" dot={false} />
              <ReferenceLine x={1} stroke="hsl(var(--warning))" strokeDasharray="2 2" label={{ value: "Shannon", fontSize: 9, fill: "hsl(var(--warning))" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-muted-foreground">{analysis.interpretation}</p>
      </CardContent>
    </Card>
  );
}
