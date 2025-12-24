import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EvidenceSource {
  id: string;
  organization_id: string;
  name: string;
  source_type: string;
  connection_config: Record<string, unknown>;
  is_active: boolean;
  last_collection_at: string | null;
  created_at: string;
}

export const useEvidenceSources = (organizationId: string) => {
  return useQuery({
    queryKey: ['evidence_sources', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evidence_sources')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EvidenceSource[];
    },
    enabled: !!organizationId,
  });
};

interface CreateEvidenceSourceInput {
  organization_id: string;
  name: string;
  source_type: string;
  connection_config?: Record<string, unknown>;
}

export const useCreateEvidenceSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEvidenceSourceInput) => {
      const { data, error } = await supabase
        .from('evidence_sources')
        .insert([{
          organization_id: input.organization_id,
          name: input.name,
          source_type: input.source_type,
          connection_config: (input.connection_config || {}) as never,
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as EvidenceSource;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['evidence_sources', data.organization_id] });
    },
  });
};

export const useToggleEvidenceSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active, organization_id }: { id: string; is_active: boolean; organization_id: string }) => {
      const { data, error } = await supabase
        .from('evidence_sources')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, organization_id } as EvidenceSource;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['evidence_sources', data.organization_id] });
    },
  });
};

export const useDeleteEvidenceSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, organization_id }: { id: string; organization_id: string }) => {
      const { error } = await supabase
        .from('evidence_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return organization_id;
    },
    onSuccess: (organization_id) => {
      queryClient.invalidateQueries({ queryKey: ['evidence_sources', organization_id] });
    },
  });
};
