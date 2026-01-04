import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduledTestRequest {
  organization_id?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const { organization_id }: ScheduledTestRequest = body;

    console.log("Running scheduled control tests", organization_id ? `for org ${organization_id}` : "for all orgs");

    // Get all organization controls that need testing
    let query = supabase
      .from("organization_controls")
      .select(`
        *,
        control:controls(*),
        organization:organizations(*)
      `)
      .eq("is_enabled", true);

    if (organization_id) {
      query = query.eq("organization_id", organization_id);
    }

    const { data: orgControls, error: controlsError } = await query;

    if (controlsError) {
      console.error("Error fetching controls:", controlsError);
      throw controlsError;
    }

    console.log(`Found ${orgControls?.length || 0} controls to test`);

    const testResults: Array<{
      organization_control_id: string;
      status: string;
      failure_reason: string | null;
      remediation_recommendation: string | null;
      evidence: Record<string, unknown>;
    }> = [];

    const failedControls: Array<{
      organization_id: string;
      control_name: string;
      control_id: string;
      framework: string;
      failure_reason: string;
    }> = [];

    // Simulate control tests (in production, this would query actual evidence)
    for (const orgControl of orgControls || []) {
      // Simulate test with weighted random outcome based on existing pass rate
      const passRate = orgControl.pass_rate || 75;
      const random = Math.random() * 100;
      const passed = random < passRate;

      const status = passed ? "pass" : random < passRate + 10 ? "warning" : "fail";
      const failureReason = !passed
        ? "Automated test detected non-compliance with control requirements"
        : null;

      testResults.push({
        organization_control_id: orgControl.id,
        status,
        failure_reason: failureReason,
        remediation_recommendation: !passed
          ? "Review control configuration and update evidence sources"
          : null,
        evidence: {
          tested_at: new Date().toISOString(),
          test_type: "scheduled",
          simulated: true,
        },
      });

      if (status === "fail") {
        failedControls.push({
          organization_id: orgControl.organization_id,
          control_name: orgControl.control?.name || "Unknown",
          control_id: orgControl.control?.control_id || "Unknown",
          framework: orgControl.control?.framework || "Unknown",
          failure_reason: failureReason || "Test failed",
        });
      }

      // Update the organization control status
      await supabase
        .from("organization_controls")
        .update({
          current_status: status,
          last_tested_at: new Date().toISOString(),
          pass_rate: passed ? Math.min(100, (passRate + 1)) : Math.max(0, (passRate - 2)),
        })
        .eq("id", orgControl.id);
    }

    // Insert test results
    if (testResults.length > 0) {
      const { error: insertError } = await supabase
        .from("control_test_results")
        .insert(testResults);

      if (insertError) {
        console.error("Error inserting test results:", insertError);
      }
    }

    // Send notifications for failed controls (group by organization)
    const failuresByOrg = failedControls.reduce((acc, failure) => {
      if (!acc[failure.organization_id]) {
        acc[failure.organization_id] = [];
      }
      acc[failure.organization_id].push(failure);
      return acc;
    }, {} as Record<string, typeof failedControls>);

    for (const [orgId, failures] of Object.entries(failuresByOrg)) {
      // Create in-app notifications for each failure
      const notifications = failures.map(failure => ({
        organization_id: orgId,
        type: 'control_failure',
        title: `Control Test Failed: ${failure.control_name}`,
        message: `The control ${failure.control_id} (${failure.framework}) has failed its scheduled test. ${failure.failure_reason}`,
        severity: 'error',
        metadata: {
          control_id: failure.control_id,
          control_name: failure.control_name,
          framework: failure.framework,
          tested_at: new Date().toISOString(),
        },
        is_read: false,
      }));

      if (notifications.length > 0) {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert(notifications);
        
        if (notifError) {
          console.error(`Error creating notifications for org ${orgId}:`, notifError);
        } else {
          console.log(`Created ${notifications.length} notifications for org ${orgId}`);
        }
      }

      // Get organization users to email (fetch user emails from auth)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("organization_id", orgId);

      if (profiles && profiles.length > 0) {
        // Note: In production, fetch actual emails from auth.users
        // For now, log that we would send emails
        console.log(`Would send email to ${profiles.length} users for ${failures.length} control failures in org ${orgId}`);
        
        // Optionally invoke send-notification edge function for each failure
        // This can be enabled when email recipients are configured
        // for (const failure of failures) {
        //   await supabase.functions.invoke('send-notification', {
        //     body: {
        //       type: 'control_failure',
        //       organization_id: orgId,
        //       recipients: userEmails,
        //       data: {
        //         control_name: failure.control_name,
        //         control_id: failure.control_id,
        //         framework: failure.framework,
        //         failure_reason: failure.failure_reason,
        //       }
        //     }
        //   });
        // }
      }
    }

    console.log(`Completed scheduled tests: ${testResults.length} tests, ${failedControls.length} failures`);

    return new Response(
      JSON.stringify({
        success: true,
        tests_run: testResults.length,
        failures: failedControls.length,
        results_by_status: {
          pass: testResults.filter((r) => r.status === "pass").length,
          warning: testResults.filter((r) => r.status === "warning").length,
          fail: testResults.filter((r) => r.status === "fail").length,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error running scheduled tests:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
