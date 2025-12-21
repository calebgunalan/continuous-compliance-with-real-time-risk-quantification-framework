import { cn } from "@/lib/utils";
import { Shield, TrendingDown } from "lucide-react";

interface ThreatScenario {
  id: string;
  name: string;
  type: string;
  annualLossExposure: number;
  breachProbability: number;
  controlEffectiveness: number;
  riskLevel: "critical" | "high" | "medium" | "low";
}

const scenarios: ThreatScenario[] = [
  {
    id: "TS-001",
    name: "SQL Injection Data Breach",
    type: "Data Breach",
    annualLossExposure: 85.4,
    breachProbability: 0.12,
    controlEffectiveness: 94,
    riskLevel: "medium",
  },
  {
    id: "TS-002",
    name: "Ransomware Infection",
    type: "Malware",
    annualLossExposure: 120.8,
    breachProbability: 0.08,
    controlEffectiveness: 91,
    riskLevel: "high",
  },
  {
    id: "TS-003",
    name: "Insider Data Theft",
    type: "Insider Threat",
    annualLossExposure: 45.2,
    breachProbability: 0.15,
    controlEffectiveness: 78,
    riskLevel: "medium",
  },
  {
    id: "TS-004",
    name: "Phishing Account Takeover",
    type: "Social Engineering",
    annualLossExposure: 32.6,
    breachProbability: 0.22,
    controlEffectiveness: 86,
    riskLevel: "medium",
  },
];

export function ThreatScenarioCard() {
  const getRiskColor = (level: ThreatScenario["riskLevel"]) => {
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

  return (
    <div className="metric-card animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top Threat Scenarios</h3>
          <p className="text-sm text-muted-foreground">FAIR-based risk quantification</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {scenarios.map((scenario, index) => (
          <div
            key={scenario.id}
            className="group rounded-lg border border-border/50 bg-muted/20 p-4 transition-all hover:border-border hover:bg-muted/40 cursor-pointer animate-scale-in"
            style={{ animationDelay: `${500 + index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{scenario.type}</span>
              </div>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase",
                  getRiskColor(scenario.riskLevel)
                )}
              >
                {scenario.riskLevel}
              </span>
            </div>

            <h4 className="mt-2 font-medium text-foreground">{scenario.name}</h4>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Annual Loss</p>
                <p className="text-lg font-bold text-foreground">${scenario.annualLossExposure}M</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Breach Prob.</p>
                <p className="text-lg font-bold text-foreground">{(scenario.breachProbability * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Control Effectiveness</span>
                <span className="font-medium text-success">{scenario.controlEffectiveness}%</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-success transition-all duration-1000"
                  style={{ width: `${scenario.controlEffectiveness}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
