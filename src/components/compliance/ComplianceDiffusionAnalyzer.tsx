import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Activity, Clock, AlertTriangle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  runDiffusionAnalysis,
  generateSyntheticPassRates,
  type DiffusionAnalysis,
} from "@/lib/complianceDiffusion";

export function ComplianceDiffusionAnalyzer() {
  const [analysis, setAnalysis] = useState<DiffusionAnalysis | null>(null);
  const [threshold, setThreshold] = useState(80);
  const [horizonDays, setHorizonDays] = useState(30);

  const runAnalysis = () => {
    const observations = generateSyntheticPassRates(90);
    const result = runDiffusionAnalysis(observations, threshold, horizonDays);
    setAnalysis(result);
  };

  const chartData = useMemo(() => {
    if (!analysis) return [];
    const steps = analysis.confidenceBands.mean.length;
    return Array.from({ length: steps }, (_, i) => ({
      day: Math.round((i / (steps - 1)) * analysis.timeHorizonDays * 10) / 10,
      mean: Math.round(analysis.confidenceBands.mean[i] * 10) / 10,
      upper: Math.round(analysis.confidenceBands.upper[i] * 10) / 10,
      lower: Math.round(analysis.confidenceBands.lower[i] * 10) / 10,
      threshold,
    }));
  }, [analysis, threshold]);

  const trajectoryData = useMemo(() => {
    if (!analysis) return [];
    const steps = analysis.trajectories[0]?.length || 0;
    return Array.from({ length: steps }, (_, i) => {
      const point: Record<string, number> = {
        day: Math.round((i / (steps - 1)) * analysis.timeHorizonDays * 10) / 10,
      };
      analysis.trajectories.slice(0, 10).forEach((traj, t) => {
        point[`path${t}`] = Math.round(traj[i] * 10) / 10;
      });
      return point;
    });
  }, [analysis]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Compliance Drift Diffusion Model</CardTitle>
          </div>
          <Button size="sm" onClick={runAnalysis}>
            {analysis ? "Recalculate" : "Run Analysis"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Ornstein-Uhlenbeck stochastic process modeling for control pass rate trajectories
        </p>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Compliance Threshold: {threshold}%</label>
              <Slider value={[threshold]} onValueChange={([v]) => setThreshold(v)} min={50} max={95} step={1} className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Forecast Horizon: {horizonDays} days</label>
              <Slider value={[horizonDays]} onValueChange={([v]) => setHorizonDays(v)} min={7} max={90} step={1} className="mt-2" />
            </div>
            <div className="text-center py-4 text-muted-foreground text-sm">
              Configure parameters and click "Run Analysis" to model stochastic drift behavior
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* OU Parameters */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">θ (Reversion Speed)</p>
                <p className="text-lg font-bold text-foreground">{analysis.parameters.theta.toFixed(3)}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">μ (Equilibrium)</p>
                <p className="text-lg font-bold text-foreground">{analysis.parameters.mu.toFixed(1)}%</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">σ (Volatility)</p>
                <p className="text-lg font-bold text-foreground">{analysis.parameters.sigma.toFixed(2)}</p>
              </div>
            </div>

            {/* Confidence Bands */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Forecast with 95% Confidence Bands</h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" fontSize={11} stroke="hsl(var(--muted-foreground))" label={{ value: "Days", position: "bottom", offset: -5, fontSize: 10 }} />
                    <YAxis domain={[50, 100]} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Area type="monotone" dataKey="upper" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="lower" stroke="none" fill="hsl(var(--background))" fillOpacity={1} />
                    <Line type="monotone" dataKey="mean" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="threshold" stroke="hsl(var(--destructive))" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sample Trajectories */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Monte Carlo Sample Paths</h4>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trajectoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[50, 100]} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    {Array.from({ length: 10 }, (_, i) => (
                      <Line key={i} type="monotone" dataKey={`path${i}`} stroke="hsl(var(--primary))" strokeWidth={1} strokeOpacity={0.3} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="h-3 w-3 text-warning" />
                  <p className="text-xs text-muted-foreground">First Passage Time</p>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {analysis.firstPassageTime < 1000 ? `${analysis.firstPassageTime.toFixed(0)}h` : ">1000h"}
                </p>
              </div>
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                  <p className="text-xs text-muted-foreground">P(Breach)</p>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {(analysis.thresholdProbability * 100).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Activity className="h-3 w-3 text-primary" />
                  <p className="text-xs text-muted-foreground">Monitor Every</p>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {analysis.optimalMonitoringInterval < 24 
                    ? `${analysis.optimalMonitoringInterval.toFixed(0)}h`
                    : `${(analysis.optimalMonitoringInterval / 24).toFixed(0)}d`}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
