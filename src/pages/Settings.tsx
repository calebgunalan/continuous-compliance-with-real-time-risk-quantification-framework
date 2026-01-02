import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, Clock, Shield, AlertTriangle, TrendingUp, FileText, Loader2, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface NotificationPreferences {
  emailEnabled: boolean;
  email: string;
  controlFailures: boolean;
  controlWarnings: boolean;
  riskThresholdAlerts: boolean;
  riskThreshold: number;
  scheduledReports: boolean;
  reportFrequency: 'daily' | 'weekly' | 'monthly';
  maturityChanges: boolean;
  securityIncidents: boolean;
}

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    email: '',
    controlFailures: true,
    controlWarnings: false,
    riskThresholdAlerts: true,
    riskThreshold: 500000000,
    scheduledReports: true,
    reportFrequency: 'weekly',
    maturityChanges: true,
    securityIncidents: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call - in production, this would save to the database
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Notification preferences saved", {
      description: "Your settings have been updated successfully",
    });
  };

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K, 
    value: NotificationPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(0)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Configure your notification preferences and account settings
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6 animate-fade-in">
          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Configure email delivery settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                <div>
                  <p className="font-medium">Enable Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch 
                  checked={preferences.emailEnabled}
                  onCheckedChange={(v) => updatePreference('emailEnabled', v)}
                />
              </div>
              
              {preferences.emailEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="email">Notification Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={preferences.email}
                    onChange={(e) => updatePreference('email', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to use your account email
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Control Test Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15">
                  <Shield className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <CardTitle>Control Test Alerts</CardTitle>
                  <CardDescription>Get notified when control tests fail or show warnings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/15">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium">Control Failures</p>
                    <p className="text-sm text-muted-foreground">Immediate alert when controls fail</p>
                  </div>
                </div>
                <Switch 
                  checked={preferences.controlFailures}
                  onCheckedChange={(v) => updatePreference('controlFailures', v)}
                  disabled={!preferences.emailEnabled}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/15">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">Control Warnings</p>
                    <p className="text-sm text-muted-foreground">Alert when controls show warnings</p>
                  </div>
                </div>
                <Switch 
                  checked={preferences.controlWarnings}
                  onCheckedChange={(v) => updatePreference('controlWarnings', v)}
                  disabled={!preferences.emailEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Risk Threshold Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15">
                  <TrendingUp className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <CardTitle>Risk Threshold Alerts</CardTitle>
                  <CardDescription>Get notified when risk exposure exceeds threshold</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                <div>
                  <p className="font-medium">Enable Risk Threshold Alerts</p>
                  <p className="text-sm text-muted-foreground">Alert when annual risk exposure increases significantly</p>
                </div>
                <Switch 
                  checked={preferences.riskThresholdAlerts}
                  onCheckedChange={(v) => updatePreference('riskThresholdAlerts', v)}
                  disabled={!preferences.emailEnabled}
                />
              </div>

              {preferences.riskThresholdAlerts && preferences.emailEnabled && (
                <div className="space-y-3">
                  <Label>Alert Threshold</Label>
                  <Select
                    value={preferences.riskThreshold.toString()}
                    onValueChange={(v) => updatePreference('riskThreshold', parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100000000">$100M</SelectItem>
                      <SelectItem value="250000000">$250M</SelectItem>
                      <SelectItem value="500000000">$500M</SelectItem>
                      <SelectItem value="1000000000">$1B</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    You'll be notified when risk exposure exceeds {formatCurrency(preferences.riskThreshold)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Other Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle>Other Notifications</CardTitle>
                  <CardDescription>Additional notification preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                <div>
                  <p className="font-medium">Maturity Level Changes</p>
                  <p className="text-sm text-muted-foreground">Notify when maturity assessment changes</p>
                </div>
                <Switch 
                  checked={preferences.maturityChanges}
                  onCheckedChange={(v) => updatePreference('maturityChanges', v)}
                  disabled={!preferences.emailEnabled}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                <div>
                  <p className="font-medium">Security Incidents</p>
                  <p className="text-sm text-muted-foreground">Critical alerts for security events</p>
                </div>
                <Switch 
                  checked={preferences.securityIncidents}
                  onCheckedChange={(v) => updatePreference('securityIncidents', v)}
                  disabled={!preferences.emailEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 animate-fade-in">
          {/* Scheduled Reports */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Scheduled Reports</CardTitle>
                  <CardDescription>Receive automated executive reports via email</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                <div>
                  <p className="font-medium">Enable Scheduled Reports</p>
                  <p className="text-sm text-muted-foreground">Automatically send compliance & risk reports</p>
                </div>
                <Switch 
                  checked={preferences.scheduledReports}
                  onCheckedChange={(v) => updatePreference('scheduledReports', v)}
                  disabled={!preferences.emailEnabled}
                />
              </div>

              {preferences.scheduledReports && preferences.emailEnabled && (
                <div className="space-y-3">
                  <Label>Report Frequency</Label>
                  <Select
                    value={preferences.reportFrequency}
                    onValueChange={(v: 'daily' | 'weekly' | 'monthly') => updatePreference('reportFrequency', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Reports will be sent every {preferences.reportFrequency === 'daily' ? 'day at 8 AM' : preferences.reportFrequency === 'weekly' ? 'Monday at 8 AM' : 'first of the month at 8 AM'}
                  </p>
                </div>
              )}

              {preferences.scheduledReports && preferences.emailEnabled && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h4 className="font-medium mb-2">Report Contents</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Overall compliance score and trends</li>
                    <li>• Control pass/fail summary</li>
                    <li>• Risk exposure metrics</li>
                    <li>• Maturity level assessment</li>
                    <li>• Top recommendations</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="gap-2">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </AppLayout>
  );
}
