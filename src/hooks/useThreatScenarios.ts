import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ThreatScenario, RiskLevel } from '@/types/database';

export const useThreatScenarios = (organizationId: string) => {
  return useQuery({
    queryKey: ['threat_scenarios', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('threat_scenarios')
        .select('*')
        .eq('organization_id', organizationId)
        .order('annual_loss_exposure', { ascending: false });

      if (error) throw error;
      return data as ThreatScenario[];
    },
    enabled: !!organizationId,
  });
};

interface CreateThreatScenarioInput {
  organization_id: string;
  name: string;
  description?: string;
  threat_type: string;
  asset_at_risk: string;
  threat_event_frequency: number;
  vulnerability_factor: number;
  primary_loss_magnitude: number;
  secondary_loss_magnitude?: number;
  risk_level: RiskLevel;
  mitigating_control_ids?: string[];
}

export const useCreateThreatScenario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateThreatScenarioInput) => {
      const { data, error } = await supabase
        .from('threat_scenarios')
        .insert({
          organization_id: input.organization_id,
          name: input.name,
          description: input.description || null,
          threat_type: input.threat_type,
          asset_at_risk: input.asset_at_risk,
          threat_event_frequency: input.threat_event_frequency,
          vulnerability_factor: input.vulnerability_factor,
          primary_loss_magnitude: input.primary_loss_magnitude,
          secondary_loss_magnitude: input.secondary_loss_magnitude || 0,
          risk_level: input.risk_level,
          mitigating_control_ids: input.mitigating_control_ids || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data as ThreatScenario;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['threat_scenarios', data.organization_id] });
    },
  });
};

export const useUpdateThreatScenario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ThreatScenario> & { id: string }) => {
      const { data, error } = await supabase
        .from('threat_scenarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ThreatScenario;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['threat_scenarios', data.organization_id] });
    },
  });
};

export const useDeleteThreatScenario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
      const { error } = await supabase
        .from('threat_scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, organizationId };
    },
    onSuccess: ({ organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ['threat_scenarios', organizationId] });
    },
  });
};

// Calculate total annual loss exposure
export const useTotalRiskExposure = (organizationId: string) => {
  return useQuery({
    queryKey: ['total_risk_exposure', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('threat_scenarios')
        .select('annual_loss_exposure')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const total = data.reduce((sum, scenario) => sum + (scenario.annual_loss_exposure || 0), 0);
      return total;
    },
    enabled: !!organizationId,
  });
};
