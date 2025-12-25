import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OrganizationSummary {
  id: string;
  name: string;
  industry: string;
  size: string;
  current_maturity_level: string;
  current_risk_exposure: number;
  baseline_risk_exposure: number;
  created_at: string;
}

export interface AggregatedStats {
  totalOrganizations: number;
  avgMaturityLevel: number;
  totalRiskExposure: number;
  avgRiskExposure: number;
  avgPassRate: number;
  maturityDistribution: Record<string, number>;
  industryDistribution: Record<string, number>;
  riskTrend: { date: string; risk: number }[];
}

export const useAllOrganizations = () => {
  return useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrganizationSummary[];
    },
  });
};

export const useAggregatedStats = () => {
  return useQuery({
    queryKey: ['admin', 'aggregated_stats'],
    queryFn: async () => {
      // Fetch all organizations
      const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('*');

      if (orgError) throw orgError;

      // Fetch all organization controls for pass rate
      const { data: controls, error: controlError } = await supabase
        .from('organization_controls')
        .select('current_status, organization_id')
        .eq('is_enabled', true);

      if (controlError) throw controlError;

      // Fetch recent risk calculations
      const { data: riskCalcs, error: riskError } = await supabase
        .from('risk_calculations')
        .select('calculated_at, total_risk_exposure')
        .order('calculated_at', { ascending: true })
        .limit(100);

      if (riskError) throw riskError;

      // Calculate maturity level as number
      const maturityToNumber = (level: string): number => {
        const mapping: Record<string, number> = {
          level_1: 1,
          level_2: 2,
          level_3: 3,
          level_4: 4,
          level_5: 5,
        };
        return mapping[level] || 1;
      };

      // Calculate stats
      const totalOrganizations = orgs?.length || 0;
      const avgMaturityLevel = orgs?.length
        ? orgs.reduce((sum, org) => sum + maturityToNumber(org.current_maturity_level), 0) / orgs.length
        : 0;
      const totalRiskExposure = orgs?.reduce((sum, org) => sum + (org.current_risk_exposure || 0), 0) || 0;
      const avgRiskExposure = totalOrganizations > 0 ? totalRiskExposure / totalOrganizations : 0;

      // Calculate pass rate
      const totalControls = controls?.length || 0;
      const passedControls = controls?.filter(c => c.current_status === 'pass').length || 0;
      const avgPassRate = totalControls > 0 ? (passedControls / totalControls) * 100 : 0;

      // Maturity distribution
      const maturityDistribution: Record<string, number> = {
        level_1: 0,
        level_2: 0,
        level_3: 0,
        level_4: 0,
        level_5: 0,
      };
      orgs?.forEach(org => {
        maturityDistribution[org.current_maturity_level] = (maturityDistribution[org.current_maturity_level] || 0) + 1;
      });

      // Industry distribution
      const industryDistribution: Record<string, number> = {};
      orgs?.forEach(org => {
        industryDistribution[org.industry] = (industryDistribution[org.industry] || 0) + 1;
      });

      // Risk trend (aggregate by date)
      const riskByDate: Record<string, number[]> = {};
      riskCalcs?.forEach(calc => {
        const date = calc.calculated_at.split('T')[0];
        if (!riskByDate[date]) riskByDate[date] = [];
        riskByDate[date].push(calc.total_risk_exposure);
      });

      const riskTrend = Object.entries(riskByDate)
        .map(([date, risks]) => ({
          date,
          risk: risks.reduce((a, b) => a + b, 0) / risks.length,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);

      return {
        totalOrganizations,
        avgMaturityLevel,
        totalRiskExposure,
        avgRiskExposure,
        avgPassRate,
        maturityDistribution,
        industryDistribution,
        riskTrend,
      } as AggregatedStats;
    },
  });
};

export const useOrganizationDetails = (organizationId: string) => {
  return useQuery({
    queryKey: ['admin', 'organization_details', organizationId],
    queryFn: async () => {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (orgError) throw orgError;

      const { data: controls, error: controlError } = await supabase
        .from('organization_controls')
        .select('*, control:controls(*)')
        .eq('organization_id', organizationId);

      if (controlError) throw controlError;

      const { data: riskCalcs, error: riskError } = await supabase
        .from('risk_calculations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('calculated_at', { ascending: false })
        .limit(10);

      if (riskError) throw riskError;

      const { data: maturityAssessments, error: maturityError } = await supabase
        .from('maturity_assessments')
        .select('*')
        .eq('organization_id', organizationId)
        .order('assessed_at', { ascending: false })
        .limit(5);

      if (maturityError) throw maturityError;

      return {
        organization: org,
        controls,
        riskCalculations: riskCalcs,
        maturityAssessments,
      };
    },
    enabled: !!organizationId,
  });
};

export const useUserRole = () => {
  return useQuery({
    queryKey: ['user_role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) return 'participant'; // Default role
      return data?.role || 'participant';
    },
  });
};
