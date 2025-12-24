import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  ArrowRight,
  Sparkles,
  Calculator,
  PiggyBank
} from "lucide-react";
import { calculateProjectedRiskReduction } from "@/hooks/useRiskCalculations";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useLatestRiskCalculation } from "@/hooks/useRiskCalculations";

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

  return (
    <Card className="animate-slide-up border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">What-If Scenario Modeling</CardTitle>
            <CardDescription>Simulate maturity improvements and calculate projected ROI</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  );
}
