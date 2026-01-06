import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Timer,
  Users
} from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useOrganizationControls } from "@/hooks/useControls";

interface AuditSimulation {
  phase: 'planning' | 'evidence' | 'testing' | 'reporting' | 'complete';
  daysElapsed: number;
  controlsReviewed: number;
  issuesFound: number;
  documentsCollected: number;
  staffHours: number;
}

export function TraditionalAuditSimulator() {
  const { organizationId } = useOrganizationContext();
  const { data: orgControls } = useOrganizationControls(organizationId || '');
  
  const [auditFrequency, setAuditFrequency] = useState<'annual' | 'semiannual' | 'quarterly'>('annual');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulation, setSimulation] = useState<AuditSimulation | null>(null);
  const [simulationProgress, setSimulationProgress] = useState(0);

  const totalControls = orgControls?.length || 0;

  const auditConfig = useMemo(() => {
    const base = {
      annual: { 
        prepDays: 45, 
        auditDays: 15, 
        reportDays: 10,
        staffMultiplier: 1,
        gapBetweenAudits: 365
      },
      semiannual: { 
        prepDays: 30, 
        auditDays: 10, 
        reportDays: 7,
        staffMultiplier: 0.8,
        gapBetweenAudits: 180
      },
      quarterly: { 
        prepDays: 20, 
        auditDays: 7, 
        reportDays: 5,
        staffMultiplier: 0.6,
        gapBetweenAudits: 90
      },
    };
    return base[auditFrequency];
  }, [auditFrequency]);

  const startSimulation = async () => {
    setIsSimulating(true);
    setSimulationProgress(0);
    
    const totalDays = auditConfig.prepDays + auditConfig.auditDays + auditConfig.reportDays;
    const phases: Array<{ phase: AuditSimulation['phase']; days: number }> = [
      { phase: 'planning', days: Math.floor(auditConfig.prepDays * 0.3) },
      { phase: 'evidence', days: Math.floor(auditConfig.prepDays * 0.7) },
      { phase: 'testing', days: auditConfig.auditDays },
      { phase: 'reporting', days: auditConfig.reportDays },
    ];

    let daysElapsed = 0;
    let controlsReviewed = 0;
    let issuesFound = 0;
    let documentsCollected = 0;

    for (const { phase, days } of phases) {
      for (let day = 0; day < days; day++) {
        daysElapsed++;
        
        if (phase === 'evidence') {
          documentsCollected += Math.floor(Math.random() * 5) + 3;
        }
        
        if (phase === 'testing') {
          const controlsPerDay = Math.ceil(totalControls / auditConfig.auditDays);
          controlsReviewed = Math.min(controlsReviewed + controlsPerDay, totalControls);
          
          // Simulate finding issues - higher probability for failing controls
          const failingControls = orgControls?.filter(c => c.current_status === 'fail').length || 0;
          if (Math.random() < 0.3 + (failingControls / totalControls) * 0.5) {
            issuesFound++;
          }
        }

        setSimulation({
          phase,
          daysElapsed,
          controlsReviewed,
          issuesFound,
          documentsCollected,
          staffHours: daysElapsed * 8 * auditConfig.staffMultiplier,
        });
        
        setSimulationProgress((daysElapsed / totalDays) * 100);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    setSimulation(prev => prev ? { ...prev, phase: 'complete' } : null);
    setSimulationProgress(100);
    setIsSimulating(false);
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'planning': return 'bg-primary text-primary-foreground';
      case 'evidence': return 'bg-warning text-warning-foreground';
      case 'testing': return 'bg-[hsl(var(--risk-high))] text-white';
      case 'reporting': return 'bg-muted text-muted-foreground';
      case 'complete': return 'bg-success text-success-foreground';
      default: return 'bg-muted';
    }
  };

  const traditionalMetrics = useMemo(() => {
    const totalDays = auditConfig.prepDays + auditConfig.auditDays + auditConfig.reportDays;
    return {
      totalAuditDays: totalDays,
      annualAuditDays: totalDays * (auditFrequency === 'annual' ? 1 : auditFrequency === 'semiannual' ? 2 : 4),
      detectionLagDays: auditConfig.gapBetweenAudits / 2, // Average time a failure exists undetected
      staffHoursPerAudit: totalDays * 8 * auditConfig.staffMultiplier,
      estimatedCost: totalDays * 8 * auditConfig.staffMultiplier * 75, // $75/hour
    };
  }, [auditConfig, auditFrequency]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Traditional Audit Simulator
          </CardTitle>
          <CardDescription>
            Simulate periodic compliance audits to compare against continuous monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audit Frequency Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Audit Frequency</label>
            <div className="flex gap-3">
              {(['annual', 'semiannual', 'quarterly'] as const).map((freq) => (
                <Button
                  key={freq}
                  variant={auditFrequency === freq ? 'default' : 'outline'}
                  onClick={() => setAuditFrequency(freq)}
                  disabled={isSimulating}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Traditional Metrics Overview */}
          <div className="grid gap-4 md:grid-cols-5">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Audit Duration</span>
              </div>
              <p className="text-xl font-bold">{traditionalMetrics.totalAuditDays} days</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Annual Audit Days</span>
              </div>
              <p className="text-xl font-bold">{traditionalMetrics.annualAuditDays} days</p>
            </div>
            <div className="p-4 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">Avg Detection Lag</span>
              </div>
              <p className="text-xl font-bold text-destructive">{traditionalMetrics.detectionLagDays} days</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">Staff Hours</span>
              </div>
              <p className="text-xl font-bold">{traditionalMetrics.staffHoursPerAudit.toFixed(0)} hrs</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Timer className="h-4 w-4" />
                <span className="text-xs">Est. Cost/Audit</span>
              </div>
              <p className="text-xl font-bold">${(traditionalMetrics.estimatedCost / 1000).toFixed(0)}K</p>
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="font-medium">Run Audit Simulation</p>
              <p className="text-sm text-muted-foreground">
                Simulate a complete {auditFrequency} audit cycle for {totalControls} controls
              </p>
            </div>
            <Button 
              onClick={startSimulation} 
              disabled={isSimulating || totalControls === 0}
              size="lg"
            >
              {isSimulating ? 'Simulating...' : 'Start Simulation'}
            </Button>
          </div>

          {/* Simulation Progress */}
          {(isSimulating || simulation) && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="font-medium">Audit Progress</span>
                {simulation && (
                  <Badge className={getPhaseColor(simulation.phase)}>
                    {simulation.phase.toUpperCase()}
                  </Badge>
                )}
              </div>
              <Progress value={simulationProgress} className="h-3" />
              
              {simulation && (
                <div className="grid gap-4 md:grid-cols-5 mt-4">
                  <div className="text-center p-3 bg-background rounded-lg">
                    <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-bold">{simulation.daysElapsed}</p>
                    <p className="text-xs text-muted-foreground">Days Elapsed</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <FileText className="h-5 w-5 mx-auto mb-1 text-warning" />
                    <p className="text-lg font-bold">{simulation.documentsCollected}</p>
                    <p className="text-xs text-muted-foreground">Docs Collected</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-success" />
                    <p className="text-lg font-bold">{simulation.controlsReviewed}/{totalControls}</p>
                    <p className="text-xs text-muted-foreground">Controls Tested</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <XCircle className="h-5 w-5 mx-auto mb-1 text-destructive" />
                    <p className="text-lg font-bold">{simulation.issuesFound}</p>
                    <p className="text-xs text-muted-foreground">Issues Found</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold">{simulation.staffHours.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Staff Hours</p>
                  </div>
                </div>
              )}

              {simulation?.phase === 'complete' && (
                <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 text-success mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Audit Simulation Complete</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Traditional audit completed in {simulation.daysElapsed} days, finding {simulation.issuesFound} issues.
                    During this period, control failures may have gone undetected for up to {traditionalMetrics.detectionLagDays} days.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Timeline Phases */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Phase Timeline</CardTitle>
          <CardDescription>Traditional audit workflow breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground z-10">
                  1
                </div>
                <div className="flex-1 pb-6">
                  <h4 className="font-medium">Planning & Scoping</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.floor(auditConfig.prepDays * 0.3)} days - Define audit scope, schedule resources, notify stakeholders
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-warning text-warning-foreground z-10">
                  2
                </div>
                <div className="flex-1 pb-6">
                  <h4 className="font-medium">Evidence Collection</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.floor(auditConfig.prepDays * 0.7)} days - Gather documentation, screenshots, logs, access lists
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--risk-high))] text-white z-10">
                  3
                </div>
                <div className="flex-1 pb-6">
                  <h4 className="font-medium">Control Testing</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {auditConfig.auditDays} days - Test each control, validate evidence, document findings
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground z-10">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Reporting & Remediation</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {auditConfig.reportDays} days - Generate audit report, prioritize findings, create remediation plan
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
