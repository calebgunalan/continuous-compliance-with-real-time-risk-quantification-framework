import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  ArrowRight,
  Sparkles,
  Calculator,
  PiggyBank,
  Plus,
  Trash2,
  Copy,
  BarChart3
} from "lucide-react";
import { calculateProjectedRiskReduction, useLatestRiskCalculation } from "@/hooks/useRiskCalculations";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const maturityLabels: Record<number, { label: string; description: string }> = {
  1: { label: "Level 1 - Reactive", description: "30-40% controls passing" },
  2: { label: "Level 2 - Repeatable", description: "50-60% controls passing" },
  3: { label: "Level 3 - Defined", description: "70-80% controls passing" },
  4: { label: "Level 4 - Managed", description: "85-95% controls passing" },
  5: { label: "Level 5 - Optimized", description: "95%+ controls passing" },
};

const maturityLevelToNumber = (level: string): number => {
  const match = level.match(/level_(\d)/);
  return match ? parseInt(match[1]) : 1;
};

interface ComparisonScenario {
  id: string;
  name: string;
  targetMaturity: number;
  investment: number;
  timeframe: number;
}

export function WhatIfScenarioModeler() {
  const { organizationId } = useOrganizationContext();
  const { data: latestRisk } = useLatestRiskCalculation(organizationId || "");
  
  const currentMaturityLevel = latestRisk 
    ? maturityLevelToNumber(latestRisk.maturity_level) 
    : 2;
  const currentRiskExposure = latestRisk?.total_risk_exposure || 300;

  const [targetMaturity, setTargetMaturity] = useState(Math.min(currentMaturityLevel + 1, 5));
  const [investmentAmount, setInvestmentAmount] = useState(500000);
  const [timeframeMonths, setTimeframeMonths] = useState(12);
  
  const [scenarios, setScenarios] = useState<ComparisonScenario[]>([
    { id: '1', name: 'Conservative', targetMaturity: Math.min(currentMaturityLevel + 1, 5), investment: 300000, timeframe: 18 },
    { id: '2', name: 'Aggressive', targetMaturity: Math.min(currentMaturityLevel + 2, 5), investment: 800000, timeframe: 12 },
  ]);

  const projection = useMemo(() => {
    return calculateProjectedRiskReduction(
      currentRiskExposure,
      currentMaturityLevel,
      targetMaturity
    );
  }, [currentRiskExposure, currentMaturityLevel, targetMaturity]);

  const roi = useMemo(() => {
    const investmentInMillions = investmentAmount / 1_000_000;
    const annualizedRiskReduction = projection.projectedRiskReduction;
    const netBenefit = annualizedRiskReduction - investmentInMillions;
    const roiPercent = investmentInMillions > 0 
      ? ((annualizedRiskReduction - investmentInMillions) / investmentInMillions) * 100 
      : 0;
    const paybackMonths = annualizedRiskReduction > 0 
      ? (investmentInMillions / annualizedRiskReduction) * 12 
      : Infinity;
    
    return {
      netBenefit,
      roiPercent,
      paybackMonths,
      breakEven: paybackMonths <= timeframeMonths,
    };
  }, [projection, investmentAmount, timeframeMonths]);

  const formatCurrency = (value: number, inMillions = true) => {
    if (inMillions) {
      return `$${value.toFixed(1)}M`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate projections for comparison scenarios
  const scenarioProjections = useMemo(() => {
    return scenarios.map(scenario => {
      const proj = calculateProjectedRiskReduction(
        currentRiskExposure,
        currentMaturityLevel,
        scenario.targetMaturity
      );
      const investmentInMillions = scenario.investment / 1_000_000;
      const roiPercent = investmentInMillions > 0 
        ? ((proj.projectedRiskReduction - investmentInMillions) / investmentInMillions) * 100 
        : 0;
      const paybackMonths = proj.projectedRiskReduction > 0 
        ? (investmentInMillions / proj.projectedRiskReduction) * 12 
        : Infinity;
      
      return {
        ...scenario,
        projection: proj,
        roi: roiPercent,
        paybackMonths,
        netBenefit: proj.projectedRiskReduction - investmentInMillions,
      };
    });
  }, [scenarios, currentRiskExposure, currentMaturityLevel]);

  // Comparison chart data
  const comparisonChartData = useMemo(() => {
    const current = {
      name: 'Current',
      riskExposure: currentRiskExposure,
      investment: 0,
      netBenefit: 0,
    };
    
    const primaryScenario = {
      name: 'Your Scenario',
      riskExposure: projection.projectedRisk,
      investment: investmentAmount / 1_000_000,
      netBenefit: roi.netBenefit,
    };
    
    const scenarioData = scenarioProjections.map(s => ({
      name: s.name,
      riskExposure: s.projection.projectedRisk,
      investment: s.investment / 1_000_000,
      netBenefit: s.netBenefit,
    }));
    
    return [current, primaryScenario, ...scenarioData];
  }, [currentRiskExposure, projection, investmentAmount, roi, scenarioProjections]);

  const addScenario = () => {
    const newScenario: ComparisonScenario = {
      id: Date.now().toString(),
      name: `Scenario ${scenarios.length + 1}`,
      targetMaturity: Math.min(currentMaturityLevel + 1, 5),
      investment: 500000,
      timeframe: 12,
    };
    setScenarios([...scenarios, newScenario]);
  };

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const updateScenario = (id: string, field: keyof ComparisonScenario, value: number | string) => {
    setScenarios(scenarios.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  return (
    <Card className="animate-slide-up border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">What-If Scenario Modeling</CardTitle>
            <CardDescription>Simulate maturity improvements and compare investment scenarios</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="single" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="single" className="gap-2">
              <Calculator className="h-4 w-4" />
              Single Scenario
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Compare Scenarios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-6">
            {/* Current State */}
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Current State</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Maturity Level</p>
                  <p className="text-lg font-bold">{maturityLabels[currentMaturityLevel].label}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Risk Exposure</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(currentRiskExposure)}/yr</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Target Maturity Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Target Maturity Level</Label>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {maturityLabels[targetMaturity].label.split(" - ")[1]}
                </Badge>
              </div>
              <Slider
                value={[targetMaturity]}
                onValueChange={(v) => setTargetMaturity(Math.max(v[0], currentMaturityLevel))}
                min={1}
                max={5}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {[1, 2, 3, 4, 5].map((level) => (
                  <span 
                    key={level} 
                    className={level === targetMaturity ? "text-primary font-medium" : level < currentMaturityLevel ? "opacity-50" : ""}
                  >
                    L{level}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{maturityLabels[targetMaturity].description}</p>
            </div>

            {/* Investment Input */}
            <div className="space-y-2">
              <Label htmlFor="investment" className="text-sm font-medium">Estimated Investment</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="investment"
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="pl-9"
                  placeholder="500000"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Total cost for controls, tools, and process improvements
              </p>
            </div>

            {/* Timeframe */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Implementation Timeframe</Label>
              <div className="flex gap-2">
                {[6, 12, 18, 24].map((months) => (
                  <button
                    key={months}
                    onClick={() => setTimeframeMonths(months)}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                      timeframeMonths === months 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {months}mo
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Projection Results */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Projected Outcomes</p>
              </div>

              {/* Risk Reduction Visualization */}
              <div className="rounded-lg bg-gradient-to-r from-destructive/10 via-warning/10 to-success/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Current Risk</p>
                    <p className="text-xl font-bold text-destructive">{formatCurrency(currentRiskExposure)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-success">
                    <ArrowRight className="h-5 w-5" />
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Projected Risk</p>
                    <p className="text-xl font-bold text-success">{formatCurrency(projection.projectedRisk)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Badge className="bg-success/20 text-success border-success/30">
                    {formatCurrency(projection.projectedRiskReduction)} Risk Reduction
                  </Badge>
                  <Badge variant="outline">
                    {(projection.reductionFactor * 100).toFixed(0)}% decrease
                  </Badge>
                </div>
              </div>

              {/* ROI Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-card border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className={`h-4 w-4 ${roi.roiPercent >= 0 ? "text-success" : "text-destructive"}`} />
                    <p className="text-xs text-muted-foreground">ROI</p>
                  </div>
                  <p className={`text-2xl font-bold ${roi.roiPercent >= 0 ? "text-success" : "text-destructive"}`}>
                    {roi.roiPercent >= 0 ? "+" : ""}{roi.roiPercent.toFixed(0)}%
                  </p>
                </div>
                <div className="rounded-lg bg-card border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <PiggyBank className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Net Benefit</p>
                  </div>
                  <p className={`text-2xl font-bold ${roi.netBenefit >= 0 ? "text-success" : "text-destructive"}`}>
                    {formatCurrency(roi.netBenefit)}
                  </p>
                </div>
              </div>

              {/* Payback Period */}
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Payback Period</p>
                    <p className="text-xs text-muted-foreground">Time to recover investment</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {roi.paybackMonths === Infinity ? "N/A" : `${roi.paybackMonths.toFixed(1)} months`}
                    </p>
                    {roi.breakEven ? (
                      <Badge className="bg-success/20 text-success border-success/30 text-xs">
                        Within timeframe
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Exceeds {timeframeMonths}mo
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-sm font-medium text-foreground mb-2">Executive Summary</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {targetMaturity > currentMaturityLevel ? (
                    <>
                      Investing <span className="font-medium text-foreground">{formatCurrency(investmentAmount / 1_000_000)}</span> to 
                      reach <span className="font-medium text-foreground">{maturityLabels[targetMaturity].label}</span> over{" "}
                      <span className="font-medium text-foreground">{timeframeMonths} months</span> would reduce annual risk exposure 
                      by <span className="font-medium text-success">{formatCurrency(projection.projectedRiskReduction)}</span>, 
                      yielding a <span className={`font-medium ${roi.roiPercent >= 0 ? "text-success" : "text-destructive"}`}>
                        {roi.roiPercent.toFixed(0)}% ROI
                      </span> with payback in{" "}
                      <span className="font-medium text-foreground">
                        {roi.paybackMonths === Infinity ? "N/A" : `${roi.paybackMonths.toFixed(1)} months`}
                      </span>.
                    </>
                  ) : (
                    <>
                      You are already at or above the target maturity level. Select a higher target to see projected improvements.
                    </>
                  )}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            {/* Comparison Chart */}
            <div className="rounded-lg bg-muted/20 p-4">
              <h4 className="text-sm font-medium mb-4">Scenario Comparison</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      tickFormatter={(value) => `$${value}M`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        `$${value.toFixed(1)}M`,
                        name === 'riskExposure' ? 'Risk Exposure' : name === 'netBenefit' ? 'Net Benefit' : name
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="riskExposure" name="Risk Exposure" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="netBenefit" name="Net Benefit" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparison Scenarios List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Comparison Scenarios</h4>
                <Button size="sm" variant="outline" onClick={addScenario} className="gap-2">
                  <Plus className="h-3 w-3" />
                  Add Scenario
                </Button>
              </div>
              
              {scenarios.map((scenario, index) => {
                const proj = scenarioProjections.find(s => s.id === scenario.id);
                return (
                  <div key={scenario.id} className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        value={scenario.name}
                        onChange={(e) => updateScenario(scenario.id, 'name', e.target.value)}
                        className="font-medium border-0 p-0 h-auto text-base focus-visible:ring-0"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeScenario(scenario.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Target Maturity</Label>
                        <select
                          value={scenario.targetMaturity}
                          onChange={(e) => updateScenario(scenario.id, 'targetMaturity', parseInt(e.target.value))}
                          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                        >
                          {[1, 2, 3, 4, 5].filter(l => l >= currentMaturityLevel).map(level => (
                            <option key={level} value={level}>Level {level}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Investment</Label>
                        <Input
                          type="number"
                          value={scenario.investment}
                          onChange={(e) => updateScenario(scenario.id, 'investment', parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Timeframe</Label>
                        <select
                          value={scenario.timeframe}
                          onChange={(e) => updateScenario(scenario.id, 'timeframe', parseInt(e.target.value))}
                          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                        >
                          {[6, 12, 18, 24].map(months => (
                            <option key={months} value={months}>{months} months</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {proj && (
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Risk Reduction</p>
                          <p className="text-sm font-bold text-success">{formatCurrency(proj.projection.projectedRiskReduction)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">ROI</p>
                          <p className={`text-sm font-bold ${proj.roi >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {proj.roi >= 0 ? '+' : ''}{proj.roi.toFixed(0)}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Net Benefit</p>
                          <p className={`text-sm font-bold ${proj.netBenefit >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrency(proj.netBenefit)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Payback</p>
                          <p className="text-sm font-bold">
                            {proj.paybackMonths === Infinity ? 'N/A' : `${proj.paybackMonths.toFixed(1)}mo`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
