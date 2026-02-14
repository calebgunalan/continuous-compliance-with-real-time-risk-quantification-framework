import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: Record<string, number> = {};

    // 1. Seed Project Milestones (from PRP Section 5)
    const milestones = [
      { phase_name: "Phase 1: Framework Design", milestone_name: "Architecture documentation complete", target_date: "2026-03-15", description: "Comprehensive system component diagrams and data schemas", assigned_to: "Technical Lead", progress_percentage: 100, status: "completed" },
      { phase_name: "Phase 1: Framework Design", milestone_name: "Risk scenario library defined", target_date: "2026-03-30", description: "15-20 threat scenarios with FAIR analysis templates", assigned_to: "Research Analyst", progress_percentage: 100, status: "completed" },
      { phase_name: "Phase 1: Framework Design", milestone_name: "Maturity assessment methodology", target_date: "2026-03-30", description: "Objective maturity level calculation methodology", assigned_to: "Principal Investigator", progress_percentage: 100, status: "completed" },
      { phase_name: "Phase 2: System Implementation", milestone_name: "Evidence collectors built", target_date: "2026-05-15", description: "AWS, Azure, GCP, Okta, AD connectors", assigned_to: "Systems Engineer", progress_percentage: 85, status: "in_progress" },
      { phase_name: "Phase 2: System Implementation", milestone_name: "Control testing engine", target_date: "2026-05-30", description: "Rule execution environment with continuous testing", assigned_to: "Systems Engineer", progress_percentage: 75, status: "in_progress" },
      { phase_name: "Phase 2: System Implementation", milestone_name: "Risk quantification calculator", target_date: "2026-06-15", description: "FAIR engine with Monte Carlo simulation", assigned_to: "Systems Engineer", progress_percentage: 80, status: "in_progress" },
      { phase_name: "Phase 2: System Implementation", milestone_name: "Dashboard interfaces", target_date: "2026-06-30", description: "Compliance, risk, and decision support dashboards", assigned_to: "Systems Engineer", progress_percentage: 90, status: "in_progress" },
      { phase_name: "Phase 3: Recruitment", milestone_name: "Recruit 50 organizations", target_date: "2026-07-31", description: "Target 50-80 orgs across financial, healthcare, tech, manufacturing", assigned_to: "Industry Liaison", progress_percentage: 30, status: "in_progress" },
      { phase_name: "Phase 3: Recruitment", milestone_name: "Deploy to first 20 participants", target_date: "2026-07-15", description: "Initial deployment with baseline measurements", assigned_to: "Systems Engineer", progress_percentage: 15, status: "pending" },
      { phase_name: "Phase 4: Data Collection", milestone_name: "6-month data checkpoint", target_date: "2026-11-30", description: "Mid-study data quality review and preliminary analysis", assigned_to: "Research Analyst", progress_percentage: 0, status: "pending" },
      { phase_name: "Phase 4: Data Collection", milestone_name: "12-month data collection complete", target_date: "2027-05-31", description: "Full 12-month longitudinal dataset from all participants", assigned_to: "Research Analyst", progress_percentage: 0, status: "pending" },
      { phase_name: "Phase 5: Analysis & Publication", milestone_name: "Statistical analysis complete", target_date: "2027-06-30", description: "Hypothesis testing, model validation, sensitivity analysis", assigned_to: "Research Analyst", progress_percentage: 0, status: "pending" },
      { phase_name: "Phase 5: Analysis & Publication", milestone_name: "Manuscript submitted", target_date: "2027-08-31", description: "Submit to IEEE TDSC or ACM TISSEC", assigned_to: "Principal Investigator", progress_percentage: 0, status: "pending" },
    ];

    const { data: mData, error: mErr } = await supabase.from("project_milestones").upsert(milestones, { onConflict: "milestone_name" }).select();
    if (mErr) console.error("Milestones error:", mErr);
    results.milestones = mData?.length || 0;

    // 2. Seed Budget Items (from PRP Section 6)
    const budgetItems = [
      { category: "Personnel", item_name: "Principal Investigator", description: "Full-time equivalent, 18 months", budgeted_amount: 150000, spent_amount: 45000, funding_source: "NSF", fiscal_year: "2026" },
      { category: "Personnel", item_name: "Systems Engineer", description: "Full-time, 15 months", budgeted_amount: 125000, spent_amount: 35000, funding_source: "NSF", fiscal_year: "2026" },
      { category: "Personnel", item_name: "Research Analyst", description: "Half-time, 18 months", budgeted_amount: 45000, spent_amount: 12000, funding_source: "NSF", fiscal_year: "2026" },
      { category: "Personnel", item_name: "Industry Liaison", description: "Half-time, 12 months", budgeted_amount: 30000, spent_amount: 8000, funding_source: "DHS", fiscal_year: "2026" },
      { category: "Infrastructure", item_name: "Cloud hosting (AWS/GCP)", description: "Database, compute, networking for 12 months", budgeted_amount: 24000, spent_amount: 6000, funding_source: "NSF", fiscal_year: "2026", is_recurring: true },
      { category: "Infrastructure", item_name: "Software licenses", description: "IDE, statistical tools, collaboration", budgeted_amount: 8000, spent_amount: 3000, funding_source: "Internal", fiscal_year: "2026", is_recurring: true },
      { category: "Infrastructure", item_name: "API & data services", description: "Threat intelligence feeds, benchmarks", budgeted_amount: 5000, spent_amount: 1500, funding_source: "Industry", fiscal_year: "2026" },
      { category: "Participant Incentives", item_name: "Standard participant stipends", description: "$200-500 per org, 50-80 orgs", budgeted_amount: 30000, spent_amount: 0, funding_source: "NSF", fiscal_year: "2026" },
      { category: "Participant Incentives", item_name: "Case study compensation", description: "$1,000-2,000 for 3-5 deep-dive orgs", budgeted_amount: 10000, spent_amount: 0, funding_source: "NSF", fiscal_year: "2026" },
      { category: "Publication & Dissemination", item_name: "Open access fees", description: "Journal publication fees", budgeted_amount: 5000, spent_amount: 0, funding_source: "Internal", fiscal_year: "2026" },
      { category: "Publication & Dissemination", item_name: "Conference attendance", description: "IEEE S&P, ACM CCS, RSA (2-3 events)", budgeted_amount: 8000, spent_amount: 1200, funding_source: "Internal", fiscal_year: "2026" },
    ];

    const { data: bData, error: bErr } = await supabase.from("budget_items").upsert(budgetItems, { onConflict: "item_name" }).select();
    if (bErr) console.error("Budget error:", bErr);
    results.budget_items = bData?.length || 0;

    // 3. Seed Project Risks (from PRP Section 7)
    const risks = [
      { risk_category: "Technical", risk_name: "Evidence collection API limitations", description: "API rate limiting, authentication complexities, or outages at participating orgs may prevent complete evidence collection", likelihood: 4, impact: 4, mitigation_strategy: "Conduct technical feasibility assessments with pilot orgs; build graceful degradation; prioritize common platforms", contingency_plan: "Fall back to partial evidence collection with clear status indicators", owner: "Systems Engineer", status: "monitoring" },
      { risk_category: "Technical", risk_name: "System performance degradation", description: "Realistic data volumes from 50-80 orgs may cause performance issues not seen in testing", likelihood: 3, impact: 4, mitigation_strategy: "Proactive load testing, monitoring alerts, caching strategies, async processing", contingency_plan: "Scale cloud infrastructure; implement data partitioning", owner: "Systems Engineer", status: "monitoring" },
      { risk_category: "Technical", risk_name: "Risk calculation errors", description: "FAIR implementation bugs could produce incorrect risk estimates, invalidating research", likelihood: 2, impact: 5, mitigation_strategy: "Unit tests, integration tests, peer review by FAIR experts, comparison against commercial tools", contingency_plan: "Engage external FAIR consultant for audit", owner: "Systems Engineer", status: "open" },
      { risk_category: "Recruitment", risk_name: "Insufficient participant recruitment", description: "Unable to recruit 50-80 organizations due to data sharing concerns or skepticism", likelihood: 3, impact: 5, mitigation_strategy: "Leverage personal networks; tiered participation model; compelling value proposition", contingency_plan: "Reduce minimum sample to 40; extend recruitment period", owner: "Industry Liaison", status: "open" },
      { risk_category: "Recruitment", risk_name: "High participant dropout", description: "Organizations withdraw due to leadership changes, competing priorities, or perceived burden", likelihood: 3, impact: 4, mitigation_strategy: "Ongoing engagement, rapid issue resolution, celebrate milestones, flexible participation tiers", contingency_plan: "Over-recruit by 20%; reduce participation burden for struggling orgs", owner: "Industry Liaison", status: "open" },
      { risk_category: "Validity", risk_name: "Selection bias in sample", description: "Volunteering orgs may differ systematically from general population, limiting generalizability", likelihood: 4, impact: 3, mitigation_strategy: "Recruit across diverse org types and maturity levels; transparent reporting of sample characteristics", contingency_plan: "Acknowledge limitations clearly in publication; propose follow-up studies", owner: "Principal Investigator", status: "monitoring" },
      { risk_category: "Validity", risk_name: "Confounding variables", description: "External factors (threat landscape changes, economic shifts) may influence results beyond maturity levels", likelihood: 4, impact: 3, mitigation_strategy: "Use industry sector as control variable; track external events; statistical controls for size and complexity", contingency_plan: "Multi-variate regression to isolate maturity effect", owner: "Research Analyst", status: "open" },
      { risk_category: "Validity", risk_name: "Measurement validity concerns", description: "Maturity assessments or risk calculations may contain systematic errors", likelihood: 3, impact: 4, mitigation_strategy: "Triangulation with multiple methods; validate against third-party audit results; expert review", contingency_plan: "Engage compliance professionals for independent validation", owner: "Research Analyst", status: "open" },
      { risk_category: "Timeline", risk_name: "Timeline overrun", description: "Technical challenges, slow recruitment, or complex analysis may extend beyond 16 months", likelihood: 3, impact: 3, mitigation_strategy: "Buffer time in schedule; parallel workstreams; regular progress monitoring", contingency_plan: "Prioritize core research questions; defer optional analyses", owner: "Principal Investigator", status: "open" },
      { risk_category: "Timeline", risk_name: "Scope creep", description: "Interesting additional questions or features expand beyond initial boundaries", likelihood: 4, impact: 3, mitigation_strategy: "Disciplined prioritization; clear essential vs optional distinction; regular scope reviews", contingency_plan: "Defer to future work; document ideas for follow-on studies", owner: "Principal Investigator", status: "monitoring" },
    ];

    const { data: rData, error: rErr } = await supabase.from("project_risks").upsert(risks, { onConflict: "risk_name" }).select();
    if (rErr) console.error("Risks error:", rErr);
    results.project_risks = rData?.length || 0;

    // 4. Seed Success Metrics (from PRP Section 10)
    const metrics = [
      { category: "Research", metric_name: "Journal publication", description: "Top-tier venue acceptance (IEEE TDSC or ACM TISSEC)", target_value: 1, current_value: 0, unit: "publications", measurement_method: "Acceptance notification", status: "pending" },
      { category: "Research", metric_name: "Correlation coefficient", description: "Pearson r ≥ 0.6 for maturity-breach relationship", target_value: 0.6, current_value: 0, unit: "r-value", measurement_method: "Statistical analysis", status: "pending" },
      { category: "Research", metric_name: "Model validation accuracy", description: "Predicted within 20% of observed breach rates", target_value: 80, current_value: 0, unit: "percent", measurement_method: "Model comparison", status: "pending" },
      { category: "Research", metric_name: "Detection time significance", description: "Statistically significant MTTD improvement (p < 0.01)", target_value: 0.01, current_value: 0, unit: "p-value", measurement_method: "Paired t-test", status: "pending" },
      { category: "Research", metric_name: "Dataset shared", description: "Anonymized 12-month dataset from 40+ organizations", target_value: 40, current_value: 0, unit: "organizations", measurement_method: "Data export count", status: "pending" },
      { category: "Technical", metric_name: "System uptime", description: "System reliability > 99%", target_value: 99, current_value: 99.2, unit: "percent", measurement_method: "Monitoring dashboard", status: "on_track" },
      { category: "Technical", metric_name: "Evidence platform coverage", description: "Evidence collection across 5+ platform types", target_value: 5, current_value: 3, unit: "platforms", measurement_method: "Connector count", status: "on_track" },
      { category: "Technical", metric_name: "Control test execution time", description: "Full suite < 60 minutes", target_value: 60, current_value: 45, unit: "minutes", measurement_method: "Test runner metrics", status: "on_track" },
      { category: "Technical", metric_name: "Risk calculation latency", description: "Updated hourly with < 2 min latency", target_value: 2, current_value: 1.5, unit: "minutes", measurement_method: "Performance monitoring", status: "on_track" },
      { category: "Practical", metric_name: "Organizations completing study", description: "50+ orgs complete full 12-month participation", target_value: 50, current_value: 0, unit: "organizations", measurement_method: "Enrollment tracker", status: "pending" },
      { category: "Practical", metric_name: "Post-study adoption", description: "10+ organizations adopt framework after study", target_value: 10, current_value: 0, unit: "organizations", measurement_method: "Follow-up survey", status: "pending" },
      { category: "Practical", metric_name: "Audit prep time reduction", description: "Demonstrated 50%+ reduction in audit prep", target_value: 50, current_value: 0, unit: "percent", measurement_method: "Participant surveys", status: "pending" },
      { category: "Practical", metric_name: "Executive satisfaction", description: "Positive feedback from 80%+ of executives", target_value: 80, current_value: 0, unit: "percent", measurement_method: "Satisfaction surveys", status: "pending" },
      { category: "Academic", metric_name: "Citation count (3-year)", description: "At least 30 citations within 3 years", target_value: 30, current_value: 0, unit: "citations", measurement_method: "Google Scholar", status: "pending" },
      { category: "Academic", metric_name: "Follow-on research", description: "3+ independent teams publish extensions", target_value: 3, current_value: 0, unit: "teams", measurement_method: "Literature review", status: "pending" },
      { category: "Academic", metric_name: "Educational adoption", description: "5+ universities use materials in courses", target_value: 5, current_value: 0, unit: "universities", measurement_method: "Usage tracking", status: "pending" },
    ];

    const { data: sData, error: sErr } = await supabase.from("success_metrics").upsert(metrics, { onConflict: "metric_name" }).select();
    if (sErr) console.error("Metrics error:", sErr);
    results.success_metrics = sData?.length || 0;

    return new Response(JSON.stringify({ success: true, seeded: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
