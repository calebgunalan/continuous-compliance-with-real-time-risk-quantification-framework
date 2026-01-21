import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Download, 
  FileJson, 
  FileSpreadsheet,
  Table as TableIcon,
  CheckCircle2,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

interface DataCategory {
  id: string;
  name: string;
  description: string;
  recordCount: number;
  lastUpdated: string;
  tables: string[];
  exportFormats: ('csv' | 'json' | 'latex')[];
}

const dataCategories: DataCategory[] = [
  {
    id: 'compliance',
    name: 'Compliance Data',
    description: 'Control test results, pass rates, and compliance scores over time',
    recordCount: 45678,
    lastUpdated: '2026-01-21T10:00:00Z',
    tables: ['control_test_results', 'organization_controls', 'compliance_frameworks'],
    exportFormats: ['csv', 'json', 'latex']
  },
  {
    id: 'risk',
    name: 'Risk Quantification',
    description: 'FAIR calculations, threat scenarios, and risk exposure metrics',
    recordCount: 8934,
    lastUpdated: '2026-01-21T10:00:00Z',
    tables: ['risk_calculations', 'threat_scenarios', 'control_effectiveness'],
    exportFormats: ['csv', 'json', 'latex']
  },
  {
    id: 'maturity',
    name: 'Maturity Assessments',
    description: 'Monthly maturity level evaluations and domain scores',
    recordCount: 312,
    lastUpdated: '2026-01-20T08:00:00Z',
    tables: ['maturity_assessments', 'organizations'],
    exportFormats: ['csv', 'json', 'latex']
  },
  {
    id: 'incidents',
    name: 'Security Incidents',
    description: 'Breach incidents with severity, impact, and detection metrics',
    recordCount: 47,
    lastUpdated: '2026-01-19T15:30:00Z',
    tables: ['breach_incidents'],
    exportFormats: ['csv', 'json']
  },
  {
    id: 'participants',
    name: 'Study Participants',
    description: 'Organization enrollment, consent status, and engagement data',
    recordCount: 52,
    lastUpdated: '2026-01-21T09:00:00Z',
    tables: ['study_participants', 'organizations', 'profiles'],
    exportFormats: ['csv', 'json']
  },
  {
    id: 'comparisons',
    name: 'Audit Comparisons',
    description: 'Traditional vs continuous monitoring comparison metrics',
    recordCount: 156,
    lastUpdated: '2026-01-18T14:00:00Z',
    tables: ['audit_comparisons'],
    exportFormats: ['csv', 'json', 'latex']
  }
];

interface ExportConfig {
  categories: string[];
  format: 'csv' | 'json' | 'latex';
  dateRange: 'all' | '30days' | '90days' | '12months';
  anonymize: boolean;
  includeMetadata: boolean;
}

export function ResearchDataExporter() {
  const [config, setConfig] = useState<ExportConfig>({
    categories: [],
    format: 'csv',
    dateRange: 'all',
    anonymize: true,
    includeMetadata: true
  });

  const toggleCategory = (categoryId: string) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const totalRecords = dataCategories
    .filter(c => config.categories.includes(c.id))
    .reduce((sum, c) => sum + c.recordCount, 0);

  const handleExport = () => {
    if (config.categories.length === 0) {
      toast.error("Select at least one data category");
      return;
    }

    // Simulate export
    const exportData = {
      exportDate: new Date().toISOString(),
      format: config.format,
      dateRange: config.dateRange,
      anonymized: config.anonymize,
      categories: config.categories,
      recordCount: totalRecords
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-data-export-${new Date().toISOString().split('T')[0]}.${config.format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${totalRecords.toLocaleString()} records`);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv': return <FileSpreadsheet className="h-4 w-4" />;
      case 'json': return <FileJson className="h-4 w-4" />;
      case 'latex': return <TableIcon className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Research Data Exporter
        </CardTitle>
        <CardDescription>
          Per PRP Section 5 - Comprehensive data export for statistical analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="select">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="select">Select Data</TabsTrigger>
            <TabsTrigger value="configure">Configure Export</TabsTrigger>
            <TabsTrigger value="preview">Preview & Export</TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="space-y-4">
            <div className="grid gap-3">
              {dataCategories.map((category) => (
                <div
                  key={category.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    config.categories.includes(category.id) ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                  }`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={config.categories.includes(category.id)} />
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{category.recordCount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">records</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3 pl-7">
                    {category.tables.map((table) => (
                      <Badge key={table} variant="outline" className="text-xs font-mono">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="configure" className="space-y-4">
            <div className="grid gap-4 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <Select value={config.format} onValueChange={(v: any) => setConfig(prev => ({ ...prev, format: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Spreadsheet compatible)</SelectItem>
                    <SelectItem value="json">JSON (Programmatic access)</SelectItem>
                    <SelectItem value="latex">LaTeX (Publication tables)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={config.dateRange} onValueChange={(v: any) => setConfig(prev => ({ ...prev, dateRange: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Data</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="12months">Last 12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={config.anonymize}
                    onCheckedChange={(v) => setConfig(prev => ({ ...prev, anonymize: !!v }))}
                  />
                  <div>
                    <label className="text-sm font-medium">Anonymize Data</label>
                    <p className="text-xs text-muted-foreground">Replace organization names with IDs (recommended)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={config.includeMetadata}
                    onCheckedChange={(v) => setConfig(prev => ({ ...prev, includeMetadata: !!v }))}
                  />
                  <div>
                    <label className="text-sm font-medium">Include Metadata</label>
                    <p className="text-xs text-muted-foreground">Add export timestamp, version, and schema info</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {/* Export Summary */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Export Summary</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Selected Categories</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {config.categories.length > 0 ? (
                      config.categories.map(catId => {
                        const cat = dataCategories.find(c => c.id === catId);
                        return <Badge key={catId} variant="outline">{cat?.name}</Badge>;
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground">None selected</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Total Records</span>
                  <div className="text-2xl font-bold">{totalRecords.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  {getFormatIcon(config.format)}
                  <span className="text-sm font-medium">{config.format.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${config.anonymize ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  <span className="text-sm">{config.anonymize ? 'Anonymized' : 'Not anonymized'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm">{config.dateRange === 'all' ? 'All time' : config.dateRange}</span>
                </div>
              </div>
            </div>

            {/* Data Dictionary Preview */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Data Dictionary (Sample Fields)</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { field: 'organization_id', type: 'UUID', desc: 'Anonymized org identifier' },
                  { field: 'maturity_level', type: 'ENUM', desc: 'level_1 through level_5' },
                  { field: 'control_pass_rate', type: 'DECIMAL', desc: '0.0 to 1.0' },
                  { field: 'risk_exposure', type: 'DECIMAL', desc: 'Annual loss expectancy ($)' },
                  { field: 'breach_count', type: 'INTEGER', desc: 'Incidents during period' },
                  { field: 'assessment_date', type: 'TIMESTAMP', desc: 'ISO 8601 format' }
                ].map((field) => (
                  <div key={field.field} className="flex items-start gap-2 bg-muted/30 rounded p-2">
                    <code className="text-xs font-mono text-primary">{field.field}</code>
                    <Badge variant="outline" className="text-xs">{field.type}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={config.categories.length === 0}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export {totalRecords.toLocaleString()} Records
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
