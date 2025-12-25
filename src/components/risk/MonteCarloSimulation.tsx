import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";

interface SimulationResult {
  percentile: number;
  value: number;
}

interface MonteCarloSimulationProps {
  baseRisk: number;
  volatility?: number;
  iterations?: number;
  className?: string;
}

function runMonteCarloSimulation(
  baseRisk: number,
  volatility: number,
  iterations: number
): SimulationResult[] {
  const results: number[] = [];
  
  // Run simulation iterations
  for (let i = 0; i < iterations; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    // Calculate simulated risk value
    const simulatedRisk = baseRisk * (1 + volatility * z);
    results.push(Math.max(0, simulatedRisk));
  }
  
  // Sort results for percentile calculation
  results.sort((a, b) => a - b);
  
  // Create histogram bins
  const min = Math.min(...results);
  const max = Math.max(...results);
  const binCount = 30;
  const binWidth = (max - min) / binCount;
  
  const histogram: { range: string; count: number; value: number }[] = [];
  for (let i = 0; i < binCount; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = results.filter(r => r >= binStart && r < binEnd).length;
    histogram.push({
      range: `${(binStart / 1000000).toFixed(1)}M`,
      count,
      value: (binStart + binEnd) / 2,
    });
  }
  
  // Calculate key percentiles
  const getPercentile = (p: number) => results[Math.floor(results.length * p / 100)];
  
  return [
    { percentile: 5, value: getPercentile(5) },
    { percentile: 25, value: getPercentile(25) },
    { percentile: 50, value: getPercentile(50) },
    { percentile: 75, value: getPercentile(75) },
    { percentile: 95, value: getPercentile(95) },
  ];
}

function generateDistributionData(
  baseRisk: number,
  volatility: number,
  iterations: number
): { range: string; probability: number; cumulative: number; value: number }[] {
  const results: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const simulatedRisk = baseRisk * (1 + volatility * z);
    results.push(Math.max(0, simulatedRisk));
  }
  
  results.sort((a, b) => a - b);
  
  const min = Math.min(...results);
  const max = Math.max(...results);
  const binCount = 40;
  const binWidth = (max - min) / binCount;
  
  const histogram: { range: string; probability: number; cumulative: number; value: number }[] = [];
  let cumulative = 0;
  
  for (let i = 0; i < binCount; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = results.filter(r => r >= binStart && r < binEnd).length;
    const probability = (count / iterations) * 100;
    cumulative += probability;
    
    histogram.push({
      range: `$${(binStart / 1000000).toFixed(1)}M`,
      probability,
      cumulative,
      value: (binStart + binEnd) / 2,
    });
  }
  
  return histogram;
}

export function MonteCarloSimulation({
  baseRisk,
  volatility = 0.3,
  iterations = 10000,
  className,
}: MonteCarloSimulationProps) {
  const [simulationKey, setSimulationKey] = useState(0);
  
  const { percentiles, distributionData, stats } = useMemo(() => {
    const percentiles = runMonteCarloSimulation(baseRisk, volatility, iterations);
    const distributionData = generateDistributionData(baseRisk, volatility, iterations);
    
    const p5 = percentiles.find(p => p.percentile === 5)?.value || 0;
    const p50 = percentiles.find(p => p.percentile === 50)?.value || 0;
    const p95 = percentiles.find(p => p.percentile === 95)?.value || 0;
    
    return {
      percentiles,
      distributionData,
      stats: {
        p5,
        p50,
        p95,
        range: p95 - p5,
        confidenceInterval: `$${(p5 / 1000000).toFixed(1)}M - $${(p95 / 1000000).toFixed(1)}M`,
      },
    };
  }, [baseRisk, volatility, iterations, simulationKey]);
  
  const formatCurrency = (value: number) => `$${(value / 1000000).toFixed(1)}M`;
  
  return (
    <div className={cn("metric-card animate-slide-up", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Monte Carlo Risk Simulation
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {iterations.toLocaleString()} iterations with {(volatility * 100).toFixed(0)}% volatility
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSimulationKey(k => k + 1)}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Re-run
        </Button>
      </div>
      
      {/* Confidence Interval Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <DollarSign className="h-3 w-3" />
            5th Percentile
          </div>
          <p className="text-lg font-bold text-success">{formatCurrency(stats.p5)}</p>
          <p className="text-[10px] text-muted-foreground">Best case (95% confidence)</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <DollarSign className="h-3 w-3" />
            Median (50th)
          </div>
          <p className="text-lg font-bold text-foreground">{formatCurrency(stats.p50)}</p>
          <p className="text-[10px] text-muted-foreground">Expected value</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <AlertTriangle className="h-3 w-3" />
            95th Percentile
          </div>
          <p className="text-lg font-bold text-destructive">{formatCurrency(stats.p95)}</p>
          <p className="text-[10px] text-muted-foreground">Worst case (95% confidence)</p>
        </div>
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <TrendingUp className="h-3 w-3" />
            90% Confidence
          </div>
          <p className="text-sm font-bold text-primary">{stats.confidenceInterval}</p>
          <p className="text-[10px] text-muted-foreground">Annual loss exposure range</p>
        </div>
      </div>
      
      {/* Distribution Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={distributionData} margin={{ left: 10, right: 10 }}>
            <defs>
              <linearGradient id="probabilityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="range"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, "Probability"]}
            />
            <ReferenceLine
              x={distributionData.find(d => d.value >= stats.p50)?.range}
              stroke="hsl(var(--primary))"
              strokeDasharray="5 5"
              label={{ value: "Median", position: "top", fill: "hsl(var(--primary))", fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="probability"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#probabilityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Percentile Breakdown */}
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Percentile Distribution</h4>
        <div className="flex items-center gap-1">
          {percentiles.map((p, index) => (
            <div
              key={p.percentile}
              className={cn(
                "flex-1 h-8 rounded flex items-center justify-center text-xs font-medium transition-all",
                index === 0 && "bg-success/20 text-success",
                index === 1 && "bg-success/10 text-success",
                index === 2 && "bg-primary/20 text-primary",
                index === 3 && "bg-warning/20 text-warning",
                index === 4 && "bg-destructive/20 text-destructive"
              )}
            >
              P{p.percentile}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 mt-1">
          {percentiles.map((p, index) => (
            <div key={p.percentile} className="flex-1 text-center">
              <span className="text-[10px] text-muted-foreground">{formatCurrency(p.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
