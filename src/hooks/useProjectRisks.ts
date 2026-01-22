import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProjectRisk {
  id: string;
  risk_category: string;
  risk_name: string;
  description: string;
  likelihood: number;
  impact: number;
  risk_score: number;
  mitigation_strategy: string | null;
  contingency_plan: string | null;
  status: string;
  owner: string | null;
  review_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRiskInput {
  risk_category: string;
  risk_name: string;
  description: string;
  likelihood: number;
  impact: number;
  mitigation_strategy?: string;
  contingency_plan?: string;
  owner?: string;
}

export interface UpdateRiskInput {
  id: string;
  status?: string;
  likelihood?: number;
  impact?: number;
  mitigation_strategy?: string;
  contingency_plan?: string;
  owner?: string;
  review_date?: string;
}

export function useProjectRisks() {
  const queryClient = useQueryClient();

  const { data: risks = [], isLoading, error } = useQuery({
    queryKey: ["project-risks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_risks")
        .select("*")
        .order("risk_score", { ascending: false });

      if (error) throw error;
      return data as ProjectRisk[];
    },
  });

  const createRisk = useMutation({
    mutationFn: async (input: CreateRiskInput) => {
      const { data, error } = await supabase
        .from("project_risks")
        .insert({
          risk_category: input.risk_category,
          risk_name: input.risk_name,
          description: input.description,
          likelihood: input.likelihood,
          impact: input.impact,
          mitigation_strategy: input.mitigation_strategy || null,
          contingency_plan: input.contingency_plan || null,
          owner: input.owner || null,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-risks"] });
      toast.success("Risk added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add risk: ${error.message}`);
    },
  });

  const updateRisk = useMutation({
    mutationFn: async (input: UpdateRiskInput) => {
      const updates: Record<string, unknown> = {};
      if (input.status) updates.status = input.status;
      if (input.likelihood !== undefined) updates.likelihood = input.likelihood;
      if (input.impact !== undefined) updates.impact = input.impact;
      if (input.mitigation_strategy) updates.mitigation_strategy = input.mitigation_strategy;
      if (input.contingency_plan) updates.contingency_plan = input.contingency_plan;
      if (input.owner) updates.owner = input.owner;
      if (input.review_date) updates.review_date = input.review_date;

      const { data, error } = await supabase
        .from("project_risks")
        .update(updates)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-risks"] });
      toast.success("Risk updated");
    },
    onError: (error) => {
      toast.error(`Failed to update risk: ${error.message}`);
    },
  });

  const stats = {
    total: risks.length,
    open: risks.filter((r) => r.status === "open").length,
    monitoring: risks.filter((r) => r.status === "monitoring").length,
    mitigated: risks.filter((r) => r.status === "mitigated").length,
    closed: risks.filter((r) => r.status === "closed").length,
    highRisk: risks.filter((r) => r.risk_score >= 15).length,
    averageScore: risks.length > 0 ? risks.reduce((sum, r) => sum + r.risk_score, 0) / risks.length : 0,
  };

  return {
    risks,
    isLoading,
    error,
    stats,
    createRisk,
    updateRisk,
  };
}
