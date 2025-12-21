import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Control, OrganizationControl, ControlTestResult, FrameworkType, ControlStatus } from '@/types/database';

export const useControls = (framework?: FrameworkType) => {
  return useQuery({
    queryKey: ['controls', framework],
    queryFn: async () => {
      let query = supabase
        .from('controls')
        .select('*')
        .order('category', { ascending: true })
        .order('control_id', { ascending: true });

      if (framework) {
        query = query.eq('framework', framework);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Control[];
    },
  });
};

export const useOrganizationControls = (organizationId: string) => {
  return useQuery({
    queryKey: ['organization_controls', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_controls')
        .select(`
          *,
          control:controls(*)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (OrganizationControl & { control: Control })[];
    },
    enabled: !!organizationId,
  });
};

export const useControlTestResults = (organizationControlId: string, limit = 10) => {
  return useQuery({
    queryKey: ['control_test_results', organizationControlId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('control_test_results')
        .select('*')
        .eq('organization_control_id', organizationControlId)
        .order('tested_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ControlTestResult[];
    },
    enabled: !!organizationControlId,
  });
};

interface EnableControlInput {
  organization_id: string;
  control_id: string;
  risk_weight?: number;
}

export const useEnableControl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EnableControlInput) => {
      const { data, error } = await supabase
        .from('organization_controls')
        .insert({
          organization_id: input.organization_id,
          control_id: input.control_id,
          is_enabled: true,
          current_status: 'not_tested',
          pass_rate: 0,
          risk_weight: input.risk_weight || 1.0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as OrganizationControl;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organization_controls', data.organization_id] });
    },
  });
};

interface RecordTestResultInput {
  organization_control_id: string;
  status: ControlStatus;
  evidence?: unknown;
  failure_reason?: string;
  remediation_recommendation?: string;
}

export const useRecordTestResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RecordTestResultInput) => {
      // Insert test result
      const { data: testResult, error: testError } = await supabase
        .from('control_test_results')
        .insert([{
          organization_control_id: input.organization_control_id,
          status: input.status,
          evidence: (input.evidence || null) as never,
          failure_reason: input.failure_reason || null,
          remediation_recommendation: input.remediation_recommendation || null,
        }])
        .select()
        .single();

      if (testError) throw testError;

      // Update organization control status
      const { error: updateError } = await supabase
        .from('organization_controls')
        .update({
          current_status: input.status,
          last_tested_at: new Date().toISOString(),
        })
        .eq('id', input.organization_control_id);

      if (updateError) throw updateError;

      return testResult as ControlTestResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization_controls'] });
      queryClient.invalidateQueries({ queryKey: ['control_test_results'] });
    },
  });
};

// Calculate pass rate for organization controls
export const useControlsPassRate = (organizationId: string) => {
  return useQuery({
    queryKey: ['controls_pass_rate', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_controls')
        .select('current_status')
        .eq('organization_id', organizationId)
        .eq('is_enabled', true);

      if (error) throw error;

      const total = data.length;
      if (total === 0) return 0;

      const passed = data.filter(c => c.current_status === 'pass').length;
      return Math.round((passed / total) * 100);
    },
    enabled: !!organizationId,
  });
};
