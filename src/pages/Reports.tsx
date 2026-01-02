import { AppLayout } from "@/components/layout/AppLayout";
import { PDFReportGenerator } from "@/components/reports/PDFReportGenerator";
import { ExecutiveReportExport } from "@/components/reports/ExecutiveReportExport";
import { ComplianceSummaryReport } from "@/components/reports/ComplianceSummaryReport";
import { ScheduledReportsManager } from "@/components/reports/ScheduledReportsManager";
import { FileText, Download, Calendar, BarChart3 } from "lucide-react";

export default function Reports() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Reports
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate executive compliance summaries and risk assessment reports
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Report Types</p>
                <p className="text-2xl font-bold text-foreground">4</p>
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Download className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exports Available</p>
                <p className="text-2xl font-bold text-foreground">PDF, TXT</p>
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-foreground">Weekly</p>
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <BarChart3 className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Charts Included</p>
                <p className="text-2xl font-bold text-foreground">Yes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Generators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PDFReportGenerator />
          <ExecutiveReportExport />
        </div>

        {/* Additional Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComplianceSummaryReport />
          <ScheduledReportsManager />
        </div>
      </div>
    </AppLayout>
  );
}
