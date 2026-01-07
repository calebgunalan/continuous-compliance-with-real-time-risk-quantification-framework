import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useOrganizationControls } from "@/hooks/useControls";
import { useThreatScenarios } from "@/hooks/useThreatScenarios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from "recharts";
import { DollarSign, TrendingUp, Target, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Investment {
  id: string;
  controlName: string;
  category: string;
  estimatedCost: number;
  riskReduction: number;
  implementationMonths: number;
  roi: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export function InvestmentPrioritizer() {
  const { organizationId } = useOrganizationContext();
  const { data: controls } = useOrganizationControls(organizationId || '');
  const { data: scenarios } = useThreatScenarios(organizationId || '');
  const [budget, setBudget] = useState([500000]);
  const [timeframe, setTimeframe] = useState([12]);

  // Generate investment opportunities based on controls
  const investments: Investment[] = useMemo(() => {
    if (!controls?.length) return [];

    const failingControls = controls.filter(c => c.current_status === 'fail' || c.current_status === 'warning');
    
    return failingControls.slice(0, 12).map((control, index) => {
      const severity = control.control?.severity || 'medium';
      const baseCost = severity === 'critical' ? 150000 : severity === 'high' ? 80000 : severity === 'medium' ? 40000 : 20000;
      const cost = baseCost * (0.8 + Math.random() * 0.4);
      const baseReduction = severity === 'critical' ? 25000000 : severity === 'high' ? 12000000 : severity === 'medium' ? 5000000 : 1500000;
      const reduction = baseReduction * (0.7 + Math.random() * 0.6);
      const months = severity === 'critical' ? 2 : severity === 'high' ? 4 : 6;

      return {
        id: control.id,
        controlName: control.control?.name || `Control ${index + 1}`,
        category: control.control?.category || 'General',
        estimatedCost: Math.round(cost),
        riskReduction: Math.round(reduction),
        implementationMonths: months + Math.floor(Math.random() * 3),
        roi: Math.round((reduction / cost) * 100) / 100,
        priority: severity as 'critical' | 'high' | 'medium' | 'low',
      };
    }).sort((a, b) => b.roi - a.roi);
  }, [controls]);

  // Calculate optimal portfolio within budget
  const optimizedPortfolio = useMemo(() => {
    const maxBudget = budget[0];
    const maxMonths = timeframe[0];
    
    let remainingBudget = maxBudget;
    const selected: Investment[] = [];
    
    // Greedy algorithm: select by ROI while respecting constraints
    for (const inv of investments) {
      if (inv.estimatedCost <= remainingBudget && inv.implementationMonths <= maxMonths) {
        selected.push(inv);
        remainingBudget -= inv.estimatedCost;
      }
    }

    return selected;
  }, [investments, budget, timeframe]);

  // Calculate cumulative risk reduction curve
  const cumulativeData = useMemo(() => {
    let cumCost = 0;
    let cumReduction = 0;
    
    return optimizedPortfolio.map((inv, index) => {
      cumCost += inv.estimatedCost;
      cumReduction += inv.riskReduction;
      return {
        investment: index + 1,
        name: inv.controlName.substring(0, 20),
        cost: cumCost,
        riskReduction: cumReduction,
        roi: Math.round((cumReduction / cumCost) * 100) / 100,
      };
    });
  }, [optimizedPortfolio]);

  // Summary metrics
  const metrics = useMemo(() => {
    const totalCost = optimizedPortfolio.reduce((sum, inv) => sum + inv.estimatedCost, 0);
    const totalReduction = optimizedPortfolio.reduce((sum, inv) => sum + inv.riskReduction, 0);
    const avgROI = totalCost > 0 ? totalReduction / totalCost : 0;
    
    return {
      totalCost,
      totalReduction,
      avgROI,
      investmentCount: optimizedPortfolio.length,
      remainingBudget: budget[0] - totalCost,
    };
  }, [optimizedPortfolio, budget]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Budget Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Parameters</CardTitle>
          <CardDescription>Set your budget and implementation timeframe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Annual Budget</span>
                <span className="text-sm font-bold">{formatCurrency(budget[0])}</span>
              </div>
              <Slider
                value={budget}
                onValueChange={setBudget}
                max={2000000}
                min={100000}
                step={50000}
                className="w-full"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Implementation Timeframe</span>
                <span className="text-sm font-bold">{timeframe[0]} months</span>
              </div>
              <Slider
                value={timeframe}
                onValueChange={setTimeframe}
                max={24}
                min={3}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Investments Selected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.investmentCount}</div>
            <p className="text-xs text-muted-foreground">Within constraints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Investment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalCost)}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(metrics.remainingBudget)} remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Risk Reduction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalReduction)}</div>
            <p className="text-xs text-muted-foreground">Annual exposure reduction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Portfolio ROI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.avgROI.toFixed(1)}x</div>
            <p className="text-xs text-muted-foreground">Return on investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Investment ROI Ranking</CardTitle>
            <CardDescription>Risk reduction per dollar invested</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={investments.slice(0, 8)} 
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tickFormatter={(v) => `${v}x`} />
                <YAxis 
                  type="category" 
                  dataKey="controlName" 
                  width={120}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => v.length > 15 ? v.substring(0, 15) + '...' : v}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}x`, 'ROI']}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="roi" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cumulative Risk Reduction</CardTitle>
            <CardDescription>Progressive impact as investments are implemented</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="investment" label={{ value: 'Investment #', position: 'bottom', offset: -5 }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'riskReduction' ? 'Risk Reduction' : 'Cost'
                  ]}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="riskReduction" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary)/0.2)"
                  name="Risk Reduction"
                />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="hsl(var(--muted-foreground))" 
                  fill="hsl(var(--muted-foreground)/0.1)"
                  name="Cumulative Cost"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Prioritized Investment List */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Investment Portfolio</CardTitle>
          <CardDescription>Optimized for maximum risk reduction within your constraints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimizedPortfolio.map((investment, index) => (
              <div 
                key={investment.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{investment.controlName}</p>
                      <Badge variant={getPriorityColor(investment.priority)}>
                        {investment.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{investment.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 text-right">
                  <div>
                    <p className="text-sm text-muted-foreground">Cost</p>
                    <p className="font-semibold">{formatCurrency(investment.estimatedCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Reduction</p>
                    <p className="font-semibold text-green-600">{formatCurrency(investment.riskReduction)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ROI</p>
                    <p className="font-semibold text-primary">{investment.roi.toFixed(1)}x</p>
                  </div>
                </div>
              </div>
            ))}
            {optimizedPortfolio.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No investments available within current constraints
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Case Summary */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
          <CardDescription>Investment recommendation for board presentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p>
              Based on the current risk assessment and available budget of <strong>{formatCurrency(budget[0])}</strong>, 
              we recommend implementing <strong>{metrics.investmentCount} security control improvements</strong> over 
              the next <strong>{timeframe[0]} months</strong>.
            </p>
            <p className="mt-4">
              This portfolio will require an investment of <strong>{formatCurrency(metrics.totalCost)}</strong> and 
              is projected to reduce annual risk exposure by <strong>{formatCurrency(metrics.totalReduction)}</strong>, 
              delivering a return of <strong>{metrics.avgROI.toFixed(1)}x</strong> on the security investment.
            </p>
            <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-green-700 font-medium m-0">
                Net Benefit: {formatCurrency(metrics.totalReduction - metrics.totalCost)} annual risk reduction
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
