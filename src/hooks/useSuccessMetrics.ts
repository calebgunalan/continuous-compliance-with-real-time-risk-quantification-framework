import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SuccessMetric {
  id: string;
  category: string;
  metric_name: string;
  description: string | null;
  target_value: number | null;
  current_value: number;
  unit: string | null;
  measurement_method: string | null;
  status: string;
  last_measured_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMetricInput {
  category: string;
  metric_name: string;
  description?: string;
  target_value?: number;
  unit?: string;
  measurement_method?: string;
}

export interface UpdateMetricInput {
  id: string;
  current_value?: number;
  status?: string;
  notes?: string;
}

export function useSuccessMetrics() {
  const queryClient = useQueryClient();

  const { data: metrics = [], isLoading, error } = useQuery({
    queryKey: ["success-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("success_metrics")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      return data as SuccessMetric[];
    },
  });

  const createMetric = useMutation({
    mutationFn: async (input: CreateMetricInput) => {
      const { data, error } = await supabase
        .from("success_metrics")
        .insert({
          category: input.category,
          metric_name: input.metric_name,
          description: input.description || null,
          target_value: input.target_value || null,
          unit: input.unit || null,
          measurement_method: input.measurement_method || null,
          status: "pending",
          current_value: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["success-metrics"] });
      toast.success("Metric added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add metric: ${error.message}`);
    },
  });

  const updateMetric = useMutation({
    mutationFn: async (input: UpdateMetricInput) => {
      const updates: Record<string, unknown> = {
        last_measured_at: new Date().toISOString(),
      };
      if (input.current_value !== undefined) updates.current_value = input.current_value;
      if (input.status) updates.status = input.status;
      if (input.notes) updates.notes = input.notes;

      const { data, error } = await supabase
        .from("success_metrics")
        .update(updates)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["success-metrics"] });
      toast.success("Metric updated");
    },
    onError: (error) => {
      toast.error(`Failed to update metric: ${error.message}`);
    },
  });

  const stats = {
    total: metrics.length,
    pending: metrics.filter((m) => m.status === "pending").length,
    onTrack: metrics.filter((m) => m.status === "on_track").length,
    achieved: metrics.filter((m) => m.status === "achieved").length,
    atRisk: metrics.filter((m) => m.status === "at_risk").length,
    behind: metrics.filter((m) => m.status === "behind").length,
    overallProgress: metrics.length > 0 
      ? metrics.reduce((sum, m) => {
          if (!m.target_value) return sum;
          const progress = Math.min((m.current_value / m.target_value) * 100, 100);
          return sum + progress;
        }, 0) / metrics.filter(m => m.target_value).length
      : 0,
  };

  const groupedByCategory = metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, SuccessMetric[]>);

  return {
    metrics,
    groupedByCategory,
    isLoading,
    error,
    stats,
    createMetric,
    updateMetric,
  };
}
