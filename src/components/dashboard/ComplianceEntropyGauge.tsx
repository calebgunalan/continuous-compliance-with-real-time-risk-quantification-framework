import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity, Info } from "lucide-react";
import { calculateCEI, type ControlState, type EntropyResult } from "@/lib/complianceEntropy";
import { cn } from "@/lib/utils";

interface ComplianceEntropyGaugeProps {
  controlStates: ControlState[];
  className?: string;
}

export function ComplianceEntropyGauge({ controlStates, className }: ComplianceEntropyGaugeProps) {
  const result: EntropyResult = useMemo(() => calculateCEI(controlStates), [controlStates]);

  const getZoneColor = (zone: EntropyResult['zone']) => {
    switch (zone) {
      case 'ordered': return 'hsl(var(--success))';
      case 'transitional': return 'hsl(var(--warning))';
      case 'chaotic': return 'hsl(var(--destructive))';
    }
  };

  const getZoneBadgeClass = (zone: EntropyResult['zone']) => {
    switch (zone) {
      case 'ordered': return 'bg-success/15 text-success border-success/30';
      case 'transitional': return 'bg-warning/15 text-warning border-warning/30';
      case 'chaotic': return 'bg-destructive/15 text-destructive border-destructive/30';
    }
  };

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (result.cei * circumference);

  const stateColors: Record<ControlState, string> = {
    pass: 'bg-success',
    fail: 'bg-destructive',
    warning: 'bg-warning',
    not_tested: 'bg-muted-foreground',
  };

  return (
    <Card className={cn("animate-slide-up", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Compliance Entropy Index</CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  CEI applies Shannon Entropy to measure compliance disorder.
                  0 = perfect order, 1 = maximum chaos.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Gauge */}
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="50" cy="50" r={radius} fill="none"
                stroke={getZoneColor(result.zone)}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">
                {(result.cei * 100).toFixed(0)}
              </span>
              <span className="text-[10px] text-muted-foreground">/ 100</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <Badge variant="outline" className={cn("text-xs", getZoneBadgeClass(result.zone))}>
              {result.zoneLabel}
            </Badge>
            
            {/* State distribution bars */}
            <div className="space-y-1.5">
              {(['pass', 'fail', 'warning', 'not_tested'] as ControlState[]).map(state => (
                <div key={state} className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", stateColors[state])} />
                  <span className="text-[11px] text-muted-foreground capitalize w-16">
                    {state.replace('_', ' ')}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", stateColors[state])}
                      style={{ width: `${(result.stateDistribution[state] || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-foreground w-8 text-right">
                    {((result.stateDistribution[state] || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
