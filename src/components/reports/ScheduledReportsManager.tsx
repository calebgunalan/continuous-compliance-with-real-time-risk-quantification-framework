import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScheduledReport {
  id: string;
  name: string;
  frequency: string;
  enabled: boolean;
  lastSent?: string;
}

export function ScheduledReportsManager() {
  const { toast } = useToast();
  
  const [reports, setReports] = useState<ScheduledReport[]>([
    { id: '1', name: 'Executive Summary', frequency: 'weekly', enabled: true, lastSent: '2026-01-01' },
    { id: '2', name: 'Compliance Status', frequency: 'daily', enabled: false },
    { id: '3', name: 'Risk Assessment', frequency: 'monthly', enabled: true, lastSent: '2025-12-15' },
    { id: '4', name: 'Control Audit', frequency: 'weekly', enabled: false },
  ]);

  const handleToggle = (id: string) => {
    setReports(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
    toast({
      title: 'Schedule Updated',
      description: 'Report schedule has been updated.',
    });
  };

  const handleFrequencyChange = (id: string, frequency: string) => {
    setReports(prev => prev.map(r => 
      r.id === id ? { ...r, frequency } : r
    ));
    toast({
      title: 'Frequency Updated',
      description: `Report will now be sent ${frequency}.`,
    });
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Scheduled Reports
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure automated report delivery
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Mail className="h-4 w-4" />
          Test Email
        </Button>
      </div>

      {/* Report List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20"
          >
            <div className="flex items-center gap-4">
              <Switch
                checked={report.enabled}
                onCheckedChange={() => handleToggle(report.id)}
              />
              <div>
                <p className="font-medium text-foreground">{report.name}</p>
                {report.lastSent && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    Last sent: {new Date(report.lastSent).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <Select
              value={report.frequency}
              onValueChange={(value) => handleFrequencyChange(report.id, value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/20">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success" />
          <div>
            <p className="font-medium text-foreground">
              {reports.filter(r => r.enabled).length} reports scheduled
            </p>
            <p className="text-sm text-muted-foreground">
              Reports will be sent to your configured email address
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
