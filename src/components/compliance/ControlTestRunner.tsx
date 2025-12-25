import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useOrganizationControls } from "@/hooks/useControls";
import { useRunControlTest, useRunBatchControlTests } from "@/hooks/useControlTestEngine";
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Clock,
  Zap
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ControlTestRunnerProps {
  className?: string;
}

export function ControlTestRunner({ className }: ControlTestRunnerProps) {
  const { organizationId } = useOrganizationContext();
  const { data: orgControls, isLoading } = useOrganizationControls(organizationId || '');
  const runSingleTest = useRunControlTest();
  const runBatchTests = useRunBatchControlTests();
  
  const [testingControlId, setTestingControlId] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState(0);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  const enabledControls = orgControls?.filter(c => c.is_enabled) || [];
  
  const handleRunSingleTest = async (control: typeof enabledControls[0]) => {
    if (!control.control) return;
    
    setTestingControlId(control.id);
    try {
      await runSingleTest.mutateAsync({
        organizationControlId: control.id,
        controlId: control.control_id,
        controlName: control.control.name,
        category: control.control.category,
      });
    } finally {
      setTestingControlId(null);
    }
  };

  const handleRunAllTests = async () => {
    if (enabledControls.length === 0) return;
    
    setIsBatchRunning(true);
    setBatchProgress(0);
    
    const controlInputs = enabledControls
      .filter(c => c.control)
      .map(c => ({
        organizationControlId: c.id,
        controlId: c.control_id,
        controlName: c.control!.name,
        category: c.control!.category,
      }));
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setBatchProgress(prev => Math.min(prev + 5, 95));
      }, 200);
      
      await runBatchTests.mutateAsync(controlInputs);
      
      clearInterval(progressInterval);
      setBatchProgress(100);
    } finally {
      setTimeout(() => {
        setIsBatchRunning(false);
        setBatchProgress(0);
      }, 1000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pass: 'risk-badge risk-badge-low',
      fail: 'risk-badge risk-badge-critical',
      warning: 'risk-badge risk-badge-medium',
      not_tested: 'risk-badge bg-muted/30 text-muted-foreground border-muted',
    };
    return badges[status] || badges.not_tested;
  };

  if (isLoading) {
    return (
      <div className={cn("metric-card", className)}>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("metric-card", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Control Test Execution Engine
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {enabledControls.length} controls ready for automated testing
          </p>
        </div>
        <Button
          onClick={handleRunAllTests}
          disabled={isBatchRunning || enabledControls.length === 0}
          className="gap-2"
        >
          {isBatchRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      {/* Batch Progress */}
      {isBatchRunning && (
        <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Batch Test Progress</span>
            <span className="text-sm text-muted-foreground">{batchProgress}%</span>
          </div>
          <Progress value={batchProgress} className="h-2" />
        </div>
      )}

      {/* Test Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {(['pass', 'warning', 'fail', 'not_tested'] as const).map(status => {
          const count = enabledControls.filter(c => c.current_status === status).length;
          const labels: Record<string, { label: string; color: string }> = {
            pass: { label: 'Passing', color: 'text-success' },
            warning: { label: 'Warnings', color: 'text-warning' },
            fail: { label: 'Failing', color: 'text-destructive' },
            not_tested: { label: 'Pending', color: 'text-muted-foreground' },
          };
          return (
            <div key={status} className="text-center p-3 rounded-lg bg-muted/30">
              <p className={cn("text-2xl font-bold", labels[status].color)}>{count}</p>
              <p className="text-xs text-muted-foreground">{labels[status].label}</p>
            </div>
          );
        })}
      </div>

      {/* Control Test List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {enabledControls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No controls enabled for testing.</p>
            <p className="text-sm">Enable controls on the Compliance Controls page.</p>
          </div>
        ) : (
          enabledControls.map((control) => (
            <div
              key={control.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getStatusIcon(control.current_status)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {control.control?.name || 'Unknown Control'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {control.control?.control_id} • {control.control?.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={getStatusBadge(control.current_status)}>
                  {control.current_status.replace('_', ' ')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRunSingleTest(control)}
                  disabled={testingControlId === control.id || isBatchRunning}
                  className="h-8 w-8 p-0"
                >
                  {testingControlId === control.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Last Test Summary */}
      {enabledControls.some(c => c.last_tested_at) && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Last test run:{" "}
            {new Date(
              Math.max(
                ...enabledControls
                  .filter(c => c.last_tested_at)
                  .map(c => new Date(c.last_tested_at!).getTime())
              )
            ).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
