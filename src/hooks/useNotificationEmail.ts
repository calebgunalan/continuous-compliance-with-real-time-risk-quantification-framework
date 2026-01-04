import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ControlFailureData {
  control_name: string;
  control_id: string;
  framework: string;
  failure_reason?: string;
  remediation?: string;
}

interface RiskAlertData {
  current_risk: number;
  threshold: number;
  change_percent: number;
}

interface ScheduledReportData {
  passing_controls: number;
  failing_controls: number;
  compliance_score: number;
  maturity_level: string;
  risk_exposure: number;
}

type NotificationType = "control_failure" | "risk_alert" | "scheduled_report";

interface SendNotificationParams {
  type: NotificationType;
  organization_id: string;
  recipients: string[];
  data: ControlFailureData | RiskAlertData | ScheduledReportData;
}

export function useSendNotificationEmail() {
  return useMutation({
    mutationFn: async (params: SendNotificationParams) => {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: params,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Email sent",
        description: "Notification email has been sent successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to send notification email:", error);
      toast({
        title: "Email failed",
        description: "Failed to send notification email. Check console for details.",
        variant: "destructive",
      });
    },
  });
}

// Helper function to send control failure notification
export async function sendControlFailureEmail(
  organizationId: string,
  recipients: string[],
  controlData: ControlFailureData
) {
  const { error } = await supabase.functions.invoke('send-notification', {
    body: {
      type: 'control_failure',
      organization_id: organizationId,
      recipients,
      data: controlData,
    },
  });
  
  if (error) {
    console.error("Failed to send control failure email:", error);
    throw error;
  }
}

// Helper function to send risk alert notification
export async function sendRiskAlertEmail(
  organizationId: string,
  recipients: string[],
  riskData: RiskAlertData
) {
  const { error } = await supabase.functions.invoke('send-notification', {
    body: {
      type: 'risk_alert',
      organization_id: organizationId,
      recipients,
      data: riskData,
    },
  });
  
  if (error) {
    console.error("Failed to send risk alert email:", error);
    throw error;
  }
}