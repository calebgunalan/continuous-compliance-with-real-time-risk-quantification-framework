import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { Target, Shield, AlertTriangle, TrendingDown, ChevronRight, Lock, Bug, Users, Server, Loader2 } from "lucide-react";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useThreatScenarios } from "@/hooks/useThreatScenarios";
import type { RiskLevel } from "@/types/database";

const threatIcons: Record<string, React.ElementType> = {
  "data_breach": Bug,
  "malware": Lock,
  "ransomware": Lock,
  "insider_threat": Users,
  "phishing": Users,
  "cloud_misconfiguration": Server,
  "ddos": Server,
  default: AlertTriangle,
};

export default function ThreatsPage() {
  const { organizationId } = useOrganizationContext();
  const { data: scenarios, isLoading } = useThreatScenarios(organizationId || "");

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case "critical": return "text-destructive bg-destructive/10 border-destructive/30";
      case "high": return "text-risk-high bg-risk-high/10 border-risk-high/30";
      case "medium": return "text-warning bg-warning/10 border-warning/30";
      case "low": return "text-success bg-success/10 border-success/30";
    }
  };

  const getRiskGlow = (level: RiskLevel) => {
    switch (level) {
      case "critical": return "glow-critical";
      case "high": return "glow-warning";
      case "medium": return "";
      case "low": return "glow-success";
    }
  };

  const getIcon = (threatType: string) => {
    const normalizedType = threatType.toLowerCase().replace(/\s+/g, "_");
    return threatIcons[normalizedType] || threatIcons.default;
  };

  const totalExposure = scenarios?.reduce((sum, t) => sum + (t.annual_loss_exposure || 0), 0) || 0;
  const criticalCount = scenarios?.filter(t => t.risk_level === "critical").length || 0;
  const totalControls = scenarios?.reduce((sum, t) => sum + (t.mitigating_control_ids?.length || 0), 0) || 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Threat Scenarios
        </h1>
        <p className="mt-1 text-muted-foreground">
          Active threat scenarios and associated financial risk exposure
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <div className="metric-card py-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-warning" />
            <span className="text-sm text-muted-foreground">Active Threats</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{scenarios?.length || 0}</p>
        </div>
        <div className="metric-card py-4 animate-slide-up" style={{ animationDelay: "50ms" }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-sm text-muted-foreground">Critical</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-destructive">{criticalCount}</p>
        </div>
        <div className="metric-card py-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-success" />
            <span className="text-sm text-muted-foreground">Controls Active</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{totalControls}</p>
        </div>
        <div className="metric-card py-4 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total Exposure</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">${(totalExposure / 1_000_000).toFixed(1)}M</p>
        </div>
      </div>

      {/* Threat Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {scenarios?.map((threat, index) => {
          const Icon = getIcon(threat.threat_type);
          const annualLossExposure = threat.annual_loss_exposure || 
            (threat.threat_event_frequency * threat.vulnerability_factor * 
              (threat.primary_loss_magnitude + threat.secondary_loss_magnitude));
          
          return (
            <div
              key={threat.id}
              className={cn(
                "metric-card cursor-pointer group hover:border-primary/50 transition-all animate-slide-up",
                getRiskGlow(threat.risk_level)
              )}
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                  threat.risk_level === "critical" ? "bg-destructive/15" : 
                  threat.risk_level === "high" ? "bg-risk-high/15" : "bg-warning/15"
                )}>
                  <Icon className={cn(
                    "h-6 w-6",
                    threat.risk_level === "critical" ? "text-destructive" : 
                    threat.risk_level === "high" ? "text-risk-high" : "text-warning"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">{threat.threat_type}</span>
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase",
                      getRiskColor(threat.risk_level)
                    )}>
                      {threat.risk_level}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{threat.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{threat.description}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Annual Loss Exposure</p>
                  <p className="text-xl font-bold text-foreground">
                    ${(annualLossExposure / 1_000_000).toFixed(1)}M
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vulnerability Factor</p>
                  <p className="text-xl font-bold text-foreground">
                    {(threat.vulnerability_factor * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Asset at Risk</p>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {threat.asset_at_risk}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>TEF: {threat.threat_event_frequency}/yr</span>
                <button className="flex items-center gap-1 text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
        {(!scenarios || scenarios.length === 0) && (
          <div className="col-span-2 metric-card text-center py-12">
            <p className="text-muted-foreground">No threat scenarios configured for this organization</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
