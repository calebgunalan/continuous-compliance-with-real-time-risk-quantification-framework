import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, TrendingDown, Minus, Building2 } from "lucide-react";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BenchmarkMetric {
  name: string;
  value: number;
  industryAvg: number;
  percentile: number;
  unit: string;
}

export function OrganizationBenchmark() {
  const { organizationId } = useOrganizationContext();
  const { data: organization } = useOrganization(organizationId || "");

  // Fetch industry averages
  const { data: industryData } = useQuery({
    queryKey: ["industry-benchmark", organization?.industry],
    queryFn: async () => {
      if (!organization?.industry) return null;

      // Get all organizations in the same industry
      const { data: orgs } = await supabase
        .from("organizations")
        .select("current_maturity_level, current_risk_exposure, baseline_risk_exposure")
        .eq("industry", organization.industry);

      if (!orgs || orgs.length === 0) return null;

      // Calculate averages
      const maturityLevels = orgs.map(o => {
        const level = o.current_maturity_level;
        return level === "level_1" ? 1 : level === "level_2" ? 2 : level === "level_3" ? 3 : level === "level_4" ? 4 : 5;
      });
      const riskExposures = orgs.map(o => o.current_risk_exposure || 0);

      const avgMaturity = maturityLevels.reduce((a, b) => a + b, 0) / maturityLevels.length;
      const avgRisk = riskExposures.reduce((a, b) => a + b, 0) / riskExposures.length;

      return {
        avgMaturity,
        avgRisk,
        orgCount: orgs.length,
      };
    },
    enabled: !!organization?.industry,
  });

  // Calculate organization's metrics
  const orgMaturityLevel = organization?.current_maturity_level;
  const orgMaturityValue = orgMaturityLevel === "level_1" ? 1 : 
    orgMaturityLevel === "level_2" ? 2 : 
    orgMaturityLevel === "level_3" ? 3 : 
    orgMaturityLevel === "level_4" ? 4 : 5;
  
  const orgRiskExposure = organization?.current_risk_exposure || 0;

  // Calculate percentiles
  const maturityPercentile = industryData 
    ? Math.round((orgMaturityValue / 5) * 100)
    : 50;
  
  const riskPercentile = industryData && industryData.avgRisk > 0
    ? Math.round((1 - orgRiskExposure / (industryData.avgRisk * 2)) * 100)
    : 50;

  const metrics: BenchmarkMetric[] = [
    {
      name: "Maturity Level",
      value: orgMaturityValue,
      industryAvg: industryData?.avgMaturity || 2.5,
      percentile: maturityPercentile,
      unit: "Level",
    },
    {
      name: "Risk Exposure",
      value: orgRiskExposure / 1000000,
      industryAvg: (industryData?.avgRisk || 0) / 1000000,
      percentile: riskPercentile,
      unit: "$M",
    },
  ];

  const getTrendIcon = (value: number, avg: number, isRisk: boolean = false) => {
    const diff = value - avg;
    const isPositive = isRisk ? diff < 0 : diff > 0;
    const isNeutral = Math.abs(diff) < avg * 0.1;

    if (isNeutral) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (isPositive) return <TrendingUp className="h-4 w-4 text-success" />;
    return <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  const getPercentileLabel = (percentile: number) => {
    if (percentile >= 90) return { label: "Top 10%", color: "text-success" };
    if (percentile >= 75) return { label: "Top 25%", color: "text-success" };
    if (percentile >= 50) return { label: "Above Average", color: "text-primary" };
    if (percentile >= 25) return { label: "Below Average", color: "text-warning" };
    return { label: "Bottom 25%", color: "text-destructive" };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Industry Benchmark</CardTitle>
          </div>
          {industryData && (
            <Badge variant="secondary" className="gap-1">
              <Building2 className="h-3 w-3" />
              {industryData.orgCount} {organization?.industry} orgs
            </Badge>
          )}
        </div>
        <CardDescription>
          Compare your metrics against anonymized industry peers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric) => {
          const percentileInfo = getPercentileLabel(metric.percentile);
          const isRisk = metric.name.includes("Risk");

          return (
            <div key={metric.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{metric.name}</span>
                  {getTrendIcon(metric.value, metric.industryAvg, isRisk)}
                </div>
                <span className={cn("text-sm font-medium", percentileInfo.color)}>
                  {percentileInfo.label}
                </span>
              </div>

              {/* Comparison Bar */}
              <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                {/* Industry Average Marker */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-muted-foreground z-10"
                  style={{ 
                    left: `${Math.min(95, Math.max(5, (metric.industryAvg / (Math.max(metric.value, metric.industryAvg) * 1.5)) * 100))}%` 
                  }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap">
                    Avg: {metric.industryAvg.toFixed(1)}{metric.unit}
                  </div>
                </div>

                {/* Your Value Bar */}
                <div 
                  className={cn(
                    "h-full rounded-lg transition-all",
                    isRisk 
                      ? metric.value < metric.industryAvg ? "bg-success" : "bg-warning"
                      : metric.value > metric.industryAvg ? "bg-success" : "bg-warning"
                  )}
                  style={{ 
                    width: `${Math.min(100, (metric.value / (Math.max(metric.value, metric.industryAvg) * 1.5)) * 100)}%` 
                  }}
                />

                {/* Your Value Label */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-foreground">
                  {metric.value.toFixed(1)}{metric.unit}
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Your value: <span className="font-medium text-foreground">{metric.value.toFixed(1)}{metric.unit}</span>
                </span>
                <span>
                  Industry avg: <span className="font-medium text-foreground">{metric.industryAvg.toFixed(1)}{metric.unit}</span>
                </span>
                <span>
                  Percentile: <span className={cn("font-medium", percentileInfo.color)}>{metric.percentile}th</span>
                </span>
              </div>
            </div>
          );
        })}

        {/* Summary */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h4 className="font-medium text-foreground mb-2">Benchmark Summary</h4>
          <p className="text-sm text-muted-foreground">
            {orgMaturityValue > (industryData?.avgMaturity || 2.5) 
              ? "Your organization's maturity level exceeds the industry average. "
              : "Your organization's maturity level is below the industry average. Consider improving control implementations. "}
            {orgRiskExposure < (industryData?.avgRisk || 0)
              ? "Your risk exposure is lower than peers, indicating strong security posture."
              : "Your risk exposure is higher than peers. Focus on high-impact controls to reduce risk."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
