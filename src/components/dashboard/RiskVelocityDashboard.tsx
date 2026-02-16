import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Gauge, TrendingDown, TrendingUp, Minus, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { calculateRiskMomentum, formatVelocity, formatMomentumScore, type RiskSnapshot } from "@/lib/riskVelocity";
import { cn } from "@/lib/utils";

interface RiskVelocityDashboardProps {
  riskSnapshots: RiskSnapshot[];
  className?: string;
}

const formatCurrency = (v: number): string => {
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

export function RiskVelocityDashboard({ riskSnapshots, className }: RiskVelocityDashboardProps) {
  const momentum = useMemo(
    () => calculateRiskMomentum(riskSnapshots),
    [riskSnapshots]
  );

  const TrendIcon = momentum.momentumScore > 0.05
    ? TrendingUp
    : momentum.momentumScore < -0.05
      ? TrendingDown
      : Minus;

  const chartData = momentum.velocityHistory.map(p => ({
    date: new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    velocity: Math.round(p.velocity),
    acceleration: Math.round(p.acceleration * 100) / 100,
  }));

  return (
    <Card className={cn("animate-slide-up", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Risk Velocity</CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  First & second derivatives of risk over time. Shows whether risk is increasing/decreasing and if that rate is accelerating.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Momentum Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              `bg-${momentum.trendColor}/15`
            )}>
              <TrendIcon className={cn("h-6 w-6", `text-${momentum.trendColor}`)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Momentum Score</p>
              <p className={cn("text-2xl font-bold", `text-${momentum.trendColor}`)}>
                {formatMomentumScore(momentum.momentumScore)}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={cn(
            "text-xs",
            momentum.trendColor === 'success' && "bg-success/15 text-success border-success/30",
            momentum.trendColor === 'warning' && "bg-warning/15 text-warning border-warning/30",
            momentum.trendColor === 'destructive' && "bg-destructive/15 text-destructive border-destructive/30",
          )}>
            {momentum.trendLabel}
          </Badge>
        </div>

        {/* Velocity & Acceleration */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground mb-1">Velocity (dR/dt)</p>
            <p className="text-sm font-bold text-foreground">
              {formatVelocity(momentum.currentVelocity)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground mb-1">30-Day Projection</p>
            <p className="text-sm font-bold text-foreground">
              {formatCurrency(momentum.projectedRisk30Days)}
            </p>
          </div>
        </div>

        {/* Velocity Chart */}
        {chartData.length > 2 && (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Line
                  type="monotone" dataKey="velocity" stroke="hsl(var(--primary))"
                  strokeWidth={2} dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
