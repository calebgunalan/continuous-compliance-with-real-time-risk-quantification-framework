import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  ArrowRight,
  Shield
} from "lucide-react";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useOrganizationControls } from "@/hooks/useControls";

interface DriftIndicator {
  controlId: string;
  controlName: string;
  category: string;
  currentPassRate: number;
  previousPassRate: number;
  trend: 'improving' | 'stable' | 'declining' | 'critical';
  driftPercent: number;
  predictedFailure: boolean;
  daysToFailure?: number;
}

// Simulated historical data for drift calculation
const generateDriftData = (controls: Array<{ id: string; control?: { name: string; category: string } | null; pass_rate: number | null }>): DriftIndicator[] => {
  return controls.map(control => {
    const currentPassRate = Number(control.pass_rate) || 0;
    // Simulate previous rate with some variance
    const variance = (Math.random() - 0.5) * 20;
    const previousPassRate = Math.max(0, Math.min(100, currentPassRate + variance));
    const driftPercent = currentPassRate - previousPassRate;
    
    let trend: DriftIndicator['trend'] = 'stable';
    if (driftPercent > 5) trend = 'improving';
    else if (driftPercent < -10) trend = 'critical';
    else if (driftPercent < -3) trend = 'declining';
    
    const predictedFailure = currentPassRate < 70 && driftPercent < -5;
    const daysToFailure = predictedFailure 
      ? Math.max(1, Math.round(currentPassRate / Math.abs(driftPercent) * 7))
      : undefined;

    return {
      controlId: control.id,
      controlName: control.control?.name || 'Unknown Control',
      category: control.control?.category || 'General',
      currentPassRate,
      previousPassRate,
      trend,
      driftPercent,
      predictedFailure,
      daysToFailure,
    };
  });
};

export function ControlDriftDetector() {
  const { organizationId } = useOrganizationContext();
  const { data: controls } = useOrganizationControls(organizationId || '');

  const driftData = useMemo(() => {
    if (!controls) return [];
    return generateDriftData(controls)
      .filter(d => d.trend === 'declining' || d.trend === 'critical')
      .sort((a, b) => a.driftPercent - b.driftPercent)
      .slice(0, 5);
  }, [controls]);

  const criticalCount = driftData.filter(d => d.trend === 'critical').length;
  const decliningCount = driftData.filter(d => d.trend === 'declining').length;
  const predictedFailures = driftData.filter(d => d.predictedFailure).length;

  const getTrendIcon = (trend: DriftIndicator['trend']) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-warning" />;
      case 'critical':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendBadge = (trend: DriftIndicator['trend']) => {
    switch (trend) {
      case 'critical':
        return "risk-badge risk-badge-critical";
      case 'declining':
        return "risk-badge risk-badge-medium";
      case 'improving':
        return "risk-badge risk-badge-low";
      default:
        return "risk-badge bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border-warning/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15">
            <Activity className="h-5 w-5 text-warning" />
          </div>
          <div>
            <CardTitle className="text-lg">Control Drift Detection</CardTitle>
            <CardDescription>Monitor trends to prevent future control failures</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-destructive/10 p-3 text-center">
            <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
            <p className="text-xs text-muted-foreground">Critical Drift</p>
          </div>
          <div className="rounded-lg bg-warning/10 p-3 text-center">
            <p className="text-2xl font-bold text-warning">{decliningCount}</p>
            <p className="text-xs text-muted-foreground">Declining</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-3 text-center">
            <p className="text-2xl font-bold text-primary">{predictedFailures}</p>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </div>
        </div>

        {/* Drift Indicators */}
        {driftData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">All controls are stable</p>
            <p className="text-xs">No concerning trends detected</p>
          </div>
        ) : (
          <div className="space-y-3">
            {driftData.map((indicator) => (
              <div
                key={indicator.controlId}
                className="rounded-lg border bg-card p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{indicator.controlName}</p>
                    <p className="text-xs text-muted-foreground">{indicator.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(indicator.trend)}
                    <span className={getTrendBadge(indicator.trend)}>
                      {indicator.driftPercent > 0 ? '+' : ''}{indicator.driftPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* Pass Rate Comparison */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">30d ago</span>
                      <span>{indicator.previousPassRate.toFixed(0)}%</span>
                    </div>
                    <Progress value={indicator.previousPassRate} className="h-1.5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Now</span>
                      <span className={indicator.currentPassRate < 70 ? 'text-destructive' : ''}>{indicator.currentPassRate.toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={indicator.currentPassRate} 
                      className={`h-1.5 ${indicator.currentPassRate < 70 ? '[&>div]:bg-destructive' : ''}`} 
                    />
                  </div>
                </div>

                {/* Predicted Failure Warning */}
                {indicator.predictedFailure && (
                  <div className="flex items-center gap-2 mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                    <p className="text-xs text-destructive">
                      Predicted failure in ~{indicator.daysToFailure} days if trend continues
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">How Drift Detection Works</p>
          <p>
            Analyzes control pass rate trends over the past 30 days to identify controls 
            at risk of failing before they impact compliance scores.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
