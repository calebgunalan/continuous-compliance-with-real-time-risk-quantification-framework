import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RiskCalculation, MaturityAssessment, MaturityLevel } from '@/types/database';

export const useRiskCalculations = (organizationId: string, limit = 30) => {
  return useQuery({
    queryKey: ['risk_calculations', organizationId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_calculations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('calculated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as RiskCalculation[];
    },
    enabled: !!organizationId,
  });
};

export const useLatestRiskCalculation = (organizationId: string) => {
  return useQuery({
    queryKey: ['latest_risk_calculation', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_calculations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
      return data as RiskCalculation | null;
    },
    enabled: !!organizationId,
  });
};

interface RecordRiskCalculationInput {
  organization_id: string;
  total_risk_exposure: number;
  compliance_score: number;
  maturity_level: MaturityLevel;
  control_pass_rate: number;
  projected_risk_exposure?: number;
  calculation_details?: unknown;
}

export const useRecordRiskCalculation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RecordRiskCalculationInput) => {
      const { data, error } = await supabase
        .from('risk_calculations')
        .insert([{
          organization_id: input.organization_id,
          total_risk_exposure: input.total_risk_exposure,
          compliance_score: input.compliance_score,
          maturity_level: input.maturity_level,
          control_pass_rate: input.control_pass_rate,
          projected_risk_exposure: input.projected_risk_exposure || null,
          calculation_details: (input.calculation_details || null) as never,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as RiskCalculation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['risk_calculations', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['latest_risk_calculation', data.organization_id] });
    },
  });
};

// Maturity Assessments
export const useMaturityAssessments = (organizationId: string, limit = 12) => {
  return useQuery({
    queryKey: ['maturity_assessments', organizationId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maturity_assessments')
        .select('*')
        .eq('organization_id', organizationId)
        .order('assessed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as MaturityAssessment[];
    },
    enabled: !!organizationId,
  });
};

export const useLatestMaturityAssessment = (organizationId: string) => {
  return useQuery({
    queryKey: ['latest_maturity_assessment', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maturity_assessments')
        .select('*')
        .eq('organization_id', organizationId)
        .order('assessed_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as MaturityAssessment | null;
    },
    enabled: !!organizationId,
  });
};

interface RecordMaturityAssessmentInput {
  organization_id: string;
  overall_level: MaturityLevel;
  domain_scores: Record<string, number>;
  improvement_recommendations?: Array<{
    title: string;
    description: string;
    impact: string;
    effort: string;
    projected_risk_reduction: number;
  }>;
  projected_risk_reduction?: number;
}

export const useRecordMaturityAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RecordMaturityAssessmentInput) => {
      const { data, error } = await supabase
        .from('maturity_assessments')
        .insert({
          organization_id: input.organization_id,
          overall_level: input.overall_level,
          domain_scores: input.domain_scores,
          improvement_recommendations: input.improvement_recommendations || [],
          projected_risk_reduction: input.projected_risk_reduction || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MaturityAssessment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maturity_assessments', data.organization_id] });
      queryClient.invalidateQueries({ queryKey: ['latest_maturity_assessment', data.organization_id] });
    },
  });
};

// FAIR Risk Calculation Helper
export const calculateFAIRRisk = (
  threatEventFrequency: number,
  vulnerabilityFactor: number,
  primaryLossMagnitude: number,
  secondaryLossMagnitude: number = 0
) => {
  const lossEventFrequency = threatEventFrequency * vulnerabilityFactor;
  const totalLossMagnitude = primaryLossMagnitude + secondaryLossMagnitude;
  const annualLossExposure = lossEventFrequency * totalLossMagnitude;

  return {
    lossEventFrequency,
    totalLossMagnitude,
    annualLossExposure,
  };
};

// Maturity to Risk Reduction correlation (exponential decay model from PRP)
export const calculateProjectedRiskReduction = (
  currentRisk: number,
  currentMaturityLevel: number,
  targetMaturityLevel: number,
  k: number = 0.5 // Decay constant, to be validated empirically
) => {
  const currentBreachProbability = Math.exp(-k * currentMaturityLevel);
  const targetBreachProbability = Math.exp(-k * targetMaturityLevel);
  const reductionFactor = 1 - (targetBreachProbability / currentBreachProbability);
  const projectedRiskReduction = currentRisk * reductionFactor;

  return {
    currentBreachProbability,
    targetBreachProbability,
    reductionFactor,
    projectedRiskReduction,
    projectedRisk: currentRisk - projectedRiskReduction,
  };
};
