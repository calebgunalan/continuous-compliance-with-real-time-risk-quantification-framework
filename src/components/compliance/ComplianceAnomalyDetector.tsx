import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, AlertTriangle, CheckCircle2, Loader2, ShieldAlert, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Anomaly {
  id: string;
  controlName: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

interface ComplianceAnomalyDetectorProps {
  organizationId: string;
  controls: Array<{
    name: string;
    passRate: number;
    status: string;
    lastChecked: string;
    category: string;
  }>;
  className?: string;
}

export function ComplianceAnomalyDetector({ organizationId, controls, className }: ComplianceAnomalyDetectorProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const runAnomalyDetection = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('detect-anomalies', {
        body: {
          organizationId,
          controls: controls.map(c => ({
            name: c.name,
            passRate: c.passRate,
            status: c.status,
            lastChecked: c.lastChecked,
            category: c.category,
          })),
        },
      });

      if (error) throw error;

      setAnomalies(data?.anomalies || []);
      setLastScan(new Date().toISOString());
      
      if ((data?.anomalies || []).length === 0) {
        toast.success("No anomalies detected");
      } else {
        toast.warning(`${data.anomalies.length} anomalies detected`);
      }
    } catch (err) {
      console.error("Anomaly detection failed:", err);
      // Fallback: run rule-based detection locally
      const localAnomalies = runLocalDetection(controls);
      setAnomalies(localAnomalies);
      setLastScan(new Date().toISOString());
      if (localAnomalies.length > 0) {
        toast.warning(`${localAnomalies.length} anomalies detected (local analysis)`);
      } else {
        toast.success("No anomalies detected");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/15 text-destructive border-destructive/30';
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/15 text-warning border-warning/30';
      case 'low': return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getSeverityIcon = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high': return <ShieldAlert className="h-4 w-4 text-destructive" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <Eye className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className={cn("animate-slide-up", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">AI Anomaly Detection</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={runAnomalyDetection}
            disabled={isScanning || controls.length === 0}
            className="h-8 text-xs gap-1.5"
          >
            {isScanning ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Scanning...</>
            ) : (
              <><Scan className="h-3.5 w-3.5" /> Run Scan</>
            )}
          </Button>
        </div>
        {lastScan && (
          <p className="text-[11px] text-muted-foreground">
            Last scan: {new Date(lastScan).toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {anomalies.length === 0 && lastScan && (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <p className="text-sm text-success">No anomalies detected. Compliance patterns appear normal.</p>
          </div>
        )}

        {anomalies.length === 0 && !lastScan && (
          <div className="text-center py-6">
            <Scan className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Click "Run Scan" to analyze control test patterns for anomalies using AI.
            </p>
          </div>
        )}

        {anomalies.map((anomaly) => (
          <div key={anomaly.id} className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                {getSeverityIcon(anomaly.severity)}
                <div>
                  <p className="text-sm font-medium text-foreground">{anomaly.controlName}</p>
                  <p className="text-xs text-muted-foreground">{anomaly.type}</p>
                </div>
              </div>
              <Badge variant="outline" className={cn("text-[10px]", getSeverityColor(anomaly.severity))}>
                {anomaly.severity}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{anomaly.description}</p>
            <div className="rounded bg-muted/30 p-2">
              <p className="text-[11px] text-foreground"><span className="font-medium">Recommendation:</span> {anomaly.recommendation}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Local rule-based anomaly detection as fallback
 */
function runLocalDetection(controls: ComplianceAnomalyDetectorProps['controls']): Anomaly[] {
  const anomalies: Anomaly[] = [];
  let id = 0;

  controls.forEach(c => {
    // Suspicious 100% pass rate
    if (c.passRate === 100 && c.status === 'pass') {
      anomalies.push({
        id: `local-${id++}`,
        controlName: c.name,
        type: 'Suspiciously Perfect',
        severity: 'medium',
        description: `Control maintains 100% pass rate which may indicate insufficient test coverage or automated false-positive reporting.`,
        recommendation: 'Manually verify test assertions and increase test depth.',
      });
    }

    // Very low pass rate without remediation
    if (c.passRate < 30 && c.passRate > 0) {
      anomalies.push({
        id: `local-${id++}`,
        controlName: c.name,
        type: 'Persistent Failure',
        severity: 'high',
        description: `Control has a consistently low pass rate of ${c.passRate}%, indicating systemic misconfiguration or neglect.`,
        recommendation: 'Escalate to control owner for immediate remediation.',
      });
    }
  });

  // Check for coordinated failures
  const failingControls = controls.filter(c => c.status === 'fail');
  if (failingControls.length > controls.length * 0.4 && controls.length > 5) {
    anomalies.push({
      id: `local-${id++}`,
      controlName: 'Multiple Controls',
      type: 'Coordinated Failure',
      severity: 'critical',
      description: `${failingControls.length} out of ${controls.length} controls are failing simultaneously, suggesting a systemic infrastructure issue.`,
      recommendation: 'Investigate shared dependencies and infrastructure components.',
    });
  }

  return anomalies;
}
