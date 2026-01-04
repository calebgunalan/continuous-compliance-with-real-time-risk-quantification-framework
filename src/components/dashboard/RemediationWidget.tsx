import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, AlertCircle, AlertTriangle, Info, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface RemediationStats {
  total: number;
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    open: number;
    in_progress: number;
    resolved: number;
  };
}

export function RemediationWidget() {
  const { organizationId } = useOrganizationContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['remediation-stats', organizationId],
    queryFn: async (): Promise<RemediationStats> => {
      const { data, error } = await supabase
        .from('control_remediations')
        .select('priority, status')
        .eq('organization_id', organizationId);
      
      if (error) throw error;

      const openTasks = data?.filter(r => r.status !== 'resolved') || [];
      
      return {
        total: openTasks.length,
        byPriority: {
          critical: openTasks.filter(r => r.priority === 'critical').length,
          high: openTasks.filter(r => r.priority === 'high').length,
          medium: openTasks.filter(r => r.priority === 'medium').length,
          low: openTasks.filter(r => r.priority === 'low').length,
        },
        byStatus: {
          open: data?.filter(r => r.status === 'open').length || 0,
          in_progress: data?.filter(r => r.status === 'in_progress').length || 0,
          resolved: data?.filter(r => r.status === 'resolved').length || 0,
        }
      };
    },
    enabled: !!organizationId,
  });

  const priorityConfig = [
    { key: 'critical', label: 'Critical', icon: AlertCircle, className: 'text-destructive bg-destructive/10' },
    { key: 'high', label: 'High', icon: AlertTriangle, className: 'text-warning bg-warning/10' },
    { key: 'medium', label: 'Medium', icon: Info, className: 'text-primary bg-primary/10' },
    { key: 'low', label: 'Low', icon: Info, className: 'text-muted-foreground bg-muted' },
  ] as const;

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 bg-muted rounded w-40" />
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up" style={{ animationDelay: "250ms" }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15">
              <Wrench className="h-4 w-4 text-warning" />
            </div>
            <CardTitle className="text-base font-semibold">Open Remediations</CardTitle>
          </div>
          <Badge variant={stats?.total && stats.total > 0 ? "destructive" : "secondary"}>
            {stats?.total || 0} open
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Priority breakdown */}
          <div className="grid grid-cols-2 gap-2">
            {priorityConfig.map(({ key, label, icon: Icon, className }) => (
              <div 
                key={key}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
              >
                <div className={`p-1 rounded ${className}`}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold">
                    {stats?.byPriority[key] || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Status summary */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <span>{stats?.byStatus.open || 0} pending</span>
            <span>{stats?.byStatus.in_progress || 0} in progress</span>
            <span>{stats?.byStatus.resolved || 0} resolved</span>
          </div>

          {/* Action button */}
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/remediation" className="flex items-center gap-2">
              View Remediation Tasks
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}