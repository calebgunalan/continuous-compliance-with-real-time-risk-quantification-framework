import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Bell, AlertTriangle, Shield, TrendingUp, FileText, Wrench, Loader2 } from "lucide-react";

const sampleNotifications = [
  {
    type: 'control_failure',
    title: 'MFA Control Test Failed',
    message: 'The multi-factor authentication control for privileged accounts has failed its automated test. 3 admin accounts are missing MFA enrollment.',
    severity: 'error',
    metadata: { control_id: 'AC-7', framework: 'NIST CSF' }
  },
  {
    type: 'control_failure',
    title: 'Firewall Rule Violation Detected',
    message: 'Unauthorized inbound rule detected on production firewall allowing SSH access from any IP address.',
    severity: 'error',
    metadata: { control_id: 'SC-7', framework: 'NIST CSF' }
  },
  {
    type: 'control_warning',
    title: 'Access Review Overdue',
    message: 'Quarterly access review for finance department is 15 days overdue. Please complete the review to maintain compliance.',
    severity: 'warning',
    metadata: { control_id: 'AC-2', framework: 'ISO 27001' }
  },
  {
    type: 'risk_alert',
    title: 'Risk Exposure Threshold Exceeded',
    message: 'Your annual risk exposure has increased to $425M, exceeding the configured threshold of $400M. This represents a 12% increase from last month.',
    severity: 'error',
    metadata: { current_risk: 425000000, threshold: 400000000 }
  },
  {
    type: 'risk_alert',
    title: 'High-Risk Threat Scenario Activated',
    message: 'SQL Injection vulnerability in customer portal has increased loss event frequency. Immediate patching recommended.',
    severity: 'warning',
    metadata: { scenario: 'SQL Injection Data Breach', risk_increase: '35%' }
  },
  {
    type: 'maturity_change',
    title: 'Maturity Level Improved',
    message: 'Congratulations! Your organization has reached Maturity Level 3 (Defined) based on recent control improvements.',
    severity: 'success',
    metadata: { previous_level: 2, new_level: 3 }
  },
  {
    type: 'report_ready',
    title: 'Weekly Compliance Report Ready',
    message: 'Your scheduled weekly compliance report has been generated and is ready for download.',
    severity: 'info',
    metadata: { report_type: 'weekly_compliance' }
  },
  {
    type: 'remediation_update',
    title: 'Remediation Task Resolved',
    message: 'The remediation task "Enable encryption at rest for S3 buckets" has been marked as resolved by John Smith.',
    severity: 'success',
    metadata: { task_id: 'REM-001', resolver: 'John Smith' }
  },
  {
    type: 'security_incident',
    title: 'Potential Security Incident Detected',
    message: 'Unusual login pattern detected: 47 failed login attempts from IP 192.168.1.100 in the last 10 minutes.',
    severity: 'error',
    metadata: { ip_address: '192.168.1.100', attempt_count: 47 }
  },
];

export function SampleNotificationsGenerator() {
  const { organizationId } = useOrganizationContext();
  const queryClient = useQueryClient();
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  const createNotification = useMutation({
    mutationFn: async (notification: typeof sampleNotifications[0]) => {
      const { error } = await supabase
        .from('notifications')
        .insert({
          organization_id: organizationId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          severity: notification.severity,
          metadata: notification.metadata,
          is_read: false,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Notification created",
        description: "Sample notification has been added to the notification center.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createAllNotifications = useMutation({
    mutationFn: async () => {
      const notifications = sampleNotifications.map(n => ({
        organization_id: organizationId,
        type: n.type,
        title: n.title,
        message: n.message,
        severity: n.severity,
        metadata: n.metadata,
        is_read: false,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "All notifications created",
        description: `${sampleNotifications.length} sample notifications have been added.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      control_failure: <Shield className="h-4 w-4" />,
      control_warning: <AlertTriangle className="h-4 w-4" />,
      risk_alert: <TrendingUp className="h-4 w-4" />,
      maturity_change: <TrendingUp className="h-4 w-4" />,
      report_ready: <FileText className="h-4 w-4" />,
      remediation_update: <Wrench className="h-4 w-4" />,
      security_incident: <AlertTriangle className="h-4 w-4" />,
    };
    return icons[type] || <Bell className="h-4 w-4" />;
  };

  const getSeverityVariant = (severity: string) => {
    const variants: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
      error: "destructive",
      warning: "secondary",
      success: "default",
      info: "outline",
    };
    return variants[severity] || "outline";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Sample Notifications Generator
            </CardTitle>
            <CardDescription>
              Generate sample notifications to test the notification center
            </CardDescription>
          </div>
          <Button
            onClick={() => createAllNotifications.mutate()}
            disabled={createAllNotifications.isPending || !organizationId}
          >
            {createAllNotifications.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Generate All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sampleNotifications.map((notification, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  {getIcon(notification.type)}
                </div>
                <div>
                  <p className="text-sm font-medium">{notification.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getSeverityVariant(notification.severity)} className="text-xs">
                      {notification.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{notification.type}</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setGeneratingIndex(index);
                  createNotification.mutate(notification, {
                    onSettled: () => setGeneratingIndex(null),
                  });
                }}
                disabled={createNotification.isPending || !organizationId}
              >
                {generatingIndex === index ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}