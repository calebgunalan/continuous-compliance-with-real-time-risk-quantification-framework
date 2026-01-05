import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart,
  Area,
} from "recharts";
import { 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle,
  Download,
  RefreshCw,
  Info
} from "lucide-react";

interface DataPoint {
  maturityLevel: number;
  breachProbability: number;
  organization: string;
  observedBreaches: number;
}

// Generate mock research data
const generateResearchData = (): DataPoint[] => {
  const data: DataPoint[] = [];
  const orgNames = [
    "FinCorp A", "HealthNet B", "TechStart C", "ManufactCo D", "RetailX E",
    "BankSafe F", "MedTech G", "CloudSys H", "AutoParts I", "InsureCo J",
    "DataFlow K", "SecureNet L", "HealthFirst M", "TechGiant N", "LogiCorp O",
    "FinServ P", "MedSystems Q", "CloudBase R", "AutoTech S", "InsureMax T",
  ];

  // Generate data points with some realistic scatter
  orgNames.forEach((org, index) => {
    const baseMaturity = 1 + Math.random() * 4; // 1-5
    const maturityLevel = Math.round(baseMaturity * 10) / 10;
    
    // Exponential decay with some noise
    const k = 0.7; // decay constant
    const baseProbability = 0.8 * Math.exp(-k * maturityLevel);
    const noise = (Math.random() - 0.5) * 0.15;
    const breachProbability = Math.max(0.01, Math.min(1, baseProbability + noise));
    
    // Observed breaches based on probability
    const observedBreaches = Math.round(breachProbability * 10 * Math.random() * 2);
    
    data.push({
      maturityLevel,
      breachProbability,
      organization: org,
      observedBreaches,
    });
  });

  return data.sort((a, b) => a.maturityLevel - b.maturityLevel);
};

// Calculate Pearson correlation
const calculateCorrelation = (data: DataPoint[]): number => {
  const n = data.length;
  const sumX = data.reduce((sum, d) => sum + d.maturityLevel, 0);
  const sumY = data.reduce((sum, d) => sum + d.breachProbability, 0);
  const sumXY = data.reduce((sum, d) => sum + d.maturityLevel * d.breachProbability, 0);
  const sumX2 = data.reduce((sum, d) => sum + d.maturityLevel * d.maturityLevel, 0);
  const sumY2 = data.reduce((sum, d) => sum + d.breachProbability * d.breachProbability, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

// Calculate exponential fit parameters
const calculateExponentialFit = (data: DataPoint[]) => {
  // Simple least squares for exponential: y = a * e^(bx)
  // Transform to linear: ln(y) = ln(a) + bx
  const validData = data.filter(d => d.breachProbability > 0);
  const n = validData.length;
  
  const sumX = validData.reduce((sum, d) => sum + d.maturityLevel, 0);
  const sumLnY = validData.reduce((sum, d) => sum + Math.log(d.breachProbability), 0);
  const sumXLnY = validData.reduce((sum, d) => sum + d.maturityLevel * Math.log(d.breachProbability), 0);
  const sumX2 = validData.reduce((sum, d) => sum + d.maturityLevel * d.maturityLevel, 0);

  const b = (n * sumXLnY - sumX * sumLnY) / (n * sumX2 - sumX * sumX);
  const lnA = (sumLnY - b * sumX) / n;
  const a = Math.exp(lnA);

  return { a, k: -b }; // k is the decay constant (positive for decay)
};

export function CorrelationValidator() {
  const data = useMemo(() => generateResearchData(), []);
  const correlation = useMemo(() => calculateCorrelation(data), [data]);
  const { a, k } = useMemo(() => calculateExponentialFit(data), [data]);

  // Generate exponential curve for visualization
  const curveData = useMemo(() => {
    const curve = [];
    for (let x = 1; x <= 5; x += 0.1) {
      curve.push({
        maturityLevel: Math.round(x * 10) / 10,
        predictedProbability: a * Math.exp(-k * x),
      });
    }
    return curve;
  }, [a, k]);

  // Calculate R-squared
  const rSquared = useMemo(() => {
    const meanY = data.reduce((sum, d) => sum + d.breachProbability, 0) / data.length;
    const ssTot = data.reduce((sum, d) => sum + Math.pow(d.breachProbability - meanY, 2), 0);
    const ssRes = data.reduce((sum, d) => {
      const predicted = a * Math.exp(-k * d.maturityLevel);
      return sum + Math.pow(d.breachProbability - predicted, 2);
    }, 0);
    return 1 - ssRes / ssTot;
  }, [data, a, k]);

  // Determine validation status
  const isValidated = correlation <= -0.6 && rSquared >= 0.5;
  const pValue = 0.001 + Math.random() * 0.03; // Simulated p-value

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <Card className={isValidated ? "border-success/50 bg-success/5" : "border-warning/50 bg-warning/5"}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isValidated ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/15">
                  <AlertCircle className="h-6 w-6 text-warning" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  Hypothesis H1: Maturity-Breach Correlation
                </h3>
                <p className="text-muted-foreground">
                  {isValidated 
                    ? "Strong negative correlation validated - higher maturity = lower breach probability"
                    : "Collecting more data to reach statistical significance"
                  }
                </p>
              </div>
            </div>
            <Badge className={isValidated ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
              {isValidated ? "VALIDATED" : "IN PROGRESS"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Correlation (r)</p>
              <p className={`text-3xl font-bold ${correlation <= -0.6 ? 'text-success' : 'text-warning'}`}>
                {correlation.toFixed(3)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Target: r ≤ -0.6</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">R-Squared (R²)</p>
              <p className={`text-3xl font-bold ${rSquared >= 0.5 ? 'text-success' : 'text-warning'}`}>
                {rSquared.toFixed(3)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Target: R² ≥ 0.5</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">P-Value</p>
              <p className={`text-3xl font-bold ${pValue < 0.05 ? 'text-success' : 'text-warning'}`}>
                {pValue.toFixed(4)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Target: p &lt; 0.05</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Decay Constant (k)</p>
              <p className="text-3xl font-bold text-primary">
                {k.toFixed(3)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">P(breach) = {a.toFixed(2)}e^(-{k.toFixed(2)}×maturity)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scatter Plot with Regression */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                Maturity vs Breach Probability
              </CardTitle>
              <CardDescription>
                Scatter plot with exponential decay regression fit
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="maturityLevel" 
                  type="number"
                  domain={[1, 5]}
                  tickCount={5}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ 
                    value: 'Maturity Level', 
                    position: 'bottom', 
                    offset: 20,
                    style: { fill: 'hsl(var(--muted-foreground))' }
                  }}
                />
                <YAxis 
                  dataKey="breachProbability"
                  type="number"
                  domain={[0, 1]}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ 
                    value: 'Breach Probability', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: 'hsl(var(--muted-foreground))' }
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "breachProbability") return [`${(value * 100).toFixed(1)}%`, 'Observed'];
                    if (name === "predictedProbability") return [`${(value * 100).toFixed(1)}%`, 'Predicted'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Maturity: ${label}`}
                />
                
                {/* Regression curve */}
                <Area
                  data={curveData}
                  type="monotone"
                  dataKey="predictedProbability"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
                
                {/* Data points */}
                <Scatter 
                  data={data} 
                  dataKey="breachProbability"
                  fill="hsl(var(--destructive))"
                  shape="circle"
                />
                
                {/* Reference lines for maturity levels */}
                <ReferenceLine x={3} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" opacity={0.5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Observed Data Points</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-primary" />
              <span className="text-muted-foreground">Exponential Fit</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Model Specification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-semibold">Exponential Decay Model</h4>
              <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">
                P(breach) = {a.toFixed(4)} × e<sup>-{k.toFixed(4)} × maturity</sup>
              </div>
              <p className="text-sm text-muted-foreground">
                This model predicts that each increase in maturity level reduces breach probability 
                by approximately {((1 - Math.exp(-k)) * 100).toFixed(1)}%.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Predicted Breach Probability by Level</h4>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(level => {
                  const prob = a * Math.exp(-k * level);
                  return (
                    <div key={level} className="flex items-center justify-between">
                      <span>Level {level}</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${prob * 100}px` }}
                        />
                        <span className="font-mono text-sm w-16 text-right">
                          {(prob * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
