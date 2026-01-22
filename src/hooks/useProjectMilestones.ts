import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProjectMilestone {
  id: string;
  phase_name: string;
  milestone_name: string;
  description: string | null;
  target_date: string;
  actual_date: string | null;
  status: string;
  progress_percentage: number;
  dependencies: unknown[];
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMilestoneInput {
  phase_name: string;
  milestone_name: string;
  description?: string;
  target_date: string;
  assigned_to?: string;
  dependencies?: string[];
}

export interface UpdateMilestoneInput {
  id: string;
  status?: string;
  progress_percentage?: number;
  actual_date?: string;
  notes?: string;
}

export function useProjectMilestones() {
  const queryClient = useQueryClient();

  const { data: milestones = [], isLoading, error } = useQuery({
    queryKey: ["project-milestones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_milestones")
        .select("*")
        .order("target_date", { ascending: true });

      if (error) throw error;
      return data as ProjectMilestone[];
    },
  });

  const createMilestone = useMutation({
    mutationFn: async (input: CreateMilestoneInput) => {
      const { data, error } = await supabase
        .from("project_milestones")
        .insert({
          phase_name: input.phase_name,
          milestone_name: input.milestone_name,
          description: input.description || null,
          target_date: input.target_date,
          assigned_to: input.assigned_to || null,
          dependencies: input.dependencies || [],
          status: "pending",
          progress_percentage: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-milestones"] });
      toast.success("Milestone added");
    },
    onError: (error) => {
      toast.error(`Failed to add milestone: ${error.message}`);
    },
  });

  const updateMilestone = useMutation({
    mutationFn: async (input: UpdateMilestoneInput) => {
      const updates: Record<string, unknown> = {};
      if (input.status) updates.status = input.status;
      if (input.progress_percentage !== undefined) updates.progress_percentage = input.progress_percentage;
      if (input.actual_date) updates.actual_date = input.actual_date;
      if (input.notes) updates.notes = input.notes;

      const { data, error } = await supabase
        .from("project_milestones")
        .update(updates)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-milestones"] });
      toast.success("Milestone updated");
    },
    onError: (error) => {
      toast.error(`Failed to update milestone: ${error.message}`);
    },
  });

  const groupedByPhase = milestones.reduce((acc, milestone) => {
    if (!acc[milestone.phase_name]) {
      acc[milestone.phase_name] = [];
    }
    acc[milestone.phase_name].push(milestone);
    return acc;
  }, {} as Record<string, ProjectMilestone[]>);

  const phaseProgress = Object.entries(groupedByPhase).map(([phase, phaseMilestones]) => ({
    phase,
    totalMilestones: phaseMilestones.length,
    completedMilestones: phaseMilestones.filter((m) => m.status === "completed").length,
    averageProgress: phaseMilestones.reduce((sum, m) => sum + m.progress_percentage, 0) / phaseMilestones.length,
  }));

  const stats = {
    total: milestones.length,
    pending: milestones.filter((m) => m.status === "pending").length,
    inProgress: milestones.filter((m) => m.status === "in_progress").length,
    completed: milestones.filter((m) => m.status === "completed").length,
    delayed: milestones.filter((m) => m.status === "delayed").length,
    overallProgress: milestones.length > 0
      ? milestones.reduce((sum, m) => sum + m.progress_percentage, 0) / milestones.length
      : 0,
    phaseProgress,
  };

  return {
    milestones,
    groupedByPhase,
    isLoading,
    error,
    stats,
    createMilestone,
    updateMilestone,
  };
}
