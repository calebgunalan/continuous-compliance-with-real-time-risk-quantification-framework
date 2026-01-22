import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FundingApplication {
  id: string;
  organization_id: string | null;
  funding_source: string;
  program_name: string;
  proposal_title: string;
  requested_amount: number;
  awarded_amount: number | null;
  status: string;
  submission_deadline: string | null;
  submitted_at: string | null;
  decision_date: string | null;
  decision_notes: string | null;
  proposal_document_url: string | null;
  principal_investigator: string | null;
  co_investigators: unknown[];
  budget_breakdown: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateFundingInput {
  funding_source: string;
  program_name: string;
  proposal_title: string;
  requested_amount: number;
  submission_deadline?: string;
  principal_investigator?: string;
  budget_breakdown?: Record<string, unknown>;
}

export interface UpdateFundingInput {
  id: string;
  status?: string;
  awarded_amount?: number;
  submitted_at?: string;
  decision_date?: string;
  decision_notes?: string;
}

export function useFundingApplications() {
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ["funding-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funding_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FundingApplication[];
    },
  });

  const createApplication = useMutation({
    mutationFn: async (input: CreateFundingInput) => {
      const { data, error } = await supabase
        .from("funding_applications")
        .insert({
          funding_source: input.funding_source,
          program_name: input.program_name,
          proposal_title: input.proposal_title,
          requested_amount: input.requested_amount,
          submission_deadline: input.submission_deadline || null,
          principal_investigator: input.principal_investigator || null,
          budget_breakdown: (input.budget_breakdown || {}) as unknown as Record<string, never>,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funding-applications"] });
      toast.success("Funding application created");
    },
    onError: (error) => {
      toast.error(`Failed to create application: ${error.message}`);
    },
  });

  const updateApplication = useMutation({
    mutationFn: async (input: UpdateFundingInput) => {
      const updates: Record<string, unknown> = {};
      if (input.status) updates.status = input.status;
      if (input.awarded_amount !== undefined) updates.awarded_amount = input.awarded_amount;
      if (input.submitted_at) updates.submitted_at = input.submitted_at;
      if (input.decision_date) updates.decision_date = input.decision_date;
      if (input.decision_notes) updates.decision_notes = input.decision_notes;

      const { data, error } = await supabase
        .from("funding_applications")
        .update(updates)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funding-applications"] });
      toast.success("Application updated");
    },
    onError: (error) => {
      toast.error(`Failed to update application: ${error.message}`);
    },
  });

  const stats = {
    total: applications.length,
    draft: applications.filter((a) => a.status === "draft").length,
    submitted: applications.filter((a) => a.status === "submitted").length,
    awarded: applications.filter((a) => a.status === "awarded").length,
    declined: applications.filter((a) => a.status === "declined").length,
    totalRequested: applications.reduce((sum, a) => sum + a.requested_amount, 0),
    totalAwarded: applications
      .filter((a) => a.status === "awarded")
      .reduce((sum, a) => sum + (a.awarded_amount || 0), 0),
  };

  return {
    applications,
    isLoading,
    error,
    stats,
    createApplication,
    updateApplication,
  };
}
