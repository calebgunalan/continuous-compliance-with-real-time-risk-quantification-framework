import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ComplianceGauge } from "@/components/dashboard/ComplianceGauge";
import { MaturityIndicator } from "@/components/dashboard/MaturityIndicator";
import { RiskExposureChart } from "@/components/dashboard/RiskExposureChart";
import { ControlStatusList } from "@/components/dashboard/ControlStatusList";
import { ThreatScenarioCard } from "@/components/dashboard/ThreatScenarioCard";
import {
  DollarSign,
  Shield,
  AlertTriangle,
  Clock,
  TrendingDown,
} from "lucide-react";

const Index = () => {
  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Executive Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Real-time compliance monitoring and financial risk quantification
        </p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard
          title="Annual Risk Exposure"
          value="$285M"
          subtitle="Based on FAIR methodology"
          icon={DollarSign}
          variant="critical"
          trend={{ value: 15, label: "vs last quarter", isPositive: true }}
          delay={0}
        />
        <MetricCard
          title="Controls Passing"
          value="847"
          subtitle="of 972 total controls"
          icon={Shield}
          variant="success"
          trend={{ value: 5, label: "vs last month", isPositive: true }}
          delay={50}
        />
        <MetricCard
          title="Active Threats"
          value="12"
          subtitle="Scenarios above threshold"
          icon={AlertTriangle}
          variant="warning"
          trend={{ value: 8, label: "vs last week", isPositive: true }}
          delay={100}
        />
        <MetricCard
          title="Mean Time to Detect"
          value="4.2h"
          subtitle="Avg. control failure detection"
          icon={Clock}
          variant="primary"
          trend={{ value: 23, label: "vs periodic audits", isPositive: true }}
          delay={150}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Chart and Controls */}
        <div className="lg:col-span-2 space-y-6">
          <RiskExposureChart />
          <ControlStatusList />
        </div>

        {/* Right Column - Gauges and Maturity */}
        <div className="space-y-6">
          {/* Compliance & Maturity Card */}
          <div className="metric-card animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h3 className="mb-6 text-lg font-semibold text-foreground">
              Compliance Overview
            </h3>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <ComplianceGauge value={87} label="Overall Compliance" size="md" />
              <MaturityIndicator level={3.4} showLabels={false} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm text-muted-foreground">NIST CSF</span>
                </div>
                <span className="text-sm font-medium text-foreground">91%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm text-muted-foreground">ISO 27001</span>
                </div>
                <span className="text-sm font-medium text-foreground">88%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-warning" />
                  <span className="text-sm text-muted-foreground">SOC 2</span>
                </div>
                <span className="text-sm font-medium text-foreground">82%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm text-muted-foreground">CIS Benchmarks</span>
                </div>
                <span className="text-sm font-medium text-foreground">85%</span>
              </div>
            </div>
          </div>

          {/* ROI Projection Card */}
          <div className="metric-card animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
                <TrendingDown className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Investment ROI</h3>
                <p className="text-xs text-muted-foreground">Governance improvement projection</p>
              </div>
            </div>

            <div className="rounded-lg border border-success/30 bg-success/5 p-4">
              <div className="mb-3">
                <p className="text-sm text-muted-foreground">If you invest</p>
                <p className="text-2xl font-bold text-foreground">$1.2M</p>
                <p className="text-sm text-muted-foreground">to reach maturity level 4</p>
              </div>
              <div className="h-px bg-border my-3" />
              <div>
                <p className="text-sm text-muted-foreground">Expected risk reduction</p>
                <p className="text-2xl font-bold text-success">$75M</p>
                <p className="text-sm text-muted-foreground">per year (62.5x ROI)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Scenarios Section */}
      <div className="mt-6">
        <ThreatScenarioCard />
      </div>
    </AppLayout>
  );
};

export default Index;
