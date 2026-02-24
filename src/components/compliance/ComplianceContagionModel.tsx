import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { analyzeContagion } from "@/lib/complianceContagion";

interface ComplianceContagionModelProps {
  totalControls?: number;
  passingControls?: number;
  failingControls?: number;
}

export function ComplianceContagionModel({
  totalControls = 50,
  passingControls = 35,
  failingControls = 10,
}: ComplianceContagionModelProps) {
  const [betaMultiplier, setBetaMultiplier] = useState(1.0);
  const remediatedControls = totalControls - passingControls - failingControls;

  const analysis = useMemo(() => {
    const base = analyzeContagion(totalControls, passingControls, failingControls, remediatedControls);
    if (betaMultiplier !== 1.0) {
      return analyzeContagion(totalControls, passingControls, Math.round(failingControls * betaMultiplier), remediatedControls);
    }
    return base;
  }, [totalControls, passingControls, failingControls, remediatedControls, betaMultiplier]);

  const chartData = useMemo(() =>
    analysis.trajectory
      .filter((_, i) => i % 2 === 0)
      .map(p => ({
        t: Math.round(p.t),
        Compliant: Math.round(p.S),
        'Non-Compliant': Math.round(p.I),
        Remediated: Math.round(p.R),
      })),
    [analysis.trajectory]
  );

  const r0Color = analysis.R0 < 0.8 ? 'text-success' : analysis.R0 < 1.0 ? 'text-warning' : analysis.R0 < 2.0 ? 'text-destructive' : 'text-destructive';
  const r0Bg = analysis.R0 < 1.0 ? 'bg-success/15' : 'bg-destructive/15';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Compliance Contagion Model (CCD)</CardTitle>
          <div className={`rounded-lg px-3 py-1 ${r0Bg}`}>
            <span className={`text-sm font-bold ${r0Color}`}>R₀ = {analysis.R0.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Epidemiological SIR model for non-compliance spread
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* R0 and herd immunity stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">β (contagion)</p>
            <p className="text-sm font-bold text-foreground">{analysis.params.beta.toFixed(3)}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">γ (remediation)</p>
            <p className="text-sm font-bold text-foreground">{analysis.params.gamma.toFixed(3)}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Herd immunity</p>
            <p className="text-sm font-bold text-foreground">{(analysis.herdThreshold * 100).toFixed(0)}%</p>
          </div>
        </div>

        {/* SIR curves */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="t" fontSize={10} stroke="hsl(var(--muted-foreground))" label={{ value: 'Days', position: 'bottom', offset: -5, fontSize: 10 }} />
              <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="Compliant" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Non-Compliant" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Remediated" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Outbreak simulator slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Outbreak intensity</p>
            <Badge variant="outline" className="text-[10px]">{betaMultiplier.toFixed(1)}x</Badge>
          </div>
          <Slider
            value={[betaMultiplier]}
            onValueChange={v => setBetaMultiplier(v[0])}
            min={0.5}
            max={3.0}
            step={0.1}
          />
        </div>

        {/* Vaccination recommendation */}
        {analysis.R0 > 1 && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
            <p className="text-xs font-medium text-foreground">
              🛡️ Harden {analysis.vaccination.controlsToHarden} controls ({(analysis.herdThreshold * 100).toFixed(0)}%) to suppress epidemic below R₀ = 1
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">{analysis.interpretation}</p>
      </CardContent>
    </Card>
  );
}
