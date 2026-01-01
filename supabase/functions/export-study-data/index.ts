import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExportRequest {
  data_type: "organizations" | "controls" | "risk_calculations" | "maturity_assessments" | "all";
  format: "csv" | "json";
  anonymize: boolean;
}

function anonymizeValue(value: string, prefix: string, index: number): string {
  return `${prefix}_${index.toString().padStart(4, "0")}`;
}

function convertToCSV(data: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(",");
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col];
      if (value === null || value === undefined) return "";
      if (typeof value === "string" && value.includes(",")) return `"${value}"`;
      return String(value);
    }).join(",")
  );
  return [header, ...rows].join("\n");
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user has researcher role
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "researcher"])
      .single();

    if (!userRole) {
      return new Response(JSON.stringify({ error: "Access denied. Researcher role required." }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data_type, format, anonymize }: ExportRequest = await req.json();
    console.log(`Exporting ${data_type} data in ${format} format, anonymized: ${anonymize}`);

    const exportData: Record<string, unknown[]> = {};
    const orgIdMap = new Map<string, string>();
    let orgIndex = 0;

    // Helper to get anonymized org ID
    const getAnonOrgId = (orgId: string): string => {
      if (!anonymize) return orgId;
      if (!orgIdMap.has(orgId)) {
        orgIdMap.set(orgId, anonymizeValue(orgId, "ORG", orgIndex++));
      }
      return orgIdMap.get(orgId)!;
    };

    // Export organizations
    if (data_type === "organizations" || data_type === "all") {
      const { data: orgs } = await supabase.from("organizations").select("*");
      exportData.organizations = (orgs || []).map((org, idx) => ({
        organization_id: getAnonOrgId(org.id),
        industry: org.industry,
        size: org.size,
        current_maturity_level: org.current_maturity_level,
        baseline_risk_exposure: org.baseline_risk_exposure,
        current_risk_exposure: org.current_risk_exposure,
        created_at: org.created_at,
      }));
    }

    // Export control test results
    if (data_type === "controls" || data_type === "all") {
      const { data: controls } = await supabase
        .from("organization_controls")
        .select(`
          *,
          control:controls(control_id, name, framework, category, severity)
        `);

      exportData.controls = (controls || []).map((c) => ({
        organization_id: getAnonOrgId(c.organization_id),
        control_id: c.control?.control_id,
        framework: c.control?.framework,
        category: c.control?.category,
        severity: c.control?.severity,
        current_status: c.current_status,
        pass_rate: c.pass_rate,
        last_tested_at: c.last_tested_at,
      }));
    }

    // Export risk calculations
    if (data_type === "risk_calculations" || data_type === "all") {
      const { data: risks } = await supabase.from("risk_calculations").select("*");
      exportData.risk_calculations = (risks || []).map((r) => ({
        organization_id: getAnonOrgId(r.organization_id),
        calculated_at: r.calculated_at,
        maturity_level: r.maturity_level,
        compliance_score: r.compliance_score,
        control_pass_rate: r.control_pass_rate,
        total_risk_exposure: r.total_risk_exposure,
        projected_risk_exposure: r.projected_risk_exposure,
      }));
    }

    // Export maturity assessments
    if (data_type === "maturity_assessments" || data_type === "all") {
      const { data: assessments } = await supabase.from("maturity_assessments").select("*");
      exportData.maturity_assessments = (assessments || []).map((a) => ({
        organization_id: getAnonOrgId(a.organization_id),
        assessed_at: a.assessed_at,
        overall_level: a.overall_level,
        domain_scores: JSON.stringify(a.domain_scores),
        projected_risk_reduction: a.projected_risk_reduction,
      }));
    }

    let responseBody: string;
    let contentType: string;
    let filename: string;

    if (format === "csv") {
      // Combine all data types into a single CSV or create multiple
      const csvParts: string[] = [];
      for (const [key, data] of Object.entries(exportData)) {
        if (data.length > 0) {
          const columns = Object.keys(data[0] as Record<string, unknown>);
          csvParts.push(`# ${key.toUpperCase()}`);
          csvParts.push(convertToCSV(data as Record<string, unknown>[], columns));
          csvParts.push("");
        }
      }
      responseBody = csvParts.join("\n");
      contentType = "text/csv";
      filename = `study_export_${data_type}_${new Date().toISOString().split("T")[0]}.csv`;
    } else {
      responseBody = JSON.stringify(exportData, null, 2);
      contentType = "application/json";
      filename = `study_export_${data_type}_${new Date().toISOString().split("T")[0]}.json`;
    }

    console.log(`Export complete: ${Object.values(exportData).flat().length} total records`);

    return new Response(responseBody, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error exporting data:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
