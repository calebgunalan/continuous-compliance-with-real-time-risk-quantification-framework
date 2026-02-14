import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProjectMilestones } from "@/hooks/useProjectMilestones";
import { useBudgetItems } from "@/hooks/useBudgetItems";
import { useProjectRisks } from "@/hooks/useProjectRisks";
import { useSuccessMetrics } from "@/hooks/useSuccessMetrics";
import { useRealtimeResearchData } from "@/hooks/useRealtimeUpdates";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  AlertTriangle,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Rocket,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
} from "recharts";

const COLORS = ["hsl(var(--success))", "hsl(var(--primary))", "hsl(var(--warning))", "hsl(var(--muted-foreground))"];

export default function ProjectOverview() {
  const { stats: mStats, isLoading: mLoading } = useProjectMilestones();
  const { stats: bStats, isLoading: bLoading } = useBudgetItems();
  const { risks, stats: rStats, isLoading: rLoading } = useProjectRisks();
  const { stats: sStats, isLoading: sLoading } = useSuccessMetrics();
  const [seeding, setSeeding] = useState(false);

  // Enable realtime subscriptions for research tables
  useRealtimeResearchData();

  const isLoading = mLoading || bLoading || rLoading || sLoading;
  const isEmpty = mStats.total === 0 && bStats.itemCount === 0 && rStats.total === 0 && sStats.total === 0;

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-prp-data");
      if (error) throw error;
      toast.success(`Seeded ${Object.values(data.seeded as Record<string, number>).reduce((a: number, b: number) => a + b, 0)} records from PRP document`);
      // Queries will auto-refresh via realtime
      window.location.reload();
    } catch (e: any) {
      toast.error(`Seeding failed: ${e.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const milestoneDonut = [
    { name: "Completed", value: mStats.completed },
    { name: "In Progress", value: mStats.inProgress },
    { name: "Delayed", value: mStats.delayed },
    { name: "Pending", value: mStats.pending },
  ].filter(d => d.value > 0);

  const budgetChart = bStats.categoryTotals.map(c => ({
    name: c.category.replace("Publication & Dissemination", "Pub/Diss"),
    Budgeted: c.budgeted,
    Spent: c.spent,
  }));

  const riskHeatData = risks.map(r => ({
    name: r.risk_name.slice(0, 25),
    score: r.risk_score,
    status: r.status,
  }));

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 text-primary mb-2">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Project Overview</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Research Project Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Executive summary across timeline, budget, risks, and success metrics</p>
          </div>
          {isEmpty && (
            <Button onClick={handleSeedData} disabled={seeding} className="gap-2">
              {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              Seed PRP Data
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card className="animate-slide-up">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Timeline</CardDescription>
                  <Badge variant="outline">{mStats.total} milestones</Badge>
                </div>
                <CardTitle className="text-2xl">{Math.round(mStats.overallProgress)}%</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={mStats.overallProgress} className="h-2" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{mStats.completed} done</span>
                  <span>{mStats.inProgress} active</span>
                  <span>{mStats.pending} pending</span>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" />Budget</CardDescription>
                  <Badge variant="outline">${(bStats.totalBudgeted / 1000).toFixed(0)}K total</Badge>
                </div>
                <CardTitle className="text-2xl">{Math.round(bStats.utilizationRate)}%</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={bStats.utilizationRate} className="h-2" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>${(bStats.totalSpent / 1000).toFixed(0)}K spent</span>
                  <span>${((bStats.totalBudgeted - bStats.totalSpent) / 1000).toFixed(0)}K remaining</span>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" />Risks</CardDescription>
                  <Badge variant={rStats.highRisk > 0 ? "destructive" : "outline"}>{rStats.highRisk} high</Badge>
                </div>
                <CardTitle className="text-2xl">{rStats.total}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {rStats.open > 0 && <Badge className="bg-destructive/15 text-destructive border-0">{rStats.open} open</Badge>}
                  {rStats.monitoring > 0 && <Badge className="bg-warning/15 text-warning border-0">{rStats.monitoring} monitoring</Badge>}
                  {rStats.mitigated > 0 && <Badge className="bg-success/15 text-success border-0">{rStats.mitigated} mitigated</Badge>}
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up" style={{ animationDelay: "150ms" }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="flex items-center gap-1.5"><Target className="h-4 w-4" />Success Metrics</CardDescription>
                  <Badge variant="outline">{sStats.total} metrics</Badge>
                </div>
                <CardTitle className="text-2xl">{Math.round(sStats.overallProgress || 0)}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {sStats.achieved > 0 && <Badge className="bg-success/15 text-success border-0">{sStats.achieved} achieved</Badge>}
                  {sStats.onTrack > 0 && <Badge className="bg-primary/15 text-primary border-0">{sStats.onTrack} on track</Badge>}
                  {sStats.atRisk > 0 && <Badge className="bg-warning/15 text-warning border-0">{sStats.atRisk} at risk</Badge>}
                  {sStats.pending > 0 && <Badge variant="outline">{sStats.pending} pending</Badge>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {/* Milestone Donut */}
            <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Milestone Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {milestoneDonut.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={milestoneDonut} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {milestoneDonut.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">No milestones yet</div>
                )}
              </CardContent>
            </Card>

            {/* Budget Bar */}
            <Card className="animate-slide-up" style={{ animationDelay: "250ms" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Budget by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {budgetChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={budgetChart} layout="vertical">
                      <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Bar dataKey="Budgeted" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="Spent" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">No budget data yet</div>
                )}
              </CardContent>
            </Card>

            {/* Risk Scores */}
            <Card className="animate-slide-up" style={{ animationDelay: "300ms" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Risk Scores</CardTitle>
              </CardHeader>
              <CardContent>
                {riskHeatData.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {riskHeatData.sort((a, b) => b.score - a.score).map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${r.score >= 15 ? 'bg-destructive' : r.score >= 9 ? 'bg-warning' : 'bg-success'}`} />
                        <span className="text-xs truncate flex-1">{r.name}</span>
                        <Badge variant="outline" className="text-xs shrink-0">{r.score}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">No risks tracked yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Phase Progress */}
          {mStats.phaseProgress.length > 0 && (
            <Card className="mb-6 animate-slide-up" style={{ animationDelay: "350ms" }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Phase Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mStats.phaseProgress.map((p, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{p.phase}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {p.completedMilestones}/{p.totalMilestones}
                          <Clock className="h-3 w-3 ml-2" />
                          {Math.round(p.averageProgress)}%
                        </span>
                      </div>
                      <Progress value={p.averageProgress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <div className="grid gap-3 md:grid-cols-4">
            {[
              { label: "Timeline & Milestones", href: "/research", icon: Calendar },
              { label: "Budget Tracker", href: "/research", icon: DollarSign },
              { label: "Risk Register", href: "/research", icon: AlertTriangle },
              { label: "Success Metrics", href: "/research", icon: Target },
            ].map((link, i) => (
              <Link key={i} to={link.href}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-3 py-4">
                    <link.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium flex-1">{link.label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
}
