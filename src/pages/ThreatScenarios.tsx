import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { Target, Shield, AlertTriangle, TrendingDown, ChevronRight, Lock, Bug, Users, Server } from "lucide-react";

interface ThreatScenario {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: React.ElementType;
  annualLossExposure: number;
  breachProbability: number;
  lastUpdated: string;
  controls: string[];
  riskLevel: "critical" | "high" | "medium" | "low";
}

const threats: ThreatScenario[] = [
  {
    id: "TS-001",
    name: "SQL Injection Data Breach",
    description: "External attackers exploiting web application vulnerabilities to access customer database containing 10M+ records",
    type: "Data Breach",
    icon: Bug,
    annualLossExposure: 85.4,
    breachProbability: 0.12,
    lastUpdated: "2 hours ago",
    controls: ["WAF Configuration", "Input Validation", "Database Access Controls", "Vulnerability Scanning"],
    riskLevel: "high",
  },
  {
    id: "TS-002",
    name: "Ransomware Infection",
    description: "Ransomware deployment through phishing or vulnerable systems leading to operational disruption and data encryption",
    type: "Malware",
    icon: Lock,
    annualLossExposure: 120.8,
    breachProbability: 0.08,
    lastUpdated: "1 hour ago",
    controls: ["Endpoint Protection", "Email Security", "Backup & Recovery", "Network Segmentation"],
    riskLevel: "critical",
  },
  {
    id: "TS-003",
    name: "Insider Data Theft",
    description: "Malicious insider exfiltrating sensitive data for personal gain or competitive advantage",
    type: "Insider Threat",
    icon: Users,
    annualLossExposure: 45.2,
    breachProbability: 0.15,
    lastUpdated: "4 hours ago",
    controls: ["DLP Controls", "Access Reviews", "User Activity Monitoring", "Least Privilege"],
    riskLevel: "medium",
  },
  {
    id: "TS-004",
    name: "Cloud Misconfiguration",
    description: "Exposed cloud resources due to misconfigured security settings leading to unauthorized data access",
    type: "Configuration",
    icon: Server,
    annualLossExposure: 62.5,
    breachProbability: 0.18,
    lastUpdated: "30 min ago",
    controls: ["Cloud Security Posture", "IAM Policies", "Encryption at Rest", "Network Security Groups"],
    riskLevel: "high",
  },
];

export default function ThreatsPage() {
  const getRiskColor = (level: ThreatScenario["riskLevel"]) => {
    switch (level) {
      case "critical": return "text-destructive bg-destructive/10 border-destructive/30";
      case "high": return "text-risk-high bg-risk-high/10 border-risk-high/30";
      case "medium": return "text-warning bg-warning/10 border-warning/30";
      case "low": return "text-success bg-success/10 border-success/30";
    }
  };

  const getRiskGlow = (level: ThreatScenario["riskLevel"]) => {
    switch (level) {
      case "critical": return "glow-critical";
      case "high": return "glow-warning";
      case "medium": return "";
      case "low": return "glow-success";
    }
  };

  const totalExposure = threats.reduce((sum, t) => sum + t.annualLossExposure, 0);

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
          <p className="mt-1 text-2xl font-bold text-foreground">{threats.length}</p>
        </div>
        <div className="metric-card py-4 animate-slide-up" style={{ animationDelay: "50ms" }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-sm text-muted-foreground">Critical</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-destructive">
            {threats.filter(t => t.riskLevel === "critical").length}
          </p>
        </div>
        <div className="metric-card py-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-success" />
            <span className="text-sm text-muted-foreground">Controls Active</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {threats.reduce((sum, t) => sum + t.controls.length, 0)}
          </p>
        </div>
        <div className="metric-card py-4 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total Exposure</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">${totalExposure.toFixed(1)}M</p>
        </div>
      </div>

      {/* Threat Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {threats.map((threat, index) => {
          const Icon = threat.icon;
          return (
            <div
              key={threat.id}
              className={cn(
                "metric-card cursor-pointer group hover:border-primary/50 transition-all animate-slide-up",
                getRiskGlow(threat.riskLevel)
              )}
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                  threat.riskLevel === "critical" ? "bg-destructive/15" : 
                  threat.riskLevel === "high" ? "bg-risk-high/15" : "bg-warning/15"
                )}>
                  <Icon className={cn(
                    "h-6 w-6",
                    threat.riskLevel === "critical" ? "text-destructive" : 
                    threat.riskLevel === "high" ? "text-risk-high" : "text-warning"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">{threat.id}</span>
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase",
                      getRiskColor(threat.riskLevel)
                    )}>
                      {threat.riskLevel}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{threat.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{threat.description}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Annual Loss Exposure</p>
                  <p className="text-xl font-bold text-foreground">${threat.annualLossExposure}M</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Breach Probability</p>
                  <p className="text-xl font-bold text-foreground">{(threat.breachProbability * 100).toFixed(0)}%</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Mitigating Controls</p>
                <div className="flex flex-wrap gap-1">
                  {threat.controls.map((control) => (
                    <span key={control} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {control}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Updated {threat.lastUpdated}</span>
                <button className="flex items-center gap-1 text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
