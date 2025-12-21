import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jul", exposure: 450, projected: null },
  { month: "Aug", exposure: 420, projected: null },
  { month: "Sep", exposure: 380, projected: null },
  { month: "Oct", exposure: 340, projected: null },
  { month: "Nov", exposure: 310, projected: null },
  { month: "Dec", exposure: 285, projected: null },
  { month: "Jan", exposure: null, projected: 260 },
  { month: "Feb", exposure: null, projected: 235 },
  { month: "Mar", exposure: null, projected: 210 },
];

export function RiskExposureChart() {
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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
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
              tickFormatter={(value) => `$${value}M`}
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
              formatter={(value: number) => [`$${value}M`, "Risk Exposure"]}
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
      </div>
    </div>
  );
}
