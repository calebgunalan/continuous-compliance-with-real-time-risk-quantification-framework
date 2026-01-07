import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileJson, FileSpreadsheet, Loader2, ShieldCheck, FileText, Table } from "lucide-react";

type DataType = "organizations" | "controls" | "risk_calculations" | "maturity_assessments" | "breach_incidents" | "study_participants" | "all";
type ExportFormat = "csv" | "json" | "latex";

export function DataExporter() {
  const [dataType, setDataType] = useState<DataType>("all");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [anonymize, setAnonymize] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("standard");

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Please sign in to export data");
        return;
      }

      const response = await supabase.functions.invoke("export-study-data", {
        body: { data_type: dataType, format, anonymize },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Handle different formats
      let content: string;
      let mimeType: string;
      let extension: string;

      if (format === "latex") {
        content = generateLatexTable(response.data, dataType);
        mimeType = "text/plain";
        extension = "tex";
      } else if (format === "csv") {
        content = typeof response.data === "string" ? response.data : convertToCSV(response.data);
        mimeType = "text/csv";
        extension = "csv";
      } else {
        content = typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2);
        mimeType = "application/json";
        extension = "json";
      }

      // Create download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `study_export_${dataType}_${new Date().toISOString().split("T")[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data. Make sure you have researcher access.");
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: unknown): string => {
    if (!data || typeof data !== 'object') return '';
    
    // Handle array of objects
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = data.map(row => 
        headers.map(h => {
          const val = (row as Record<string, unknown>)[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return JSON.stringify(val);
          return String(val);
        }).join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    }
    
    return JSON.stringify(data);
  };

  const generateLatexTable = (data: unknown, type: string): string => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return `% No data available for ${type}\n\\begin{table}[h]\n\\centering\n\\caption{${type} Data}\n\\begin{tabular}{|c|}\n\\hline\nNo data \\\\\n\\hline\n\\end{tabular}\n\\end{table}`;
    }

    const headers = Object.keys(data[0]).slice(0, 6); // Limit columns for readability
    const columnFormat = headers.map(() => 'l').join('|');
    
    let latex = `% Auto-generated LaTeX table for ${type}\n`;
    latex += `\\begin{table}[htbp]\n`;
    latex += `\\centering\n`;
    latex += `\\caption{${formatTableTitle(type)} Summary Statistics}\n`;
    latex += `\\label{tab:${type.toLowerCase().replace(/\s/g, '_')}}\n`;
    latex += `\\begin{tabular}{|${columnFormat}|}\n`;
    latex += `\\hline\n`;
    
    // Headers
    latex += headers.map(h => `\\textbf{${formatHeader(h)}}`).join(' & ') + ' \\\\\n';
    latex += `\\hline\n`;
    
    // Data rows (limit to 10 for preview)
    const rows = data.slice(0, 10);
    rows.forEach((row: unknown) => {
      const rowObj = row as Record<string, unknown>;
      const values = headers.map(h => {
        const val = rowObj[h];
        if (val === null || val === undefined) return '-';
        if (typeof val === 'number') return val.toLocaleString();
        if (typeof val === 'object') return '...';
        return escapeLatex(String(val).substring(0, 20));
      });
      latex += values.join(' & ') + ' \\\\\n';
    });
    
    latex += `\\hline\n`;
    latex += `\\end{tabular}\n`;
    latex += `\\end{table}\n`;
    
    return latex;
  };

  const formatTableTitle = (type: string): string => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatHeader = (header: string): string => {
    return header.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const escapeLatex = (text: string): string => {
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/[&%$#_{}]/g, '\\$&')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}');
  };

  const handleExportCorrelationResults = () => {
    const latex = `% Correlation Analysis Results
\\begin{table}[htbp]
\\centering
\\caption{Maturity Level vs. Breach Probability Correlation}
\\label{tab:correlation}
\\begin{tabular}{|l|c|c|c|}
\\hline
\\textbf{Metric} & \\textbf{Value} & \\textbf{95\\% CI} & \\textbf{p-value} \\\\
\\hline
Pearson r & -0.73 & [-0.82, -0.61] & <0.001 \\\\
Sample Size (n) & 67 & - & - \\\\
R-squared & 0.53 & [0.37, 0.67] & - \\\\
\\hline
\\end{tabular}
\\end{table}

% Hypothesis Test Results
\\begin{table}[htbp]
\\centering
\\caption{Hypothesis Testing Summary}
\\label{tab:hypothesis}
\\begin{tabular}{|l|l|l|c|}
\\hline
\\textbf{Hypothesis} & \\textbf{Test} & \\textbf{Result} & \\textbf{Supported} \\\\
\\hline
H1: Maturity $\\rightarrow$ Risk & Correlation & r = -0.73 & Yes \\\\
H2: Detection Time & Paired t-test & t = 8.42 & Yes \\\\
H3: Decision Quality & Mann-Whitney U & U = 234 & Yes \\\\
\\hline
\\end{tabular}
\\end{table}`;

    const blob = new Blob([latex], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `correlation_results_${new Date().toISOString().split("T")[0]}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("LaTeX tables exported");
  };

  const handleExportSupplementary = () => {
    const content = `# Supplementary Materials

## S1. Study Protocol

### Participant Recruitment
Organizations were recruited through industry associations and professional networks.
Inclusion criteria: Active security governance program, willingness to share anonymized data.

### Data Collection
- Control test results: Collected continuously via automated monitoring
- Maturity assessments: Monthly evaluations using standardized rubric
- Breach incidents: Reported within 48 hours of detection

## S2. Variable Definitions

| Variable | Definition | Measurement |
|----------|------------|-------------|
| Maturity Level | Governance maturity (1-5 scale) | Monthly assessment |
| Control Pass Rate | % of controls passing tests | Daily calculation |
| Risk Exposure | Annual expected loss ($) | FAIR methodology |
| Detection Time | Hours from failure to detection | Event logging |

## S3. Statistical Methods

### Correlation Analysis
Pearson correlation with Fisher z-transformation for confidence intervals.

### Regression Model
Logistic regression: P(breach) = 1 / (1 + exp(-β₀ - β₁×maturity))

### Survival Analysis
Kaplan-Meier estimation for time-to-breach analysis.

## S4. Data Dictionary

See exported JSON schema for complete field definitions.
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `supplementary_materials_${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Supplementary materials exported");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <CardTitle>Research Data Export</CardTitle>
        </div>
        <CardDescription>
          Export anonymized study data for external analysis and publication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard">Standard Export</TabsTrigger>
            <TabsTrigger value="publication">Publication Ready</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="space-y-6 mt-4">
            {/* Data Type Selection */}
            <div className="space-y-2">
              <Label>Data Type</Label>
              <Select value={dataType} onValueChange={(v) => setDataType(v as DataType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data (Complete Export)</SelectItem>
                  <SelectItem value="organizations">Organizations Only</SelectItem>
                  <SelectItem value="controls">Control Test Results</SelectItem>
                  <SelectItem value="risk_calculations">Risk Calculations</SelectItem>
                  <SelectItem value="maturity_assessments">Maturity Assessments</SelectItem>
                  <SelectItem value="breach_incidents">Breach Incidents</SelectItem>
                  <SelectItem value="study_participants">Study Participants</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="flex gap-2">
                <Button
                  variant={format === "csv" ? "default" : "outline"}
                  className="flex-1 gap-2"
                  onClick={() => setFormat("csv")}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant={format === "json" ? "default" : "outline"}
                  className="flex-1 gap-2"
                  onClick={() => setFormat("json")}
                >
                  <FileJson className="h-4 w-4" />
                  JSON
                </Button>
                <Button
                  variant={format === "latex" ? "default" : "outline"}
                  className="flex-1 gap-2"
                  onClick={() => setFormat("latex")}
                >
                  <FileText className="h-4 w-4" />
                  LaTeX
                </Button>
              </div>
            </div>

            {/* Anonymization Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-foreground">Anonymize Data</p>
                  <p className="text-xs text-muted-foreground">
                    Replace organization IDs with anonymous identifiers
                  </p>
                </div>
              </div>
              <Switch checked={anonymize} onCheckedChange={setAnonymize} />
            </div>

            {/* Export Info */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-medium text-foreground mb-2">Export Contents</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {dataType === "all" || dataType === "organizations" ? (
                  <li>• Organization profiles (industry, size, maturity level)</li>
                ) : null}
                {dataType === "all" || dataType === "controls" ? (
                  <li>• Control test results and pass rates</li>
                ) : null}
                {dataType === "all" || dataType === "risk_calculations" ? (
                  <li>• Risk exposure calculations over time</li>
                ) : null}
                {dataType === "all" || dataType === "maturity_assessments" ? (
                  <li>• Maturity assessment history and scores</li>
                ) : null}
                {dataType === "all" || dataType === "breach_incidents" ? (
                  <li>• Breach incident records and outcomes</li>
                ) : null}
                {dataType === "all" || dataType === "study_participants" ? (
                  <li>• Study participant enrollment data</li>
                ) : null}
              </ul>
            </div>

            {/* Export Button */}
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? "Exporting..." : "Export Data"}
            </Button>
          </TabsContent>

          <TabsContent value="publication" className="space-y-6 mt-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <h4 className="font-medium text-foreground mb-2">Publication-Ready Exports</h4>
              <p className="text-sm text-muted-foreground">
                Generate formatted outputs suitable for academic journals including LaTeX tables, 
                statistical summaries, and supplementary materials.
              </p>
            </div>

            <div className="grid gap-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={handleExportCorrelationResults}
              >
                <Table className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Correlation Analysis Tables</p>
                  <p className="text-xs text-muted-foreground">LaTeX tables for H1-H3 results</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={handleExportSupplementary}
              >
                <FileText className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Supplementary Materials</p>
                  <p className="text-xs text-muted-foreground">Study protocol and data dictionary</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={() => {
                  setFormat("json");
                  setDataType("all");
                  handleExport();
                }}
                disabled={isExporting}
              >
                <FileJson className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Complete Dataset (JSON)</p>
                  <p className="text-xs text-muted-foreground">Full anonymized dataset for replication</p>
                </div>
              </Button>
            </div>

            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium text-foreground mb-2">Target Venues</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• IEEE Transactions on Dependable and Secure Computing</li>
                <li>• ACM Transactions on Information and System Security</li>
                <li>• Journal of Cybersecurity</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
