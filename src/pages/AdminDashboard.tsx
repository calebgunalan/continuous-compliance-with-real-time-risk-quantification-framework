import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  BarChart3,
  Loader2,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { useAllOrganizations, useAggregatedStats, useUserRole } from "@/hooks/useAdminDashboard";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRoleManager } from "@/components/admin/UserRoleManager";
import { DataExporter } from "@/components/admin/DataExporter";
import { OrganizationBenchmark } from "@/components/dashboard/OrganizationBenchmark";
import { SampleNotificationsGenerator } from "@/components/admin/SampleNotificationsGenerator";
import { StudyParticipantsManager } from "@/components/admin/StudyParticipantsManager";

const COLORS = [
  'hsl(var(--destructive))',
  'hsl(var(--risk-high))',
  'hsl(var(--warning))',
  'hsl(var(--success))',
  'hsl(var(--primary))',
];

const MATURITY_LABELS: Record<string, string> = {
  level_1: 'Level 1',
  level_2: 'Level 2',
  level_3: 'Level 3',
  level_4: 'Level 4',
  level_5: 'Level 5',
};

export default function AdminDashboardPage() {
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const { data: organizations, isLoading: orgsLoading } = useAllOrganizations();
  const { data: stats, isLoading: statsLoading } = useAggregatedStats();
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  const isLoading = roleLoading || orgsLoading || statsLoading;

  // Check if user has admin or researcher role
  if (!roleLoading && userRole !== 'admin' && userRole !== 'researcher') {
    return <Navigate to="/" replace />;
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const maturityChartData = stats ? Object.entries(stats.maturityDistribution).map(([level, count]) => ({
    name: MATURITY_LABELS[level],
    value: count,
    level,
  })) : [];

  const industryChartData = stats ? Object.entries(stats.industryDistribution).map(([industry, count]) => ({
    name: industry,
    value: count,
  })) : [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 text-primary mb-2">
          <BarChart3 className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Research Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Study Analytics
        </h1>
        <p className="mt-1 text-muted-foreground">
          Aggregated data across all {stats?.totalOrganizations || 0} participating organizations
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="participants">Study Participants</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="export">Data Export</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmarking</TabsTrigger>
          <TabsTrigger value="notifications">Test Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <div className="metric-card animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Organizations</p>
              <p className="text-2xl font-bold text-foreground">{stats?.totalOrganizations || 0}</p>
            </div>
          </div>
        </div>
        <div className="metric-card animate-slide-up" style={{ animationDelay: "50ms" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Maturity</p>
              <p className="text-2xl font-bold text-foreground">{stats?.avgMaturityLevel.toFixed(1) || 0}</p>
            </div>
          </div>
        </div>
        <div className="metric-card animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15">
              <DollarSign className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Risk</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalRiskExposure || 0)}</p>
            </div>
          </div>
        </div>
        <div className="metric-card animate-slide-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Risk/Org</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats?.avgRiskExposure || 0)}</p>
            </div>
          </div>
        </div>
        <div className="metric-card animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Pass Rate</p>
              <p className="text-2xl font-bold text-success">{stats?.avgPassRate.toFixed(1) || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Maturity Distribution */}
        <div className="metric-card animate-slide-up" style={{ animationDelay: "250ms" }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Maturity Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maturityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {maturityChartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Distribution */}
        <div className="metric-card animate-slide-up" style={{ animationDelay: "300ms" }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Industry Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={industryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {industryChartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Trend */}
        <div className="metric-card animate-slide-up" style={{ animationDelay: "350ms" }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Risk Trend (30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.riskTrend || []}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  tickLine={false}
                  tickFormatter={(value) => value.slice(5)}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Avg Risk']}
                />
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#riskGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="metric-card overflow-hidden p-0 animate-slide-up" style={{ animationDelay: "400ms" }}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Participating Organizations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Organization
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Industry
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Size
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Maturity
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Risk Exposure
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {organizations?.map((org, index) => (
                <tr
                  key={org.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${450 + index * 30}ms` }}
                  onClick={() => setSelectedOrg(org.id === selectedOrg ? null : org.id)}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                        {org.name.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground">{org.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                      {org.industry}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground capitalize">
                    {org.size}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm",
                      org.current_maturity_level === 'level_1' && "bg-destructive/15 text-destructive",
                      org.current_maturity_level === 'level_2' && "bg-risk-high/15 text-[hsl(var(--risk-high))]",
                      org.current_maturity_level === 'level_3' && "bg-warning/15 text-warning",
                      org.current_maturity_level === 'level_4' && "bg-success/15 text-success",
                      org.current_maturity_level === 'level_5' && "bg-primary/15 text-primary",
                    )}>
                      {org.current_maturity_level.replace('level_', '')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-foreground">
                    {formatCurrency(org.current_risk_exposure || 0)}
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-muted-foreground">
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!organizations || organizations.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No organizations have joined the study yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="participants" className="animate-fade-in">
          <StudyParticipantsManager />
        </TabsContent>

        <TabsContent value="users" className="animate-fade-in">
          <UserRoleManager />
        </TabsContent>

        <TabsContent value="export" className="animate-fade-in">
          <DataExporter />
        </TabsContent>

        <TabsContent value="benchmark" className="animate-fade-in">
          <OrganizationBenchmark />
        </TabsContent>

        <TabsContent value="notifications" className="animate-fade-in">
          <SampleNotificationsGenerator />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
