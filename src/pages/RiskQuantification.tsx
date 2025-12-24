import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { DollarSign, TrendingDown, Shield, Target, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { WhatIfScenarioModeler } from "@/components/risk/WhatIfScenarioModeler";
import { useThreatScenarios } from "@/hooks/useThreatScenarios";
import { useOrganizationContext } from "@/contexts/OrganizationContext";

interface ThreatScenario {
  id: string;
  name: string;
  type: string;
  description: string;
  threatEventFrequency: number;
  vulnerability: number;
  lossEventFrequency: number;
  primaryLoss: number;
  secondaryLoss: number;
  annualLossExposure: number;
  controlEffectiveness: number;
  riskLevel: "critical" | "high" | "medium" | "low";
}

const scenarios: ThreatScenario[] = [
  {
    id: "TS-001",
    name: "SQL Injection Data Breach",
    type: "Data Breach",
    description: "External attackers exploiting web application vulnerabilities to access customer database",
    threatEventFrequency: 10,
    vulnerability: 0.12,
    lossEventFrequency: 1.2,
    primaryLoss: 50,
    secondaryLoss: 35.4,
    annualLossExposure: 85.4,
    controlEffectiveness: 94,
    riskLevel: "high",
  },
  {
    id: "TS-002",
    name: "Ransomware Infection",
    type: "Malware",
    description: "Ransomware deployment through phishing or vulnerable systems leading to operational disruption",
    threatEventFrequency: 15,
    vulnerability: 0.08,
    lossEventFrequency: 1.2,
    primaryLoss: 80,
    secondaryLoss: 40.8,
    annualLossExposure: 120.8,
    controlEffectiveness: 91,
    riskLevel: "critical",
  },
  {
    id: "TS-003",
    name: "Insider Data Theft",
    type: "Insider Threat",
    description: "Malicious insider exfiltrating sensitive data for personal gain or competitive advantage",
    threatEventFrequency: 8,
    vulnerability: 0.15,
    lossEventFrequency: 1.2,
    primaryLoss: 30,
    secondaryLoss: 15.2,
    annualLossExposure: 45.2,
    controlEffectiveness: 78,
    riskLevel: "medium",
  },
  {
    id: "TS-004",
    name: "Phishing Account Takeover",
    type: "Social Engineering",
    description: "Credential theft through targeted phishing leading to unauthorized system access",
    threatEventFrequency: 50,
    vulnerability: 0.22,
    lossEventFrequency: 11,
    primaryLoss: 2.5,
    secondaryLoss: 0.5,
    annualLossExposure: 32.6,
    controlEffectiveness: 86,
    riskLevel: "medium",
  },
  {
    id: "TS-005",
    name: "DDoS Attack",
    type: "Availability",
    description: "Distributed denial of service attack causing service unavailability and business disruption",
    threatEventFrequency: 25,
    vulnerability: 0.1,
    lossEventFrequency: 2.5,
    primaryLoss: 8,
    secondaryLoss: 4,
    annualLossExposure: 30,
    controlEffectiveness: 92,
    riskLevel: "medium",
  },
];

const chartData = scenarios.map((s) => ({
  name: s.name.split(" ").slice(0, 2).join(" "),
  value: s.annualLossExposure,
  level: s.riskLevel,
}));

export default function RiskQuantificationPage() {
  const totalRiskExposure = scenarios.reduce((sum, s) => sum + s.annualLossExposure, 0);
  const avgControlEffectiveness = Math.round(
    scenarios.reduce((sum, s) => sum + s.controlEffectiveness, 0) / scenarios.length
  );

  const getRiskColor = (level: ThreatScenario["riskLevel"]) => {
    switch (level) {
      case "critical":
        return "hsl(var(--destructive))";
      case "high":
        return "hsl(var(--risk-high))";
      case "medium":
        return "hsl(var(--warning))";
      case "low":
        return "hsl(var(--success))";
    }
  };

  const getRiskBadge = (level: ThreatScenario["riskLevel"]) => {
    switch (level) {
      case "critical":
        return "risk-badge-critical";
      case "high":
        return "risk-badge-high";
      case "medium":
        return "risk-badge-medium";
      case "low":
        return "risk-badge-low";
    }
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Risk Quantification
        </h1>
        <p className="mt-1 text-muted-foreground">
          FAIR-based financial risk analysis and threat scenario modeling
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="metric-card animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15">
              <DollarSign className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total ALE</p>
              <p className="text-2xl font-bold text-foreground">${totalRiskExposure.toFixed(1)}M</p>
            </div>
          </div>
        </div>
        <div className="metric-card animate-slide-up" style={{ animationDelay: "50ms" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15">
              <Target className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Threat Scenarios</p>
              <p className="text-2xl font-bold text-foreground">{scenarios.length}</p>
            </div>
          </div>
        </div>
        <div className="metric-card animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
              <Shield className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Control Effectiveness</p>
              <p className="text-2xl font-bold text-foreground">{avgControlEffectiveness}%</p>
            </div>
          </div>
        </div>
        <div className="metric-card animate-slide-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <TrendingDown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Reduction (YoY)</p>
              <p className="text-2xl font-bold text-success">-23%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="lg:col-span-2">
          <div className="metric-card animate-slide-up" style={{ animationDelay: "200ms" }}>
            <h3 className="mb-6 text-lg font-semibold text-foreground">
              Annual Loss Exposure by Threat Scenario
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}M`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value}M`, "Annual Loss"]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={getRiskColor(entry.level as ThreatScenario["riskLevel"])} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* FAIR Methodology Info */}
        <div className="metric-card animate-slide-up" style={{ animationDelay: "250ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">FAIR Methodology</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="font-medium text-foreground mb-1">Loss Event Frequency (LEF)</p>
              <p className="text-muted-foreground text-xs">TEF × Vulnerability = Expected annual breach incidents</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="font-medium text-foreground mb-1">Loss Magnitude (LM)</p>
              <p className="text-muted-foreground text-xs">Primary Loss + Secondary Loss = Total impact per incident</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3 border border-primary/20">
              <p className="font-medium text-foreground mb-1">Annual Loss Exposure (ALE)</p>
              <p className="text-muted-foreground text-xs">LEF × LM = Quantified annual risk in dollars</p>
            </div>
          </div>
        </div>
      </div>

      {/* What-If Scenario Modeling */}
      <div className="mt-6">
        <WhatIfScenarioModeler />
      </div>

      {/* Detailed Scenarios Table */}
      <div className="mt-6 metric-card p-0 overflow-hidden animate-slide-up" style={{ animationDelay: "300ms" }}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Threat Scenario Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Scenario
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  TEF
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Vulnerability
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  LEF
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Primary $
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Secondary $
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  ALE
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Risk
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {scenarios.map((scenario, index) => (
                <tr
                  key={scenario.id}
                  className="hover:bg-muted/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${350 + index * 50}ms` }}
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-foreground">{scenario.name}</p>
                      <p className="text-xs text-muted-foreground">{scenario.type}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-muted-foreground">
                    {scenario.threatEventFrequency}/yr
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-muted-foreground">
                    {(scenario.vulnerability * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-medium text-foreground">
                    {scenario.lossEventFrequency.toFixed(1)}
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-muted-foreground">
                    ${scenario.primaryLoss}M
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-muted-foreground">
                    ${scenario.secondaryLoss}M
                  </td>
                  <td className="px-4 py-4 text-right text-lg font-bold text-foreground">
                    ${scenario.annualLossExposure}M
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={cn("risk-badge uppercase", getRiskBadge(scenario.riskLevel))}>
                      {scenario.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
