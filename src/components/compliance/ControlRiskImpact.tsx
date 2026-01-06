import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  Target,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Zap
} from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrganizationControls } from "@/hooks/useControls";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useThreatScenarios } from "@/hooks/useThreatScenarios";
import { cn } from "@/lib/utils";

interface ControlImpact {
  controlId: string;
  controlName: string;
  category: string;
  status: string;
  threatsmitigated: number;
  vulnerabilityReduction: number;
  riskReduction: number;
  impactScore: number;
  linkedScenarios: Array<{
    id: string;
    name: string;
    riskLevel: string;
    currentExposure: number;
    reducedExposure: number;
  }>;
}

export function ControlRiskImpact() {
  const { organizationId } = useOrganizationContext();
  const { data: currentOrganization } = useOrganization(organizationId || undefined);
  const { data: orgControls } = useOrganizationControls(organizationId || '');
  const { data: threatScenarios } = useThreatScenarios(organizationId || '');
  const [expandedControl, setExpandedControl] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'impact' | 'risk' | 'threats'>('impact');

  const controlImpacts = useMemo(() => {
    if (!orgControls || !threatScenarios) return [];

    const impacts: ControlImpact[] = orgControls.map(orgControl => {
      const control = orgControl.control;
      
      // Find threat scenarios this control mitigates
      const linkedScenarios = threatScenarios
        .filter(scenario => 
          scenario.mitigating_control_ids?.includes(control.id)
        )
        .map(scenario => {
          const baseExposure = scenario.annual_loss_exposure || 0;
          // Calculate reduced exposure based on control status
          const effectivenessMultiplier = orgControl.current_status === 'pass' ? 0.7 : 
                                          orgControl.current_status === 'warning' ? 0.85 : 1.0;
          return {
            id: scenario.id,
            name: scenario.name,
            riskLevel: scenario.risk_level,
            currentExposure: baseExposure,
            reducedExposure: baseExposure * effectivenessMultiplier,
          };
        });

      // Calculate aggregate metrics
      const totalCurrentExposure = linkedScenarios.reduce((sum, s) => sum + s.currentExposure, 0);
      const totalReducedExposure = linkedScenarios.reduce((sum, s) => sum + s.reducedExposure, 0);
      const riskReduction = totalCurrentExposure - totalReducedExposure;
      
      // Vulnerability reduction based on control effectiveness and pass rate
      const baseVulnReduction = orgControl.current_status === 'pass' ? 30 : 
                                orgControl.current_status === 'warning' ? 15 : 0;
      const vulnerabilityReduction = Math.min(baseVulnReduction + (orgControl.pass_rate || 0) * 0.2, 50);

      // Impact score combines multiple factors
      const impactScore = (linkedScenarios.length * 20) + 
                         (riskReduction / 100000) + 
                         (vulnerabilityReduction * 0.5);

      return {
        controlId: control.id,
        controlName: control.name,
        category: control.category,
        status: orgControl.current_status,
        threatsmitigated: linkedScenarios.length,
        vulnerabilityReduction,
        riskReduction,
        impactScore,
        linkedScenarios,
      };
    });

    // Sort by selected criteria
    return impacts.sort((a, b) => {
      switch (sortBy) {
        case 'impact': return b.impactScore - a.impactScore;
        case 'risk': return b.riskReduction - a.riskReduction;
        case 'threats': return b.threatsmitigated - a.threatsmitigated;
        default: return 0;
      }
    });
  }, [orgControls, threatScenarios, sortBy]);

  const totalRiskReduction = useMemo(() => 
    controlImpacts.reduce((sum, c) => sum + c.riskReduction, 0), 
    [controlImpacts]
  );

  const avgVulnerabilityReduction = useMemo(() => {
    if (controlImpacts.length === 0) return 0;
    return controlImpacts.reduce((sum, c) => sum + c.vulnerabilityReduction, 0) / controlImpacts.length;
  }, [controlImpacts]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-success bg-success/15';
      case 'warning': return 'text-warning bg-warning/15';
      case 'fail': return 'text-destructive bg-destructive/15';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-[hsl(var(--risk-high))] text-white';
      case 'medium': return 'bg-warning text-warning-foreground';
      default: return 'bg-success text-success-foreground';
    }
  };

  if (!organizationId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Please select an organization to view control risk impact analysis.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
                <TrendingDown className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Risk Reduction</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalRiskReduction)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Vuln. Reduction</p>
                <p className="text-2xl font-bold text-primary">{avgVulnerabilityReduction.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15">
                <Target className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Controls</p>
                <p className="text-2xl font-bold">{controlImpacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Impact</p>
                <p className="text-2xl font-bold">{controlImpacts.filter(c => c.impactScore > 50).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Control-to-Risk Impact Analysis</CardTitle>
              <CardDescription>
                Mapping controls to threat scenarios and calculating vulnerability reduction
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={sortBy === 'impact' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSortBy('impact')}
              >
                <Zap className="h-4 w-4 mr-1" />
                Impact
              </Button>
              <Button 
                variant={sortBy === 'risk' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSortBy('risk')}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Risk
              </Button>
              <Button 
                variant={sortBy === 'threats' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSortBy('threats')}
              >
                <Target className="h-4 w-4 mr-1" />
                Threats
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {controlImpacts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No controls enabled. Enable controls in the Compliance Controls page.
            </p>
          ) : (
            controlImpacts.map((impact) => (
              <div 
                key={impact.controlId}
                className="border rounded-lg overflow-hidden transition-all"
              >
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30"
                  onClick={() => setExpandedControl(
                    expandedControl === impact.controlId ? null : impact.controlId
                  )}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Badge className={cn("h-8 w-8 rounded-full flex items-center justify-center p-0", getStatusColor(impact.status))}>
                      <Shield className="h-4 w-4" />
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{impact.controlName}</span>
                        <Badge variant="outline" className="text-xs">{impact.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{impact.threatsmitigated} threats mitigated</span>
                        <span>•</span>
                        <span className="text-success">{formatCurrency(impact.riskReduction)} reduction</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Vuln. Reduction</span>
                              <span>{impact.vulnerabilityReduction.toFixed(0)}%</span>
                            </div>
                            <Progress value={impact.vulnerabilityReduction} className="h-2" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Vulnerability reduction achieved by this control</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Impact Score</div>
                      <div className={cn(
                        "font-bold",
                        impact.impactScore > 50 ? "text-success" : 
                        impact.impactScore > 25 ? "text-warning" : "text-muted-foreground"
                      )}>
                        {impact.impactScore.toFixed(1)}
                      </div>
                    </div>
                    {expandedControl === impact.controlId ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {expandedControl === impact.controlId && (
                  <div className="border-t bg-muted/20 p-4">
                    <h4 className="text-sm font-medium mb-3">Linked Threat Scenarios</h4>
                    {impact.linkedScenarios.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No threat scenarios linked to this control. Link scenarios in Threat Scenarios page.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {impact.linkedScenarios.map(scenario => (
                          <div 
                            key={scenario.id}
                            className="flex items-center justify-between p-3 bg-background rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Badge className={getRiskLevelColor(scenario.riskLevel)}>
                                {scenario.riskLevel}
                              </Badge>
                              <span className="font-medium">{scenario.name}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground line-through mr-2">
                                {formatCurrency(scenario.currentExposure)}
                              </span>
                              <span className="text-success font-medium">
                                {formatCurrency(scenario.reducedExposure)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
