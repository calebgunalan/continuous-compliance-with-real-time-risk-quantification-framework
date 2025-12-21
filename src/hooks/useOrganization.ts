import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Organization, MaturityLevel, OrganizationSize } from '@/types/database';

// For demo purposes, we'll use a mock organization ID
// In production, this would come from auth context
const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

export const useOrganization = (organizationId?: string) => {
  const orgId = organizationId || DEMO_ORG_ID;

  return useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (error) throw error;
      return data as Organization;
    },
  });
};

export const useOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Organization[];
    },
  });
};

interface CreateOrganizationInput {
  name: string;
  industry: string;
  size: OrganizationSize;
  current_maturity_level?: MaturityLevel;
  baseline_risk_exposure?: number;
}

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrganizationInput) => {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: input.name,
          industry: input.industry,
          size: input.size,
          current_maturity_level: input.current_maturity_level || 'level_1',
          baseline_risk_exposure: input.baseline_risk_exposure || 0,
          current_risk_exposure: input.baseline_risk_exposure || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Organization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Organization> & { id: string }) => {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Organization;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organization', data.id] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};
