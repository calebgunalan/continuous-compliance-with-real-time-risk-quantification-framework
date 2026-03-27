import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjectMilestones } from "@/hooks/useProjectMilestones";
import { useBudgetItems } from "@/hooks/useBudgetItems";
import { useProjectRisks } from "@/hooks/useProjectRisks";
import { useSuccessMetrics } from "@/hooks/useSuccessMetrics";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { useConsentRecords } from "@/hooks/useConsentRecords";
import { useFundingApplications } from "@/hooks/useFundingApplications";
import { FileText, Download, Loader2, CheckCircle2, Calendar, DollarSign, AlertTriangle, Target, Ticket, FileCheck, Banknote } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

export function ProjectStatusPDFReport() {
  const { milestones, stats: mStats } = useProjectMilestones();
  const { items: budgetItems, stats: bStats } = useBudgetItems();
  const { risks, stats: rStats } = useProjectRisks();
  const { metrics, stats: sStats } = useSuccessMetrics();
  const { stats: tStats } = useSupportTickets();
  const { stats: cStats } = useConsentRecords();
  const { stats: fStats } = useFundingApplications();

  const [isGenerating, setIsGenerating] = useState(false);

  const fmt = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const m = 15;
      let y = m;

      const addPageIfNeeded = (needed: number) => {
        if (y + needed > ph - 20) {
          pdf.addPage();
          y = m;
          return true;
        }
        return false;
      };

      const drawSectionHeader = (title: string) => {
        addPageIfNeeded(20);
        pdf.setFillColor(30, 41, 59);
        pdf.rect(m, y, pw - m * 2, 10, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, m + 4, y + 7);
        y += 14;
      };

      const drawKV = (label: string, value: string, x: number) => {
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(label, x, y);
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(value, x, y + 5);
      };

      // ===== COVER =====
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pw, 60, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("Project Status Report", m, 25);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text("Continuous Compliance with Real-Time Risk Quantification Framework", m, 35);
      pdf.setFontSize(9);
      pdf.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, m, 48);
      pdf.text(`Report Period: Project Inception to Present`, pw - m - 75, 48);
      y = 70;

      // ===== EXECUTIVE SUMMARY =====
      drawSectionHeader("Executive Summary");
      const boxW = (pw - m * 2 - 15) / 4;
      const boxes = [
        { label: "Timeline Progress", value: `${Math.round(mStats.overallProgress)}%`, color: [59, 130, 246] },
        { label: "Budget Utilized", value: `${Math.round(bStats.utilizationRate)}%`, color: [34, 197, 94] },
        { label: "Open Risks", value: `${rStats.open}`, color: [239, 68, 68] },
        { label: "Metrics Achieved", value: `${sStats.achieved}/${sStats.total}`, color: [168, 85, 247] },
      ];
      boxes.forEach((b, i) => {
        const x = m + (boxW + 5) * i;
        pdf.setFillColor(b.color[0], b.color[1], b.color[2]);
        pdf.roundedRect(x, y, boxW, 22, 2, 2, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.text(b.label, x + 4, y + 7);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(b.value, x + 4, y + 17);
      });
      y += 30;

      // Additional summary row
      const boxes2 = [
        { label: "Total Budget", value: fmt(bStats.totalBudgeted) },
        { label: "Amount Spent", value: fmt(bStats.totalSpent) },
        { label: "Support Tickets", value: `${tStats.total} (${tStats.open} open)` },
        { label: "Active Consents", value: `${cStats.active}` },
      ];
      boxes2.forEach((b, i) => {
        drawKV(b.label, b.value, m + (boxW + 5) * i);
      });
      y += 12;

      // ===== TIMELINE & MILESTONES =====
      drawSectionHeader(`Timeline & Milestones (${mStats.completed}/${mStats.total} Complete)`);

      // Phase summary
      const phases = milestones.reduce<Record<string, { total: number; done: number; progress: number }>>((acc, ms) => {
        if (!acc[ms.phase_name]) acc[ms.phase_name] = { total: 0, done: 0, progress: 0 };
        acc[ms.phase_name].total++;
        if (ms.status === "completed") acc[ms.phase_name].done++;
        acc[ms.phase_name].progress += ms.progress_percentage;
        return acc;
      }, {});

      Object.entries(phases).forEach(([phase, data]) => {
        addPageIfNeeded(12);
        const avgProg = Math.round(data.progress / data.total);
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text(phase, m, y + 4);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(`${data.done}/${data.total} milestones`, m + 100, y + 4);

        // Progress bar
        const barX = m + 130;
        const barW = pw - m - barX - 25;
        pdf.setFillColor(226, 232, 240);
        pdf.roundedRect(barX, y + 1, barW, 4, 1, 1, "F");
        pdf.setFillColor(59, 130, 246);
        pdf.roundedRect(barX, y + 1, barW * (avgProg / 100), 4, 1, 1, "F");
        pdf.text(`${avgProg}%`, barX + barW + 2, y + 5);
        y += 9;
      });
      y += 4;

      // Milestone table
      addPageIfNeeded(15);
      pdf.setFillColor(241, 245, 249);
      pdf.rect(m, y, pw - m * 2, 7, "F");
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("Milestone", m + 2, y + 5);
      pdf.text("Status", m + 90, y + 5);
      pdf.text("Progress", m + 120, y + 5);
      pdf.text("Target Date", m + 148, y + 5);
      y += 9;

      milestones.forEach((ms) => {
        addPageIfNeeded(8);
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.text(ms.milestone_name.substring(0, 45), m + 2, y + 4);
        
        const statusColor = ms.status === "completed" ? [34, 197, 94] : ms.status === "in_progress" ? [59, 130, 246] : ms.status === "delayed" ? [239, 68, 68] : [148, 163, 184];
        pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        pdf.text(ms.status.replace("_", " "), m + 90, y + 4);
        
        pdf.setTextColor(30, 41, 59);
        pdf.text(`${ms.progress_percentage}%`, m + 120, y + 4);
        pdf.text(new Date(ms.target_date).toLocaleDateString(), m + 148, y + 4);
        y += 7;
      });
      y += 4;

      // ===== BUDGET =====
      drawSectionHeader(`Budget Overview (${fmt(bStats.totalSpent)} of ${fmt(bStats.totalBudgeted)} spent)`);

      pdf.setFillColor(241, 245, 249);
      pdf.rect(m, y, pw - m * 2, 7, "F");
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("Category / Item", m + 2, y + 5);
      pdf.text("Budgeted", m + 100, y + 5);
      pdf.text("Spent", m + 125, y + 5);
      pdf.text("Utilization", m + 148, y + 5);
      y += 9;

      bStats.categoryTotals.forEach((cat) => {
        addPageIfNeeded(8);
        const util = cat.budgeted > 0 ? Math.round((cat.spent / cat.budgeted) * 100) : 0;
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.text(cat.category, m + 2, y + 4);
        pdf.setFont("helvetica", "normal");
        pdf.text(fmt(cat.budgeted), m + 100, y + 4);
        pdf.text(fmt(cat.spent), m + 125, y + 4);
        const utilColor = util > 80 ? [239, 68, 68] : util > 50 ? [234, 179, 8] : [34, 197, 94];
        pdf.setTextColor(utilColor[0], utilColor[1], utilColor[2]);
        pdf.text(`${util}%`, m + 148, y + 4);
        y += 7;
      });
      y += 4;

      // ===== RISK REGISTER =====
      drawSectionHeader(`Risk Register (${rStats.total} risks, ${rStats.highRisk} high-severity)`);

      pdf.setFillColor(241, 245, 249);
      pdf.rect(m, y, pw - m * 2, 7, "F");
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("Risk", m + 2, y + 5);
      pdf.text("Category", m + 75, y + 5);
      pdf.text("L×I", m + 110, y + 5);
      pdf.text("Score", m + 125, y + 5);
      pdf.text("Status", m + 145, y + 5);
      y += 9;

      risks.forEach((r) => {
        addPageIfNeeded(8);
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.text(r.risk_name.substring(0, 38), m + 2, y + 4);
        pdf.text(r.risk_category.substring(0, 18), m + 75, y + 4);
        pdf.text(`${r.likelihood}×${r.impact}`, m + 110, y + 4);
        
        const scoreColor = r.risk_score >= 15 ? [239, 68, 68] : r.risk_score >= 9 ? [234, 179, 8] : [34, 197, 94];
        pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${r.risk_score}`, m + 125, y + 4);
        
        const sColor = r.status === "open" ? [239, 68, 68] : r.status === "monitoring" ? [234, 179, 8] : [34, 197, 94];
        pdf.setTextColor(sColor[0], sColor[1], sColor[2]);
        pdf.setFont("helvetica", "normal");
        pdf.text(r.status, m + 145, y + 4);
        y += 7;
      });
      y += 4;

      // ===== SUCCESS METRICS =====
      drawSectionHeader(`Success Metrics (${sStats.achieved} achieved, ${Math.round(sStats.overallProgress)}% overall)`);

      pdf.setFillColor(241, 245, 249);
      pdf.rect(m, y, pw - m * 2, 7, "F");
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("Metric", m + 2, y + 5);
      pdf.text("Category", m + 80, y + 5);
      pdf.text("Current", m + 115, y + 5);
      pdf.text("Target", m + 135, y + 5);
      pdf.text("Status", m + 155, y + 5);
      y += 9;

      metrics.forEach((met) => {
        addPageIfNeeded(8);
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.text(met.metric_name.substring(0, 40), m + 2, y + 4);
        pdf.text(met.category.substring(0, 18), m + 80, y + 4);
        pdf.text(`${met.current_value}${met.unit ? " " + met.unit : ""}`, m + 115, y + 4);
        pdf.text(`${met.target_value || "-"}${met.unit ? " " + met.unit : ""}`, m + 135, y + 4);
        
        const stColor = met.status === "achieved" ? [34, 197, 94] : met.status === "on_track" ? [59, 130, 246] : met.status === "at_risk" ? [234, 179, 8] : [148, 163, 184];
        pdf.setTextColor(stColor[0], stColor[1], stColor[2]);
        pdf.text(met.status.replace("_", " "), m + 155, y + 4);
        y += 7;
      });
      y += 4;

      // ===== SUPPORT & GOVERNANCE =====
      drawSectionHeader("Research Governance Summary");
      const govData = [
        { label: "Support Tickets", value: `${tStats.total} total, ${tStats.open} open, ${tStats.resolved} resolved` },
        { label: "Consent Records", value: `${cStats.total} total, ${cStats.active} active, ${cStats.revoked} revoked` },
        { label: "Funding Applications", value: `${fStats.total} total, ${fStats.awarded} awarded, ${fmt(fStats.totalRequested)} requested` },
      ];
      govData.forEach((g) => {
        addPageIfNeeded(8);
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(g.label + ":", m, y + 4);
        pdf.setFont("helvetica", "normal");
        pdf.text(g.value, m + 45, y + 4);
        y += 7;
      });

      // ===== FOOTER ON ALL PAGES =====
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setTextColor(148, 163, 184);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.text("CC-RRQ Framework — Confidential Project Status Report", m, ph - 8);
        pdf.text(`Page ${p} of ${totalPages}`, pw - m - 20, ph - 8);
      }

      pdf.save(`Project_Status_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Project status report downloaded");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Comprehensive Project Status Report
        </CardTitle>
        <CardDescription>
          PDF export combining timeline, budget, risks, metrics, and governance data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>{mStats.total} milestones</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <span>{fmt(bStats.totalBudgeted)} budget</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>{rStats.total} risks</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-purple-500" />
            <span>{sStats.total} metrics</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Ticket className="h-4 w-4 text-blue-500" />
            <span>{tStats.total} tickets</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileCheck className="h-4 w-4 text-emerald-500" />
            <span>{cStats.active} consents</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Banknote className="h-4 w-4 text-amber-500" />
            <span>{fStats.total} funding apps</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>{sStats.achieved} achieved</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">Includes: Timeline • Budget • Risks • Metrics • Governance</Badge>
        </div>

        <Button onClick={generatePDF} disabled={isGenerating} className="w-full gap-2">
          {isGenerating ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Generating Report...</>
          ) : (
            <><Download className="h-4 w-4" />Download Project Status Report (PDF)</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
