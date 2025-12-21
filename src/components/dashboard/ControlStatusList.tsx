import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, ChevronRight } from "lucide-react";

interface ControlItem {
  id: string;
  name: string;
  framework: string;
  status: "pass" | "fail" | "warning";
  lastChecked: string;
  passRate: number;
}

const controls: ControlItem[] = [
  {
    id: "AC-2",
    name: "Account Management",
    framework: "NIST CSF",
    status: "pass",
    lastChecked: "2 min ago",
    passRate: 98,
  },
  {
    id: "AC-6",
    name: "Least Privilege",
    framework: "NIST CSF",
    status: "pass",
    lastChecked: "5 min ago",
    passRate: 94,
  },
  {
    id: "IA-2",
    name: "Multi-Factor Authentication",
    framework: "NIST CSF",
    status: "warning",
    lastChecked: "8 min ago",
    passRate: 87,
  },
  {
    id: "SI-4",
    name: "System Monitoring",
    framework: "NIST CSF",
    status: "pass",
    lastChecked: "3 min ago",
    passRate: 96,
  },
  {
    id: "A.9.4",
    name: "Access Control Policies",
    framework: "ISO 27001",
    status: "fail",
    lastChecked: "12 min ago",
    passRate: 72,
  },
  {
    id: "CM-7",
    name: "Least Functionality",
    framework: "NIST CSF",
    status: "pass",
    lastChecked: "6 min ago",
    passRate: 91,
  },
];

export function ControlStatusList() {
  const getStatusIcon = (status: ControlItem["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: ControlItem["status"]) => {
    switch (status) {
      case "pass":
        return "risk-badge-low";
      case "fail":
        return "risk-badge-critical";
      case "warning":
        return "risk-badge-medium";
    }
  };

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

      <div className="space-y-2">
        {controls.map((control, index) => (
          <div
            key={control.id}
            className={cn(
              "group flex items-center gap-4 rounded-lg border border-border/50 bg-muted/30 p-3 transition-all hover:border-border hover:bg-muted/50 animate-slide-up cursor-pointer"
            )}
            style={{ animationDelay: `${400 + index * 50}ms` }}
          >
            {/* Status Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
              {getStatusIcon(control.status)}
            </div>

            {/* Control Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{control.id}</span>
                <span className="text-xs text-muted-foreground/50">•</span>
                <span className="text-xs text-muted-foreground">{control.framework}</span>
              </div>
              <p className="truncate text-sm font-medium text-foreground">{control.name}</p>
            </div>

            {/* Pass Rate */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-foreground">{control.passRate}%</span>
              <span className="text-[10px] text-muted-foreground">Pass Rate</span>
            </div>

            {/* Status Badge */}
            <div className={cn("risk-badge capitalize", getStatusBadge(control.status))}>
              {control.status}
            </div>

            {/* Last Checked */}
            <div className="hidden md:block text-right">
              <span className="text-xs text-muted-foreground">{control.lastChecked}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
