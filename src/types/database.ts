// Database types for the Continuous Compliance Framework

export type MaturityLevel = 'level_1' | 'level_2' | 'level_3' | 'level_4' | 'level_5';
export type ControlStatus = 'pass' | 'fail' | 'warning' | 'not_tested';
export type FrameworkType = 'nist_csf' | 'iso_27001' | 'soc2' | 'cis' | 'cobit' | 'hipaa' | 'pci_dss';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type OrganizationSize = 'small' | 'medium' | 'large' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  industry: string;
  size: OrganizationSize;
  current_maturity_level: MaturityLevel;
  baseline_risk_exposure: number;
  current_risk_exposure: number;
  created_at: string;
  updated_at: string;
}

export interface ComplianceFramework {
  id: string;
  organization_id: string;
  framework: FrameworkType;
  is_primary: boolean;
  enabled_at: string;
}

export interface Control {
  id: string;
  framework: FrameworkType;
  control_id: string;
  name: string;
  description: string | null;
  category: string;
  severity: RiskLevel;
  test_frequency_minutes: number;
  created_at: string;
}

export interface OrganizationControl {
  id: string;
  organization_id: string;
  control_id: string;
  is_enabled: boolean;
  current_status: ControlStatus;
  pass_rate: number;
  last_tested_at: string | null;
  risk_weight: number;
  created_at: string;
  updated_at: string;
  // Joined data
  control?: Control;
}

export interface ControlTestResult {
  id: string;
  organization_control_id: string;
  status: ControlStatus;
  evidence: Record<string, unknown> | null;
  failure_reason: string | null;
  remediation_recommendation: string | null;
  tested_at: string;
}

export interface ThreatScenario {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  threat_type: string;
  asset_at_risk: string;
  threat_event_frequency: number;
  vulnerability_factor: number;
  primary_loss_magnitude: number;
  secondary_loss_magnitude: number;
  loss_event_frequency: number;
  annual_loss_exposure: number;
  risk_level: RiskLevel;
  mitigating_control_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface RiskCalculation {
  id: string;
  organization_id: string;
  total_risk_exposure: number;
  compliance_score: number;
  maturity_level: MaturityLevel;
  control_pass_rate: number;
  projected_risk_exposure: number | null;
  calculation_details: Record<string, unknown> | null;
  calculated_at: string;
}

export interface MaturityAssessment {
  id: string;
  organization_id: string;
  overall_level: MaturityLevel;
  domain_scores: Record<string, number>;
  improvement_recommendations: Array<{
    title: string;
    description: string;
    impact: string;
    effort: string;
    projected_risk_reduction: number;
  }>;
  projected_risk_reduction: number | null;
  assessed_at: string;
}

export interface EvidenceSource {
  id: string;
  organization_id: string;
  source_type: string;
  name: string;
  connection_config: Record<string, unknown>;
  is_active: boolean;
  last_collection_at: string | null;
  created_at: string;
}

// Helper functions
export const maturityLevelToNumber = (level: MaturityLevel): number => {
  const map: Record<MaturityLevel, number> = {
    level_1: 1,
    level_2: 2,
    level_3: 3,
    level_4: 4,
    level_5: 5,
  };
  return map[level];
};

export const numberToMaturityLevel = (num: number): MaturityLevel => {
  const map: Record<number, MaturityLevel> = {
    1: 'level_1',
    2: 'level_2',
    3: 'level_3',
    4: 'level_4',
    5: 'level_5',
  };
  return map[num] || 'level_1';
};

export const frameworkDisplayName = (framework: FrameworkType): string => {
  const map: Record<FrameworkType, string> = {
    nist_csf: 'NIST CSF',
    iso_27001: 'ISO 27001',
    soc2: 'SOC 2',
    cis: 'CIS Controls',
    cobit: 'COBIT',
    hipaa: 'HIPAA',
    pci_dss: 'PCI DSS',
  };
  return map[framework];
};

export const riskLevelColor = (level: RiskLevel): string => {
  const map: Record<RiskLevel, string> = {
    critical: 'destructive',
    high: 'warning',
    medium: 'secondary',
    low: 'success',
  };
  return map[level];
};

export const formatCurrency = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};
