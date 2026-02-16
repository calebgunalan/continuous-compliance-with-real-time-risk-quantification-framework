import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { controls } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!controls || !Array.isArray(controls) || controls.length === 0) {
      return new Response(
        JSON.stringify({ anomalies: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a cybersecurity compliance anomaly detection engine. Analyze the following compliance control test data and identify any anomalous patterns that may indicate:

1. False compliance (controls that always pass suspiciously)
2. Coordinated failures across unrelated controls (systemic issues)
3. Evidence of compliance gaming (patterns suggesting manual intervention)
4. Persistent neglected failures

For each anomaly found, classify its severity as critical, high, medium, or low.`;

    const controlSummary = controls.map((c: any) => 
      `- ${c.name}: status=${c.status}, passRate=${c.passRate}%, category=${c.category}, lastChecked=${c.lastChecked}`
    ).join("\n");

    const userPrompt = `Analyze these ${controls.length} compliance controls for anomalies:\n\n${controlSummary}\n\nReturn anomalies found.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_anomalies",
              description: "Report detected compliance anomalies",
              parameters: {
                type: "object",
                properties: {
                  anomalies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        controlName: { type: "string" },
                        type: { type: "string", description: "Type of anomaly detected" },
                        severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                        description: { type: "string" },
                        recommendation: { type: "string" },
                      },
                      required: ["controlName", "type", "severity", "description", "recommendation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["anomalies"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_anomalies" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    let anomalies = [];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      anomalies = (parsed.anomalies || []).map((a: any, i: number) => ({
        id: `ai-${i}`,
        ...a,
      }));
    }

    return new Response(
      JSON.stringify({ anomalies }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("detect-anomalies error:", error);
    return new Response(
      JSON.stringify({ error: error.message, anomalies: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
