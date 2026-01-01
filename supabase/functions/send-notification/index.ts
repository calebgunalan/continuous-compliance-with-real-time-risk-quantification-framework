import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "control_failure" | "scheduled_report" | "risk_alert";
  organization_id: string;
  recipients: string[];
  data: Record<string, unknown>;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, organization_id, recipients, data }: NotificationRequest = await req.json();
    
    console.log(`Sending ${type} notification to ${recipients.length} recipients for org ${organization_id}`);

    let subject = "";
    let html = "";

    switch (type) {
      case "control_failure":
        subject = `🚨 Control Test Failure Alert - ${data.control_name}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Control Test Failed</h1>
            <p>A compliance control has failed its automated test:</p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; font-weight: bold;">${data.control_name}</p>
              <p style="margin: 8px 0 0; color: #666;">Control ID: ${data.control_id}</p>
              <p style="margin: 8px 0 0; color: #666;">Framework: ${data.framework}</p>
            </div>
            <p><strong>Failure Reason:</strong></p>
            <p style="background: #f3f4f6; padding: 12px; border-radius: 4px;">${data.failure_reason || "No details provided"}</p>
            <p><strong>Remediation Recommendation:</strong></p>
            <p style="background: #ecfdf5; padding: 12px; border-radius: 4px;">${data.remediation || "Review control configuration and evidence sources"}</p>
            <p style="color: #666; font-size: 12px; margin-top: 24px;">
              This is an automated alert from your Continuous Compliance Monitoring system.
            </p>
          </div>
        `;
        break;

      case "scheduled_report":
        subject = `📊 Scheduled Compliance Report - ${new Date().toLocaleDateString()}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Weekly Compliance Report</h1>
            <p>Here's your scheduled compliance status summary:</p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0;">
              <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; text-align: center;">
                <p style="font-size: 32px; font-weight: bold; color: #16a34a; margin: 0;">${data.passing_controls || 0}</p>
                <p style="color: #666; margin: 4px 0 0;">Passing Controls</p>
              </div>
              <div style="background: #fef2f2; padding: 16px; border-radius: 8px; text-align: center;">
                <p style="font-size: 32px; font-weight: bold; color: #dc2626; margin: 0;">${data.failing_controls || 0}</p>
                <p style="color: #666; margin: 4px 0 0;">Failing Controls</p>
              </div>
            </div>
            
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Compliance Score:</strong> ${data.compliance_score || 0}%</p>
              <p style="margin: 8px 0 0;"><strong>Maturity Level:</strong> ${data.maturity_level || "N/A"}</p>
              <p style="margin: 8px 0 0;"><strong>Risk Exposure:</strong> $${Number(data.risk_exposure || 0).toLocaleString()}</p>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 24px;">
              This is an automated report from your Continuous Compliance Monitoring system.
            </p>
          </div>
        `;
        break;

      case "risk_alert":
        subject = `⚠️ Risk Level Alert - Threshold Exceeded`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">Risk Alert</h1>
            <p>Your organization's risk exposure has exceeded the configured threshold:</p>
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Current Risk:</strong> $${Number(data.current_risk || 0).toLocaleString()}</p>
              <p style="margin: 8px 0 0;"><strong>Threshold:</strong> $${Number(data.threshold || 0).toLocaleString()}</p>
              <p style="margin: 8px 0 0;"><strong>Change:</strong> ${data.change_percent || 0}% increase</p>
            </div>
            <p>Please review your compliance controls and risk mitigation strategies.</p>
          </div>
        `;
        break;
    }

    const emailPromises = recipients.map((email) =>
      resend.emails.send({
        from: "Compliance Monitor <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
      })
    );

    const results = await Promise.all(emailPromises);
    console.log(`Successfully sent ${results.length} emails`);

    return new Response(JSON.stringify({ success: true, sent: results.length }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending notification:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
