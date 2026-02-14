import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeControlTests = (organizationId: string | null) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase
      .channel('control-test-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'control_test_results' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['control_test_results'] });
          queryClient.invalidateQueries({ queryKey: ['organization_controls', organizationId] });
          queryClient.invalidateQueries({ queryKey: ['controls_pass_rate', organizationId] });
          
          if (payload.eventType === 'INSERT') {
            const status = (payload.new as { status: string }).status;
            if (status === 'fail') {
              toast({
                variant: 'destructive',
                title: 'Control Test Failed',
                description: 'A control test has failed. Check the compliance dashboard for details.',
              });
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [organizationId, queryClient, toast]);
};

export const useRealtimeRiskCalculations = (organizationId: string | null) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase
      .channel('risk-calculation-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'risk_calculations' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['risk_calculations', organizationId] });
          queryClient.invalidateQueries({ queryKey: ['latest_risk_calculation', organizationId] });
          toast({ title: 'Risk Calculation Updated', description: 'New risk assessment data is available.' });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [organizationId, queryClient, toast]);
};

export const useRealtimeThreatScenarios = (organizationId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase
      .channel('threat-scenario-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'threat_scenarios' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['threat_scenarios', organizationId] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [organizationId, queryClient]);
};

export const useRealtimeMaturityAssessments = (organizationId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase
      .channel('maturity-assessment-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maturity_assessments' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['maturity_assessments', organizationId] });
          queryClient.invalidateQueries({ queryKey: ['latest_maturity_assessment', organizationId] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [organizationId, queryClient]);
};

// NEW: Realtime subscriptions for research management tables
export const useRealtimeResearchData = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channels = [
      supabase.channel('rt-milestones').on(
        'postgres_changes', { event: '*', schema: 'public', table: 'project_milestones' },
        () => { queryClient.invalidateQueries({ queryKey: ['project-milestones'] }); }
      ).subscribe(),

      supabase.channel('rt-budget').on(
        'postgres_changes', { event: '*', schema: 'public', table: 'budget_items' },
        () => { queryClient.invalidateQueries({ queryKey: ['budget-items'] }); }
      ).subscribe(),

      supabase.channel('rt-risks').on(
        'postgres_changes', { event: '*', schema: 'public', table: 'project_risks' },
        () => { queryClient.invalidateQueries({ queryKey: ['project-risks'] }); }
      ).subscribe(),

      supabase.channel('rt-metrics').on(
        'postgres_changes', { event: '*', schema: 'public', table: 'success_metrics' },
        () => { queryClient.invalidateQueries({ queryKey: ['success-metrics'] }); }
      ).subscribe(),

      supabase.channel('rt-support').on(
        'postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' },
        () => { queryClient.invalidateQueries({ queryKey: ['support-tickets'] }); }
      ).subscribe(),

      supabase.channel('rt-consent').on(
        'postgres_changes', { event: '*', schema: 'public', table: 'consent_records' },
        () => { queryClient.invalidateQueries({ queryKey: ['consent-records'] }); }
      ).subscribe(),

      supabase.channel('rt-funding').on(
        'postgres_changes', { event: '*', schema: 'public', table: 'funding_applications' },
        () => { queryClient.invalidateQueries({ queryKey: ['funding-applications'] }); }
      ).subscribe(),
    ];

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [queryClient]);
};

// Combined hook for all realtime updates
export const useAllRealtimeUpdates = (organizationId: string | null) => {
  useRealtimeControlTests(organizationId);
  useRealtimeRiskCalculations(organizationId);
  useRealtimeThreatScenarios(organizationId);
  useRealtimeMaturityAssessments(organizationId);
};
