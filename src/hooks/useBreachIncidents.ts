import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Type for breach incidents
export interface BreachIncident {
  id: string;
  organization_id: string;
  incident_date: string;
  incident_type: string;
  severity: string;
  financial_impact: number | null;
  maturity_level_at_time: string | null;
  controls_failing_at_time: string[] | null;
  root_cause: string | null;
  detection_method: string | null;
  time_to_detect_hours: number | null;
  time_to_remediate_hours: number | null;
  created_at: string;
}

export interface RecordBreachIncidentInput {
  organization_id: string;
  incident_date: string;
  incident_type: string;
  severity: string;
  financial_impact?: number;
  maturity_level_at_time?: string;
  controls_failing_at_time?: string[];
  root_cause?: string;
  detection_method?: string;
  time_to_detect_hours?: number;
  time_to_remediate_hours?: number;
}

export function useBreachIncidents(organizationId: string, limit: number = 50) {
  return useQuery({
    queryKey: ['breach-incidents', organizationId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('breach_incidents')
        .select('*')
        .eq('organization_id', organizationId)
        .order('incident_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching breach incidents:', error);
        return [];
      }

      return data as unknown as BreachIncident[];
    },
    enabled: !!organizationId,
  });
}

export function useRecordBreachIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RecordBreachIncidentInput) => {
      const { data, error } = await supabase
        .from('breach_incidents')
        .insert([input as any])
        .select()
        .single();

      if (error) throw error;
      return data as unknown as BreachIncident;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['breach-incidents', variables.organization_id] });
    },
  });
}

// Statistical analysis utilities for research validation
export function calculateBreachStatistics(incidents: BreachIncident[]) {
  if (incidents.length === 0) {
    return {
      totalIncidents: 0,
      totalFinancialImpact: 0,
      avgDetectionTime: 0,
      avgRemediationTime: 0,
      incidentsByMaturity: {} as Record<string, number>,
      incidentsBySeverity: {} as Record<string, number>,
    };
  }

  const totalIncidents = incidents.length;
  const totalFinancialImpact = incidents.reduce((sum, i) => sum + (i.financial_impact || 0), 0);
  
  const detectionTimes = incidents.filter(i => i.time_to_detect_hours != null);
  const avgDetectionTime = detectionTimes.length > 0
    ? detectionTimes.reduce((sum, i) => sum + (i.time_to_detect_hours || 0), 0) / detectionTimes.length
    : 0;

  const remediationTimes = incidents.filter(i => i.time_to_remediate_hours != null);
  const avgRemediationTime = remediationTimes.length > 0
    ? remediationTimes.reduce((sum, i) => sum + (i.time_to_remediate_hours || 0), 0) / remediationTimes.length
    : 0;

  const incidentsByMaturity: Record<string, number> = {};
  const incidentsBySeverity: Record<string, number> = {};

  incidents.forEach(incident => {
    const maturity = incident.maturity_level_at_time || 'unknown';
    incidentsByMaturity[maturity] = (incidentsByMaturity[maturity] || 0) + 1;

    const severity = incident.severity;
    incidentsBySeverity[severity] = (incidentsBySeverity[severity] || 0) + 1;
  });

  return {
    totalIncidents,
    totalFinancialImpact,
    avgDetectionTime,
    avgRemediationTime,
    incidentsByMaturity,
    incidentsBySeverity,
  };
}

// Calculate breach rate by maturity level for correlation analysis
export function calculateBreachRateByMaturity(
  incidents: BreachIncident[],
  observationMonths: number = 12
): { maturityLevel: number; breachRate: number; count: number }[] {
  const maturityLevels = ['level_1', 'level_2', 'level_3', 'level_4', 'level_5'];
  
  return maturityLevels.map((level, index) => {
    const levelIncidents = incidents.filter(i => i.maturity_level_at_time === level);
    const annualizedRate = (levelIncidents.length / observationMonths) * 12;
    
    return {
      maturityLevel: index + 1,
      breachRate: annualizedRate,
      count: levelIncidents.length,
    };
  });
}
