import { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp, AlertTriangle, DollarSign, Settings2, BarChart3, LineChart } from "lucide-react";

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
  volatility: initialVolatility = 0.3,
  iterations: initialIterations = 10000,
  className,
}: MonteCarloSimulationProps) {
  const [simulationKey, setSimulationKey] = useState(0);
  const [volatility, setVolatility] = useState(initialVolatility);
  const [iterations, setIterations] = useState(initialIterations);
  const [showSettings, setShowSettings] = useState(false);
  
  const { percentiles, distributionData, histogramData, stats } = useMemo(() => {
    const percentiles = runMonteCarloSimulation(baseRisk, volatility, iterations);
    const distributionData = generateDistributionData(baseRisk, volatility, iterations);
    
    const p5 = percentiles.find(p => p.percentile === 5)?.value || 0;
    const p25 = percentiles.find(p => p.percentile === 25)?.value || 0;
    const p50 = percentiles.find(p => p.percentile === 50)?.value || 0;
    const p75 = percentiles.find(p => p.percentile === 75)?.value || 0;
    const p95 = percentiles.find(p => p.percentile === 95)?.value || 0;
    
    // Generate histogram data for bar chart view
    const histogramData = distributionData.map((d, i) => ({
      ...d,
      fill: d.value < p25 ? 'hsl(var(--success))' 
          : d.value < p50 ? 'hsl(var(--success)/0.6)'
          : d.value < p75 ? 'hsl(var(--warning))'
          : 'hsl(var(--destructive))',
    }));
    
    return {
      percentiles,
      distributionData,
      histogramData,
      stats: {
        p5,
        p25,
        p50,
        p75,
        p95,
        range: p95 - p5,
        iqr: p75 - p25,
        confidenceInterval: `$${(p5 / 1000000).toFixed(1)}M - $${(p95 / 1000000).toFixed(1)}M`,
        iqrInterval: `$${(p25 / 1000000).toFixed(1)}M - $${(p75 / 1000000).toFixed(1)}M`,
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Settings2 className="h-4 w-4" />
            Settings
          </Button>
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
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="rounded-lg bg-muted/30 p-4 mb-6 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Volatility</Label>
                <span className="text-sm font-medium">{(volatility * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[volatility * 100]}
                onValueChange={(v) => setVolatility(v[0] / 100)}
                min={5}
                max={80}
                step={5}
              />
              <p className="text-xs text-muted-foreground">Higher volatility = wider distribution</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Iterations</Label>
                <span className="text-sm font-medium">{iterations.toLocaleString()}</span>
              </div>
              <Slider
                value={[iterations]}
                onValueChange={(v) => setIterations(v[0])}
                min={1000}
                max={50000}
                step={1000}
              />
              <p className="text-xs text-muted-foreground">More iterations = smoother distribution</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Confidence Interval Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="rounded-lg bg-success/10 border border-success/20 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <DollarSign className="h-3 w-3" />
            5th Percentile
          </div>
          <p className="text-lg font-bold text-success">{formatCurrency(stats.p5)}</p>
          <p className="text-[10px] text-muted-foreground">Best case</p>
        </div>
        <div className="rounded-lg bg-success/5 border border-success/10 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <DollarSign className="h-3 w-3" />
            25th Percentile
          </div>
          <p className="text-lg font-bold text-success/80">{formatCurrency(stats.p25)}</p>
          <p className="text-[10px] text-muted-foreground">Lower quartile</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <DollarSign className="h-3 w-3" />
            Median (50th)
          </div>
          <p className="text-lg font-bold text-foreground">{formatCurrency(stats.p50)}</p>
          <p className="text-[10px] text-muted-foreground">Expected value</p>
        </div>
        <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <AlertTriangle className="h-3 w-3" />
            75th Percentile
          </div>
          <p className="text-lg font-bold text-warning">{formatCurrency(stats.p75)}</p>
          <p className="text-[10px] text-muted-foreground">Upper quartile</p>
        </div>
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <AlertTriangle className="h-3 w-3" />
            95th Percentile
          </div>
          <p className="text-lg font-bold text-destructive">{formatCurrency(stats.p95)}</p>
          <p className="text-[10px] text-muted-foreground">Worst case</p>
        </div>
      </div>

      {/* Confidence Interval Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <TrendingUp className="h-3 w-3" />
            90% Confidence Interval
          </div>
          <p className="text-sm font-bold text-primary">{stats.confidenceInterval}</p>
          <p className="text-[10px] text-muted-foreground">P5 to P95 range</p>
        </div>
        <div className="rounded-lg bg-muted/50 border border-border p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <BarChart3 className="h-3 w-3" />
            Interquartile Range (IQR)
          </div>
          <p className="text-sm font-bold text-foreground">{stats.iqrInterval}</p>
          <p className="text-[10px] text-muted-foreground">P25 to P75 range (50% of outcomes)</p>
        </div>
      </div>
      
      {/* Chart Tabs */}
      <Tabs defaultValue="distribution" className="mb-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="distribution" className="gap-2 text-xs">
            <LineChart className="h-3 w-3" />
            Distribution Curve
          </TabsTrigger>
          <TabsTrigger value="histogram" className="gap-2 text-xs">
            <BarChart3 className="h-3 w-3" />
            Histogram
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="distribution" className="mt-4">
          <div className="h-64">
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
        </TabsContent>
        
        <TabsContent value="histogram" className="mt-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="range"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
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
                <Bar dataKey="probability" radius={[2, 2, 0, 0]}>
                  {histogramData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
      
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
        <h4 className="text-sm font-medium text-foreground mb-3">Risk Distribution by Percentile</h4>
        <div className="flex items-center gap-1">
          {percentiles.map((p, index) => (
            <div
              key={p.percentile}
              className={cn(
                "flex-1 h-10 rounded flex flex-col items-center justify-center transition-all",
                index === 0 && "bg-success/20 text-success",
                index === 1 && "bg-success/10 text-success/80",
                index === 2 && "bg-primary/20 text-primary",
                index === 3 && "bg-warning/20 text-warning",
                index === 4 && "bg-destructive/20 text-destructive"
              )}
            >
              <span className="text-xs font-medium">P{p.percentile}</span>
              <span className="text-[9px]">{formatCurrency(p.value)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>← Lower Risk</span>
          <span>Higher Risk →</span>
        </div>
      </div>
    </div>
  );
}
