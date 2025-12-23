import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRiskCalculations } from "@/hooks/useRiskCalculations";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function RiskExposureChart() {
  const { organizationId } = useOrganizationContext();
  const { data: riskCalculations, isLoading } = useRiskCalculations(organizationId || '', 12);

  // Transform data for chart - show actual data and project future
  const chartData = riskCalculations?.map((calc, index) => ({
    month: format(new Date(calc.calculated_at), 'MMM'),
    exposure: calc.total_risk_exposure / 1000000, // Convert to millions
    projected: index >= (riskCalculations.length - 3) ? calc.projected_risk_exposure ? calc.projected_risk_exposure / 1000000 : null : null,
  })).reverse() || [];

  if (isLoading) {
    return (
      <div className="metric-card h-full animate-slide-up" style={{ animationDelay: "200ms" }}>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="metric-card h-full animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Risk Exposure Trend</h3>
          <p className="text-sm text-muted-foreground">Annual Loss Exposure (ALE) in millions</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-6 rounded-full bg-primary" />
            <span className="text-muted-foreground">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-6 rounded-full bg-primary/40" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, hsl(var(--primary) / 0.4) 2px, hsl(var(--primary) / 0.4) 4px)" }} />
            <span className="text-muted-foreground">Projected</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-lg)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                itemStyle={{ color: "hsl(var(--primary))" }}
                formatter={(value: number) => [`$${value.toFixed(1)}M`, "Risk Exposure"]}
              />
              <Area
                type="monotone"
                dataKey="exposure"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#riskGradient)"
              />
              <Area
                type="monotone"
                dataKey="projected"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#projectedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No risk calculation data available
          </div>
        )}
      </div>
    </div>
  );
}
