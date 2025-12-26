import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ComplianceGauge } from "@/components/dashboard/ComplianceGauge";
import { MaturityIndicator } from "@/components/dashboard/MaturityIndicator";
import { RiskExposureChart } from "@/components/dashboard/RiskExposureChart";
import { ControlStatusList } from "@/components/dashboard/ControlStatusList";
import { ThreatScenarioCard } from "@/components/dashboard/ThreatScenarioCard";
import { IndustryBenchmark } from "@/components/dashboard/IndustryBenchmark";
import { BreachProbabilityTracker } from "@/components/dashboard/BreachProbabilityTracker";
import {
  DollarSign,
  Shield,
  AlertTriangle,
  Clock,
  TrendingDown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useTotalRiskExposure, useThreatScenarios } from "@/hooks/useThreatScenarios";
import { useControlsPassRate, useOrganizationControls } from "@/hooks/useControls";
import { useLatestMaturityAssessment, calculateProjectedRiskReduction } from "@/hooks/useRiskCalculations";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (value: number): string => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

const getMaturityNumeric = (level: string): number => {
  const map: Record<string, number> = {
    level_1: 1,
    level_2: 2,
    level_3: 3,
    level_4: 4,
    level_5: 5,
  };
  return map[level] || 1;
};

const Index = () => {
  const { profile } = useAuth();
  const organizationId = profile?.organization_id || '';
  
  const { data: organization, isLoading: orgLoading } = useOrganization(organizationId);
  const { data: totalRisk, isLoading: riskLoading } = useTotalRiskExposure(organizationId);
  const { data: threats, isLoading: threatsLoading } = useThreatScenarios(organizationId);
  const { data: controls, isLoading: controlsLoading } = useOrganizationControls(organizationId);
  const { data: passRate, isLoading: passRateLoading } = useControlsPassRate(organizationId);
  const { data: maturityAssessment, isLoading: maturityLoading } = useLatestMaturityAssessment(organizationId);

  const isLoading = !organizationId || orgLoading || riskLoading || threatsLoading || controlsLoading || passRateLoading || maturityLoading;

  // Calculate metrics
  const totalControls = controls?.length || 0;
  const passingControls = controls?.filter(c => c.current_status === 'pass').length || 0;
  const activeThreats = threats?.filter(t => t.risk_level === 'critical' || t.risk_level === 'high').length || 0;
  const currentMaturityLevel = getMaturityNumeric(organization?.current_maturity_level || 'level_1');
  const overallPassRate = passRate || 0;

  // Calculate ROI projection
  const currentRisk = totalRisk || 0;
  const targetMaturity = 4;
  const projection = calculateProjectedRiskReduction(currentRisk, currentMaturityLevel, targetMaturity);
  const investmentEstimate = 1200000; // $1.2M estimated investment
  const roi = projection.projectedRiskReduction > 0 ? (projection.projectedRiskReduction / investmentEstimate).toFixed(1) : 0;

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Executive Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Real-time compliance monitoring and financial risk quantification
          {organization && ` for ${organization.name}`}
        </p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </>
        ) : (
          <>
            <MetricCard
              title="Annual Risk Exposure"
              value={formatCurrency(totalRisk || 0)}
              subtitle="Based on FAIR methodology"
              icon={DollarSign}
              variant="critical"
              trend={{ value: 15, label: "vs last quarter", isPositive: true }}
              delay={0}
            />
            <MetricCard
              title="Controls Passing"
              value={passingControls.toString()}
              subtitle={`of ${totalControls} enabled controls`}
              icon={Shield}
              variant="success"
              trend={{ value: 5, label: "vs last month", isPositive: true }}
              delay={50}
            />
            <MetricCard
              title="Active Threats"
              value={activeThreats.toString()}
              subtitle="High/Critical scenarios"
              icon={AlertTriangle}
              variant="warning"
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
          </>
        )}
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
              <ComplianceGauge 
                value={Math.round(overallPassRate)} 
                label="Overall Compliance" 
                size="md" 
              />
              <MaturityIndicator 
                level={currentMaturityLevel + (overallPassRate > 80 ? 0.4 : 0.1)} 
                showLabels={false} 
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${overallPassRate >= 85 ? 'bg-success' : 'bg-warning'}`} />
                  <span className="text-sm text-muted-foreground">NIST CSF</span>
                </div>
                <span className="text-sm font-medium text-foreground">{Math.round(overallPassRate)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${overallPassRate >= 80 ? 'bg-success' : 'bg-warning'}`} />
                  <span className="text-sm text-muted-foreground">ISO 27001</span>
                </div>
                <span className="text-sm font-medium text-foreground">{Math.round(overallPassRate * 0.95)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${overallPassRate >= 75 ? 'bg-success' : 'bg-warning'}`} />
                  <span className="text-sm text-muted-foreground">SOC 2</span>
                </div>
                <span className="text-sm font-medium text-foreground">{Math.round(overallPassRate * 0.88)}%</span>
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
                <p className="text-2xl font-bold text-foreground">{formatCurrency(investmentEstimate)}</p>
                <p className="text-sm text-muted-foreground">to reach maturity level {targetMaturity}</p>
              </div>
              <div className="h-px bg-border my-3" />
              <div>
                <p className="text-sm text-muted-foreground">Expected risk reduction</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(projection.projectedRiskReduction)}</p>
                <p className="text-sm text-muted-foreground">per year ({roi}x ROI)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Research & Analytics Section */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BreachProbabilityTracker />
        <IndustryBenchmark />
      </div>

      {/* Threat Scenarios Section */}
      <div className="mt-6">
        <ThreatScenarioCard />
      </div>
    </AppLayout>
  );
};

export default Index;
