import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Brain, Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import {
  calculatePosterior,
  betaPDF,
  generatePosteriorTimeSeries,
  INDUSTRY_PRIORS,
  type BayesianPrior,
  type EvidencePoint,
} from "@/lib/bayesianRiskEngine";
import { cn } from "@/lib/utils";

interface BayesianRiskTrackerProps {
  industry?: string;
  totalPasses?: number;
  totalFailures?: number;
  evidenceHistory?: EvidencePoint[];
  className?: string;
}

export function BayesianRiskTracker({
  industry = 'default',
  totalPasses = 0,
  totalFailures = 0,
  evidenceHistory,
  className,
}: BayesianRiskTrackerProps) {
  const prior = INDUSTRY_PRIORS[industry] || INDUSTRY_PRIORS.default;

  const posterior = useMemo(
    () => calculatePosterior(prior, totalPasses, totalFailures),
    [prior, totalPasses, totalFailures]
  );

  // Generate PDF curve data for prior vs posterior
  const distributionData = useMemo(() => {
    const points: Array<{ x: number; prior: number; posterior: number }> = [];
    for (let i = 0; i <= 100; i++) {
      const x = i / 100;
      points.push({
        x: Math.round(x * 100),
        prior: betaPDF(x || 0.001, prior.alpha, prior.beta),
        posterior: betaPDF(x || 0.001, posterior.alpha, posterior.beta),
      });
    }
    return points;
  }, [prior, posterior]);

  // Time series if evidence history provided
  const timeSeries = useMemo(() => {
    if (!evidenceHistory || evidenceHistory.length === 0) return null;
    return generatePosteriorTimeSeries(prior, evidenceHistory);
  }, [prior, evidenceHistory]);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'very_strong': return 'bg-success/15 text-success border-success/30';
      case 'strong': return 'bg-success/15 text-success border-success/30';
      case 'moderate': return 'bg-warning/15 text-warning border-warning/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className={cn("animate-slide-up", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Bayesian Risk Scoring</CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  ABRS uses Beta-Bernoulli conjugate updating. Each control test result updates our belief about breach probability in real-time.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Posterior Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
            <p className="text-[11px] text-muted-foreground">Posterior P(Breach)</p>
            <p className="text-2xl font-bold text-foreground">
              {(posterior.mean * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted-foreground">
              95% CI: [{(posterior.credibleInterval[0] * 100).toFixed(1)}% – {(posterior.credibleInterval[1] * 100).toFixed(1)}%]
            </p>
          </div>
          <div className="space-y-2">
            <div className="rounded-lg bg-muted/30 p-2">
              <p className="text-[11px] text-muted-foreground">Prior (Industry)</p>
              <p className="text-sm font-bold text-foreground">
                {(prior.alpha / (prior.alpha + prior.beta) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2">
              <p className="text-[11px] text-muted-foreground">Evidence</p>
              <p className="text-sm font-bold text-foreground">
                {posterior.totalEvidence} tests
              </p>
            </div>
          </div>
        </div>

        {/* Confidence & Evidence Strength */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Confidence</span>
            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${posterior.confidenceLevel * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-foreground">
              {(posterior.confidenceLevel * 100).toFixed(0)}%
            </span>
          </div>
          <Badge variant="outline" className={cn("text-[10px]", getStrengthColor(
            posterior.totalEvidence < 10 ? 'weak' :
            posterior.totalEvidence < 50 ? 'moderate' :
            posterior.totalEvidence < 200 ? 'strong' : 'very_strong'
          ))}>
            {posterior.totalEvidence < 10 ? 'Weak' :
             posterior.totalEvidence < 50 ? 'Moderate' :
             posterior.totalEvidence < 200 ? 'Strong' : 'Very Strong'} Evidence
          </Badge>
        </div>

        {/* Prior vs Posterior Distribution */}
        <div>
          <p className="text-xs font-medium text-foreground mb-2">Prior vs Posterior Distribution</p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="x" tick={{ fontSize: 9 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis hide />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                  formatter={(value: number, name: string) => [
                    value.toFixed(2),
                    name === 'prior' ? 'Prior' : 'Posterior',
                  ]}
                />
                <Area
                  type="monotone" dataKey="prior" stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted))" fillOpacity={0.3} strokeDasharray="4 4"
                />
                <Area
                  type="monotone" dataKey="posterior" stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))" fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-1">
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-muted-foreground" style={{ borderTop: '2px dashed' }} />
              <span className="text-[10px] text-muted-foreground">Prior</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-primary" />
              <span className="text-[10px] text-muted-foreground">Posterior</span>
            </div>
          </div>
        </div>

        {/* Time Series (if available) */}
        {timeSeries && timeSeries.length > 2 && (
          <div>
            <p className="text-xs font-medium text-foreground mb-2">Belief Evolution Over Time</p>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries.map(p => ({
                  date: new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  mean: (p.mean * 100),
                  lower: (p.lower * 100),
                  upper: (p.upper * 100),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${v}%`} />
                  <Area type="monotone" dataKey="upper" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="lower" stroke="none" fill="hsl(var(--background))" fillOpacity={1} />
                  <Area type="monotone" dataKey="mean" stroke="hsl(var(--primary))" fill="none" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
