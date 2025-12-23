import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";
import { useThreatScenarios } from "@/hooks/useThreatScenarios";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { Skeleton } from "@/components/ui/skeleton";
import type { RiskLevel } from "@/types/database";

export function ThreatScenarioCard() {
  const { organizationId } = useOrganizationContext();
  const { data: scenarios, isLoading } = useThreatScenarios(organizationId || '');

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case "critical":
        return "text-destructive bg-destructive/10 border-destructive/30";
      case "high":
        return "text-risk-high bg-risk-high/10 border-risk-high/30";
      case "medium":
        return "text-warning bg-warning/10 border-warning/30";
      case "low":
        return "text-success bg-success/10 border-success/30";
    }
  };

  if (isLoading) {
    return (
      <div className="metric-card animate-slide-up" style={{ animationDelay: "400ms" }}>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-4" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const topScenarios = scenarios?.slice(0, 4) || [];

  return (
    <div className="metric-card animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top Threat Scenarios</h3>
          <p className="text-sm text-muted-foreground">FAIR-based risk quantification</p>
        </div>
      </div>

      {topScenarios.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {topScenarios.map((scenario, index) => {
            const breachProbability = scenario.vulnerability_factor * (scenario.threat_event_frequency / 100);
            const controlEffectiveness = Math.round((1 - scenario.vulnerability_factor) * 100);
            const annualLoss = (scenario.annual_loss_exposure || 0) / 1000000;

            return (
              <div
                key={scenario.id}
                className="group rounded-lg border border-border/50 bg-muted/20 p-4 transition-all hover:border-border hover:bg-muted/40 cursor-pointer animate-scale-in"
                style={{ animationDelay: `${500 + index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{scenario.threat_type}</span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase",
                      getRiskColor(scenario.risk_level)
                    )}
                  >
                    {scenario.risk_level}
                  </span>
                </div>

                <h4 className="mt-2 font-medium text-foreground">{scenario.name}</h4>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Annual Loss</p>
                    <p className="text-lg font-bold text-foreground">${annualLoss.toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Breach Prob.</p>
                    <p className="text-lg font-bold text-foreground">{(breachProbability * 100).toFixed(0)}%</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Control Effectiveness</span>
                    <span className="font-medium text-success">{controlEffectiveness}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-success transition-all duration-1000"
                      style={{ width: `${controlEffectiveness}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          No threat scenarios defined
        </div>
      )}
    </div>
  );
}
