import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, ChevronRight, HelpCircle } from "lucide-react";
import { useOrganizationControls } from "@/hooks/useControls";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import type { ControlStatus } from "@/types/database";

export function ControlStatusList() {
  const { organizationId } = useOrganizationContext();
  const { data: organizationControls, isLoading } = useOrganizationControls(organizationId || '');

  const getStatusIcon = (status: ControlStatus) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "not_tested":
        return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ControlStatus) => {
    switch (status) {
      case "pass":
        return "risk-badge-low";
      case "fail":
        return "risk-badge-critical";
      case "warning":
        return "risk-badge-medium";
      case "not_tested":
        return "bg-muted text-muted-foreground";
    }
  };

  const formatFramework = (framework: string) => {
    const map: Record<string, string> = {
      nist_csf: "NIST CSF",
      iso_27001: "ISO 27001",
      soc2: "SOC 2",
      cis: "CIS",
      cobit: "COBIT",
      hipaa: "HIPAA",
      pci_dss: "PCI DSS",
    };
    return map[framework] || framework;
  };

  if (isLoading) {
    return (
      <div className="metric-card animate-slide-up" style={{ animationDelay: "300ms" }}>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const controls = organizationControls?.slice(0, 6) || [];

  return (
    <div className="metric-card animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Control Status</h3>
          <p className="text-sm text-muted-foreground">Real-time control testing results</p>
        </div>
        <button className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {controls.length > 0 ? (
        <div className="space-y-2">
          {controls.map((orgControl, index) => {
            const control = orgControl.control;
            const lastChecked = orgControl.last_tested_at 
              ? formatDistanceToNow(new Date(orgControl.last_tested_at), { addSuffix: true })
              : "Not tested";

            return (
              <div
                key={orgControl.id}
                className={cn(
                  "group flex items-center gap-4 rounded-lg border border-border/50 bg-muted/30 p-3 transition-all hover:border-border hover:bg-muted/50 animate-slide-up cursor-pointer"
                )}
                style={{ animationDelay: `${400 + index * 50}ms` }}
              >
                {/* Status Icon */}
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
                  {getStatusIcon(orgControl.current_status)}
                </div>

                {/* Control Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{control?.control_id}</span>
                    <span className="text-xs text-muted-foreground/50">•</span>
                    <span className="text-xs text-muted-foreground">{formatFramework(control?.framework || '')}</span>
                  </div>
                  <p className="truncate text-sm font-medium text-foreground">{control?.name}</p>
                </div>

                {/* Pass Rate */}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-foreground">{orgControl.pass_rate || 0}%</span>
                  <span className="text-[10px] text-muted-foreground">Pass Rate</span>
                </div>

                {/* Status Badge */}
                <div className={cn("risk-badge capitalize", getStatusBadge(orgControl.current_status))}>
                  {orgControl.current_status.replace('_', ' ')}
                </div>

                {/* Last Checked */}
                <div className="hidden md:block text-right">
                  <span className="text-xs text-muted-foreground">{lastChecked}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          No controls enabled for this organization
        </div>
      )}
    </div>
  );
}
