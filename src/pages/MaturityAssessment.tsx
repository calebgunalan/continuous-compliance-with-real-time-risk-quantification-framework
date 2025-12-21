import { AppLayout } from "@/components/layout/AppLayout";
import { MaturityIndicator } from "@/components/dashboard/MaturityIndicator";
import { cn } from "@/lib/utils";
import { TrendingUp, Target, CheckCircle2, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const maturityHistory = [
  { month: "Jul", level: 2.1 },
  { month: "Aug", level: 2.3 },
  { month: "Sep", level: 2.5 },
  { month: "Oct", level: 2.8 },
  { month: "Nov", level: 3.1 },
  { month: "Dec", level: 3.4 },
];

const domains = [
  { name: "Access Control", level: 3.8, passRate: 92 },
  { name: "Identification & Auth", level: 3.2, passRate: 87 },
  { name: "Risk Assessment", level: 3.5, passRate: 89 },
  { name: "Security Monitoring", level: 3.6, passRate: 91 },
  { name: "Incident Response", level: 2.9, passRate: 78 },
  { name: "Configuration Mgmt", level: 3.4, passRate: 85 },
  { name: "Data Protection", level: 3.1, passRate: 82 },
  { name: "Vulnerability Mgmt", level: 3.3, passRate: 84 },
];

const recommendations = [
  {
    title: "Implement Automated Access Reviews",
    impact: "High",
    effort: "Medium",
    riskReduction: "$12M",
    description: "Automate quarterly access review process to improve detection of orphaned accounts",
  },
  {
    title: "Enhance MFA Coverage",
    impact: "Critical",
    effort: "Low",
    riskReduction: "$18M",
    description: "Extend MFA to all privileged accounts including service accounts",
  },
  {
    title: "Deploy SIEM Integration",
    impact: "High",
    effort: "High",
    riskReduction: "$15M",
    description: "Integrate all security logs into centralized SIEM for real-time threat detection",
  },
];

export default function MaturityAssessmentPage() {
  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Maturity Assessment
        </h1>
        <p className="mt-1 text-muted-foreground">
          Governance maturity level and improvement recommendations
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Current Maturity */}
        <div className="space-y-6">
          {/* Current Level Card */}
          <div className="metric-card animate-slide-up">
            <h3 className="mb-6 text-lg font-semibold text-foreground text-center">
              Current Maturity Level
            </h3>
            <MaturityIndicator level={3.4} showLabels={true} />
            
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Next Level Target</span>
                <span className="text-sm font-medium text-primary">Level 4.0</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[85%] rounded-full bg-gradient-primary" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground text-center">
                85% progress to Level 4 (Managed)
              </p>
            </div>
          </div>

          {/* Key Stats */}
          <div className="metric-card animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm text-muted-foreground">6-Month Growth</span>
                </div>
                <span className="text-lg font-bold text-success">+1.3</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Industry Avg</span>
                </div>
                <span className="text-lg font-bold text-foreground">2.8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm text-muted-foreground">Controls Passing</span>
                </div>
                <span className="text-lg font-bold text-foreground">87%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column - History Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="metric-card animate-slide-up" style={{ animationDelay: "50ms" }}>
            <h3 className="mb-6 text-lg font-semibold text-foreground">
              Maturity Level Progression
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={maturityHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="maturityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[1, 5]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    ticks={[1, 2, 3, 4, 5]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value.toFixed(1), "Maturity Level"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="level"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#maturityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Domain Breakdown */}
          <div className="metric-card animate-slide-up" style={{ animationDelay: "150ms" }}>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Domain Maturity Breakdown
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {domains.map((domain, index) => (
                <div
                  key={domain.name}
                  className="rounded-lg border border-border/50 bg-muted/20 p-3 animate-scale-in"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{domain.name}</span>
                    <span className={cn(
                      "text-sm font-bold",
                      domain.level >= 3.5 ? "text-success" : domain.level >= 3 ? "text-warning" : "text-destructive"
                    )}>
                      {domain.level.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        domain.level >= 3.5 ? "bg-success" : domain.level >= 3 ? "bg-warning" : "bg-destructive"
                      )}
                      style={{ width: `${(domain.level / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6 metric-card animate-slide-up" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">
            Improvement Recommendations
          </h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendations.map((rec, index) => (
            <div
              key={rec.title}
              className="rounded-lg border border-border bg-muted/20 p-4 hover:border-primary/50 transition-colors cursor-pointer group animate-scale-in"
              style={{ animationDelay: `${350 + index * 100}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  rec.impact === "Critical" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"
                )}>
                  {rec.impact} Impact
                </span>
                <span className="text-xs text-muted-foreground">{rec.effort} Effort</span>
              </div>
              <h4 className="font-medium text-foreground mb-2">{rec.title}</h4>
              <p className="text-xs text-muted-foreground mb-3">{rec.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Risk Reduction</p>
                  <p className="text-lg font-bold text-success">{rec.riskReduction}</p>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Details <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
