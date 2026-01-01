import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileJson, FileSpreadsheet, Loader2, ShieldCheck } from "lucide-react";

type DataType = "organizations" | "controls" | "risk_calculations" | "maturity_assessments" | "all";
type ExportFormat = "csv" | "json";

export function DataExporter() {
  const [dataType, setDataType] = useState<DataType>("all");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [anonymize, setAnonymize] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

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

      // Create download
      const blob = new Blob(
        [typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2)],
        { type: format === "csv" ? "text/csv" : "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `study_export_${dataType}_${new Date().toISOString().split("T")[0]}.${format}`;
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <CardTitle>Research Data Export</CardTitle>
        </div>
        <CardDescription>
          Export anonymized study data for external analysis. Only available to researchers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
          </div>
        </div>

        {/* Anonymization Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-success" />
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
      </CardContent>
    </Card>
  );
}
