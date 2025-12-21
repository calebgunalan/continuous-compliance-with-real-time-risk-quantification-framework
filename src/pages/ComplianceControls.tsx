import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, Filter, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Control {
  id: string;
  name: string;
  description: string;
  framework: string;
  category: string;
  status: "pass" | "fail" | "warning";
  passRate: number;
  lastChecked: string;
  testFrequency: string;
}

const controls: Control[] = [
  {
    id: "AC-2",
    name: "Account Management",
    description: "Manage system accounts, group memberships, privileges, workflow, notifications, deactivations, and authorizations",
    framework: "NIST CSF",
    category: "Access Control",
    status: "pass",
    passRate: 98,
    lastChecked: "2 min ago",
    testFrequency: "Every 5 min",
  },
  {
    id: "AC-6",
    name: "Least Privilege",
    description: "Employ the principle of least privilege, allowing only authorized accesses for users necessary to accomplish assigned tasks",
    framework: "NIST CSF",
    category: "Access Control",
    status: "pass",
    passRate: 94,
    lastChecked: "5 min ago",
    testFrequency: "Every 15 min",
  },
  {
    id: "IA-2",
    name: "Multi-Factor Authentication",
    description: "Implement multi-factor authentication for access to privileged and non-privileged accounts",
    framework: "NIST CSF",
    category: "Identification & Auth",
    status: "warning",
    passRate: 87,
    lastChecked: "8 min ago",
    testFrequency: "Every 5 min",
  },
  {
    id: "SI-4",
    name: "System Monitoring",
    description: "Monitor the system to detect attacks and indicators of potential attacks and unauthorized connections",
    framework: "NIST CSF",
    category: "System Integrity",
    status: "pass",
    passRate: 96,
    lastChecked: "3 min ago",
    testFrequency: "Continuous",
  },
  {
    id: "A.9.4.1",
    name: "Information Access Restriction",
    description: "Access to information and application system functions shall be restricted in accordance with the access control policy",
    framework: "ISO 27001",
    category: "Access Control",
    status: "fail",
    passRate: 72,
    lastChecked: "12 min ago",
    testFrequency: "Every 30 min",
  },
  {
    id: "CM-7",
    name: "Least Functionality",
    description: "Configure the system to provide only essential capabilities and prohibit or restrict the use of specified functions",
    framework: "NIST CSF",
    category: "Configuration Mgmt",
    status: "pass",
    passRate: 91,
    lastChecked: "6 min ago",
    testFrequency: "Every 1 hour",
  },
  {
    id: "AU-6",
    name: "Audit Log Review",
    description: "Review and analyze system audit logs for indications of inappropriate or unusual activity",
    framework: "NIST CSF",
    category: "Audit & Accountability",
    status: "pass",
    passRate: 95,
    lastChecked: "1 min ago",
    testFrequency: "Continuous",
  },
  {
    id: "SC-8",
    name: "Transmission Confidentiality",
    description: "Protect the confidentiality and integrity of transmitted information",
    framework: "NIST CSF",
    category: "System Communications",
    status: "pass",
    passRate: 99,
    lastChecked: "4 min ago",
    testFrequency: "Every 5 min",
  },
  {
    id: "CC6.1",
    name: "Logical Access Security",
    description: "Logical access security software, infrastructure, and architectures have been implemented",
    framework: "SOC 2",
    category: "Common Criteria",
    status: "warning",
    passRate: 84,
    lastChecked: "15 min ago",
    testFrequency: "Every 30 min",
  },
  {
    id: "4.1",
    name: "Secure Configuration",
    description: "Establish and maintain secure configurations for enterprise assets and software",
    framework: "CIS Benchmarks",
    category: "Inventory & Control",
    status: "pass",
    passRate: 89,
    lastChecked: "7 min ago",
    testFrequency: "Every 1 hour",
  },
];

export default function ComplianceControlsPage() {
  const [filterStatus, setFilterStatus] = useState<"all" | "pass" | "fail" | "warning">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredControls = controls.filter((control) => {
    const matchesStatus = filterStatus === "all" || control.status === filterStatus;
    const matchesSearch =
      control.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.framework.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: controls.length,
    passing: controls.filter((c) => c.status === "pass").length,
    failing: controls.filter((c) => c.status === "fail").length,
    warning: controls.filter((c) => c.status === "warning").length,
  };

  const getStatusIcon = (status: Control["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusBadge = (status: Control["status"]) => {
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
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Compliance Controls
        </h1>
        <p className="mt-1 text-muted-foreground">
          Real-time control testing across all compliance frameworks
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="metric-card py-4 animate-slide-up">
          <p className="text-sm text-muted-foreground">Total Controls</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="metric-card py-4 animate-slide-up" style={{ animationDelay: "50ms" }}>
          <p className="text-sm text-muted-foreground">Passing</p>
          <p className="text-2xl font-bold text-success">{stats.passing}</p>
        </div>
        <div className="metric-card py-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <p className="text-sm text-muted-foreground">Warning</p>
          <p className="text-2xl font-bold text-warning">{stats.warning}</p>
        </div>
        <div className="metric-card py-4 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <p className="text-sm text-muted-foreground">Failing</p>
          <p className="text-2xl font-bold text-destructive">{stats.failing}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search controls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 rounded-lg border border-border bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
            />
          </div>
          <div className="flex rounded-lg border border-border bg-muted/50 p-1">
            {(["all", "pass", "warning", "fail"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                  filterStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Controls Table */}
      <div className="metric-card overflow-hidden p-0 animate-slide-up" style={{ animationDelay: "250ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Control
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Framework
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Pass Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                  Last Checked
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredControls.map((control, index) => (
                <tr
                  key={control.id}
                  className="group hover:bg-muted/30 transition-colors cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${300 + index * 30}ms` }}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(control.status)}
                      <span className={cn("risk-badge capitalize hidden sm:inline-flex", getStatusBadge(control.status))}>
                        {control.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{control.id}</span>
                      </div>
                      <p className="font-medium text-foreground">{control.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-md hidden lg:block">
                        {control.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {control.framework}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {control.category}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="hidden sm:block w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            control.passRate >= 90
                              ? "bg-success"
                              : control.passRate >= 80
                              ? "bg-warning"
                              : "bg-destructive"
                          )}
                          style={{ width: `${control.passRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{control.passRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-muted-foreground hidden sm:table-cell">
                    {control.lastChecked}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
