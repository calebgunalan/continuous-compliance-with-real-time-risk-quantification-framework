import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Bell, Settings2, Power, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ScheduleConfig {
  isEnabled: boolean;
  intervalMinutes: number;
  notifyOnFailure: boolean;
  notifyOnWarning: boolean;
  runDuringBusinessHours: boolean;
}

const intervalOptions = [
  { value: "5", label: "Every 5 minutes" },
  { value: "15", label: "Every 15 minutes" },
  { value: "30", label: "Every 30 minutes" },
  { value: "60", label: "Every hour" },
  { value: "360", label: "Every 6 hours" },
  { value: "720", label: "Every 12 hours" },
  { value: "1440", label: "Daily" },
];

export function ScheduledTestConfig() {
  const [config, setConfig] = useState<ScheduleConfig>({
    isEnabled: true,
    intervalMinutes: 60,
    notifyOnFailure: true,
    notifyOnWarning: false,
    runDuringBusinessHours: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastRun, setLastRun] = useState<Date>(new Date(Date.now() - 1800000)); // 30 mins ago
  const [nextRun, setNextRun] = useState<Date>(new Date(Date.now() + 1800000)); // 30 mins from now

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Schedule configuration saved", {
      description: `Tests will run every ${config.intervalMinutes} minutes`,
    });
  };

  const handleToggle = (enabled: boolean) => {
    setConfig(prev => ({ ...prev, isEnabled: enabled }));
    if (enabled) {
      toast.success("Automated testing enabled");
    } else {
      toast.info("Automated testing disabled");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Scheduled Testing</CardTitle>
              <CardDescription>Configure automated control test intervals</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="schedule-toggle" className="text-sm text-muted-foreground">
              {config.isEnabled ? "Active" : "Disabled"}
            </Label>
            <Switch
              id="schedule-toggle"
              checked={config.isEnabled}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Indicator */}
        <div className={`rounded-lg p-4 ${config.isEnabled ? 'bg-success/10 border border-success/20' : 'bg-muted/30'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Power className={`h-4 w-4 ${config.isEnabled ? 'text-success' : 'text-muted-foreground'}`} />
              <span className="text-sm font-medium">
                {config.isEnabled ? 'Scheduler Active' : 'Scheduler Inactive'}
              </span>
            </div>
            {config.isEnabled && (
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                Running
              </Badge>
            )}
          </div>
          {config.isEnabled && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Last Run</p>
                <p className="text-sm font-medium">{formatDate(lastRun)} at {formatTime(lastRun)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next Run</p>
                <p className="text-sm font-medium">{formatDate(nextRun)} at {formatTime(nextRun)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Interval Configuration */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Test Interval
          </Label>
          <Select
            value={config.intervalMinutes.toString()}
            onValueChange={(v) => setConfig(prev => ({ ...prev, intervalMinutes: parseInt(v) }))}
            disabled={!config.isEnabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {intervalOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            All enabled controls will be tested at this interval
          </p>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Notifications
          </Label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
              <div>
                <p className="text-sm font-medium">Alert on Failures</p>
                <p className="text-xs text-muted-foreground">Notify when controls fail tests</p>
              </div>
              <Switch
                checked={config.notifyOnFailure}
                onCheckedChange={(v) => setConfig(prev => ({ ...prev, notifyOnFailure: v }))}
                disabled={!config.isEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
              <div>
                <p className="text-sm font-medium">Alert on Warnings</p>
                <p className="text-xs text-muted-foreground">Notify when controls show warnings</p>
              </div>
              <Switch
                checked={config.notifyOnWarning}
                onCheckedChange={(v) => setConfig(prev => ({ ...prev, notifyOnWarning: v }))}
                disabled={!config.isEnabled}
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            Advanced
          </Label>
          
          <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
            <div>
              <p className="text-sm font-medium">Business Hours Only</p>
              <p className="text-xs text-muted-foreground">Run tests 9 AM - 6 PM (local time)</p>
            </div>
            <Switch
              checked={config.runDuringBusinessHours}
              onCheckedChange={(v) => setConfig(prev => ({ ...prev, runDuringBusinessHours: v }))}
              disabled={!config.isEnabled}
            />
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Configuration"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
