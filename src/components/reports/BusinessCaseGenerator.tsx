import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  Shield,
  Target,
  CheckCircle2,
  ArrowUpRight,
  Calculator,
  PieChart
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { calculateProjectedRiskReduction } from "@/hooks/useRiskCalculations";
import { toast } from "sonner";

interface BusinessCaseInputs {
  currentMaturityLevel: number;
  targetMaturityLevel: number;
  currentRiskExposure: number;
  investmentAmount: number;
  implementationMonths: number;
  breachCostEstimate: number;
}

export function BusinessCaseGenerator() {
  const { organizationId } = useOrganizationContext();
  const { data: currentOrganization } = useOrganization(organizationId || undefined);
  
  const [inputs, setInputs] = useState<BusinessCaseInputs>({
    currentMaturityLevel: parseFloat(currentOrganization?.current_maturity_level?.replace('level_', '') || '2'),
    targetMaturityLevel: 4,
    currentRiskExposure: currentOrganization?.current_risk_exposure || 5000000,
    investmentAmount: 650000,
    implementationMonths: 12,
    breachCostEstimate: 4500000,
  });

  const calculations = useMemo(() => {
    const riskProjection = calculateProjectedRiskReduction(
      inputs.currentRiskExposure,
      inputs.currentMaturityLevel,
      inputs.targetMaturityLevel,
      0.5
    );

    const annualRiskReduction = riskProjection.projectedRiskReduction;
    const roi = ((annualRiskReduction - inputs.investmentAmount) / inputs.investmentAmount) * 100;
    const paybackMonths = inputs.investmentAmount / (annualRiskReduction / 12);
    const threeYearValue = (annualRiskReduction * 3) - inputs.investmentAmount;
    const fiveYearValue = (annualRiskReduction * 5) - inputs.investmentAmount;
    
    // Breach probability reduction
    const breachProbReduction = (1 - riskProjection.targetBreachProbability / riskProjection.currentBreachProbability) * 100;
    const expectedBreachesAvoided = (riskProjection.currentBreachProbability - riskProjection.targetBreachProbability) * 3; // 3-year horizon
    const breachCostsSaved = expectedBreachesAvoided * inputs.breachCostEstimate;

    return {
      annualRiskReduction,
      roi,
      paybackMonths,
      threeYearValue,
      fiveYearValue,
      breachProbReduction,
      expectedBreachesAvoided,
      breachCostsSaved,
      currentBreachProb: riskProjection.currentBreachProbability * 100,
      targetBreachProb: riskProjection.targetBreachProbability * 100,
      projectedRisk: riskProjection.projectedRisk,
    };
  }, [inputs]);

  const projectionData = useMemo(() => {
    const data = [];
    const monthlyReduction = (inputs.currentRiskExposure - calculations.projectedRisk) / inputs.implementationMonths;
    
    for (let month = 0; month <= 36; month++) {
      const implementationProgress = Math.min(month / inputs.implementationMonths, 1);
      const riskAtMonth = inputs.currentRiskExposure - (monthlyReduction * Math.min(month, inputs.implementationMonths));
      const cumulativeInvestment = month <= inputs.implementationMonths 
        ? (inputs.investmentAmount / inputs.implementationMonths) * month 
        : inputs.investmentAmount;
      const cumulativeSavings = month > inputs.implementationMonths / 2 
        ? (calculations.annualRiskReduction / 12) * (month - inputs.implementationMonths / 2)
        : 0;
      
      data.push({
        month: `M${month}`,
        risk: Math.round(riskAtMonth),
        investment: Math.round(cumulativeInvestment),
        savings: Math.round(cumulativeSavings),
        netValue: Math.round(cumulativeSavings - cumulativeInvestment),
      });
    }
    return data;
  }, [inputs, calculations]);

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const generateReport = () => {
    // In a real implementation, this would generate a PDF
    toast.success("Business case report generated", {
      description: "Report has been prepared for download",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="calculator">
            <Calculator className="h-4 w-4 mr-2" />
            ROI Calculator
          </TabsTrigger>
          <TabsTrigger value="projections">
            <TrendingUp className="h-4 w-4 mr-2" />
            Projections
          </TabsTrigger>
          <TabsTrigger value="report">
            <FileText className="h-4 w-4 mr-2" />
            Executive Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Inputs Card */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Parameters</CardTitle>
                <CardDescription>Configure your governance investment scenario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Current Maturity Level</Label>
                    <span className="text-sm font-medium">{inputs.currentMaturityLevel.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[inputs.currentMaturityLevel]}
                    min={1}
                    max={5}
                    step={0.1}
                    onValueChange={([value]) => setInputs(prev => ({ ...prev, currentMaturityLevel: value }))}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Target Maturity Level</Label>
                    <span className="text-sm font-medium">{inputs.targetMaturityLevel.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[inputs.targetMaturityLevel]}
                    min={inputs.currentMaturityLevel}
                    max={5}
                    step={0.1}
                    onValueChange={([value]) => setInputs(prev => ({ ...prev, targetMaturityLevel: value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Current Annual Risk Exposure ($)</Label>
                  <Input
                    type="number"
                    value={inputs.currentRiskExposure}
                    onChange={(e) => setInputs(prev => ({ ...prev, currentRiskExposure: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Proposed Investment ($)</Label>
                  <Input
                    type="number"
                    value={inputs.investmentAmount}
                    onChange={(e) => setInputs(prev => ({ ...prev, investmentAmount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Implementation Timeline</Label>
                    <span className="text-sm font-medium">{inputs.implementationMonths} months</span>
                  </div>
                  <Slider
                    value={[inputs.implementationMonths]}
                    min={3}
                    max={24}
                    step={1}
                    onValueChange={([value]) => setInputs(prev => ({ ...prev, implementationMonths: value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estimated Breach Cost ($)</Label>
                  <Input
                    type="number"
                    value={inputs.breachCostEstimate}
                    onChange={(e) => setInputs(prev => ({ ...prev, breachCostEstimate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Results Card */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Analysis</CardTitle>
                <CardDescription>Projected returns and risk reduction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 grid-cols-2">
                  <div className="p-4 bg-success/10 rounded-lg">
                    <div className="flex items-center gap-2 text-success mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs font-medium">ROI</span>
                    </div>
                    <p className="text-2xl font-bold text-success">{calculations.roi.toFixed(0)}%</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs font-medium">Annual Savings</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(calculations.annualRiskReduction)}</p>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-lg">
                    <div className="flex items-center gap-2 text-warning mb-1">
                      <Target className="h-4 w-4" />
                      <span className="text-xs font-medium">Payback Period</span>
                    </div>
                    <p className="text-2xl font-bold text-warning">{calculations.paybackMonths.toFixed(1)} mo</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-foreground mb-1">
                      <Shield className="h-4 w-4" />
                      <span className="text-xs font-medium">Breach Prob. Reduction</span>
                    </div>
                    <p className="text-2xl font-bold">{calculations.breachProbReduction.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Current Breach Probability</span>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive">
                      {calculations.currentBreachProb.toFixed(1)}% /year
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Projected Breach Probability</span>
                    <Badge variant="outline" className="bg-success/10 text-success">
                      {calculations.targetBreachProb.toFixed(1)}% /year
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">3-Year Net Value</span>
                    <span className="font-bold text-success">{formatCurrency(calculations.threeYearValue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">5-Year Net Value</span>
                    <span className="font-bold text-success">{formatCurrency(calculations.fiveYearValue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Expected Breaches Avoided (3yr)</span>
                    <span className="font-bold">{calculations.expectedBreachesAvoided.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Breach Costs Saved (3yr)</span>
                    <span className="font-bold text-success">{formatCurrency(calculations.breachCostsSaved)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-6 mt-6">
          {/* Risk Reduction Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Exposure Projection</CardTitle>
              <CardDescription>Projected risk reduction over 36 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData}>
                    <defs>
                      <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      tickFormatter={(v) => formatCurrency(v)}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Risk Exposure']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="risk" 
                      stroke="hsl(var(--destructive))" 
                      fill="url(#riskGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Investment vs Savings */}
          <Card>
            <CardHeader>
              <CardTitle>Investment vs Cumulative Savings</CardTitle>
              <CardDescription>Financial trajectory showing payback point</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      tickFormatter={(v) => formatCurrency(v)}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name) => [formatCurrency(value), name]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="investment" 
                      stroke="hsl(var(--warning))" 
                      strokeWidth={2}
                      dot={false}
                      name="Investment"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="savings" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      dot={false}
                      name="Savings"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netValue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Net Value"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-warning" />
                  <span className="text-sm text-muted-foreground">Investment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-success" />
                  <span className="text-sm text-muted-foreground">Cumulative Savings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-primary" style={{ borderStyle: 'dashed' }} />
                  <span className="text-sm text-muted-foreground">Net Value</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Executive Business Case</CardTitle>
                  <CardDescription>Board-ready summary of governance investment proposal</CardDescription>
                </div>
                <Button onClick={generateReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <div className="p-6 bg-muted/30 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                <p className="text-muted-foreground">
                  This proposal requests an investment of <strong>{formatCurrency(inputs.investmentAmount)}</strong> to 
                  improve organizational governance maturity from Level {inputs.currentMaturityLevel.toFixed(1)} to 
                  Level {inputs.targetMaturityLevel.toFixed(1)} over {inputs.implementationMonths} months.
                </p>
                <div className="grid gap-4 md:grid-cols-3 mt-4">
                  <div className="p-4 bg-background rounded-lg text-center">
                    <p className="text-2xl font-bold text-success">{calculations.roi.toFixed(0)}%</p>
                    <p className="text-sm text-muted-foreground">Projected ROI</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{formatCurrency(calculations.annualRiskReduction)}</p>
                    <p className="text-sm text-muted-foreground">Annual Risk Reduction</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg text-center">
                    <p className="text-2xl font-bold text-warning">{calculations.paybackMonths.toFixed(1)} mo</p>
                    <p className="text-sm text-muted-foreground">Payback Period</p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-3">Key Benefits</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Risk Reduction</p>
                    <p className="text-sm text-muted-foreground">
                      Annual risk exposure reduced by {formatCurrency(calculations.annualRiskReduction)} through improved 
                      control effectiveness and reduced breach probability.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Breach Prevention</p>
                    <p className="text-sm text-muted-foreground">
                      Breach probability reduced from {calculations.currentBreachProb.toFixed(1)}% to {calculations.targetBreachProb.toFixed(1)}% 
                      annually, potentially avoiding {calculations.expectedBreachesAvoided.toFixed(2)} breaches over 3 years.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium">Long-term Value</p>
                    <p className="text-sm text-muted-foreground">
                      5-year net present value of {formatCurrency(calculations.fiveYearValue)} with continued 
                      risk reduction benefits beyond initial implementation.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-3">Recommendation</h3>
              <p className="text-muted-foreground">
                Based on the analysis, this investment delivers strong returns with a {calculations.paybackMonths.toFixed(1)}-month 
                payback period and {calculations.roi.toFixed(0)}% ROI. The reduction in breach probability alone justifies the 
                investment, with potential savings of {formatCurrency(calculations.breachCostsSaved)} in avoided breach costs 
                over three years. We recommend approval of this governance improvement initiative.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
