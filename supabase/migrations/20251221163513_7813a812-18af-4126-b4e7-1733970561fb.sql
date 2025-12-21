-- Create enum types for the framework
CREATE TYPE public.maturity_level AS ENUM ('level_1', 'level_2', 'level_3', 'level_4', 'level_5');
CREATE TYPE public.control_status AS ENUM ('pass', 'fail', 'warning', 'not_tested');
CREATE TYPE public.framework_type AS ENUM ('nist_csf', 'iso_27001', 'soc2', 'cis', 'cobit', 'hipaa', 'pci_dss');
CREATE TYPE public.risk_level AS ENUM ('critical', 'high', 'medium', 'low');

-- Organizations table (research participants)
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large', 'enterprise')),
  current_maturity_level maturity_level NOT NULL DEFAULT 'level_1',
  baseline_risk_exposure NUMERIC(15, 2) DEFAULT 0,
  current_risk_exposure NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance frameworks configuration
CREATE TABLE public.compliance_frameworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  framework framework_type NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  enabled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, framework)
);

-- Compliance controls library
CREATE TABLE public.controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework framework_type NOT NULL,
  control_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  severity risk_level NOT NULL DEFAULT 'medium',
  test_frequency_minutes INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(framework, control_id)
);

-- Organization-specific control configurations
CREATE TABLE public.organization_controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  control_id UUID NOT NULL REFERENCES public.controls(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  current_status control_status NOT NULL DEFAULT 'not_tested',
  pass_rate NUMERIC(5, 2) DEFAULT 0,
  last_tested_at TIMESTAMP WITH TIME ZONE,
  risk_weight NUMERIC(5, 4) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, control_id)
);

-- Control test results (continuous compliance evidence)
CREATE TABLE public.control_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_control_id UUID NOT NULL REFERENCES public.organization_controls(id) ON DELETE CASCADE,
  status control_status NOT NULL,
  evidence JSONB,
  failure_reason TEXT,
  remediation_recommendation TEXT,
  tested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Threat scenarios (FAIR methodology)
CREATE TABLE public.threat_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  threat_type TEXT NOT NULL,
  asset_at_risk TEXT NOT NULL,
  threat_event_frequency NUMERIC(10, 4) NOT NULL DEFAULT 10,
  vulnerability_factor NUMERIC(5, 4) NOT NULL DEFAULT 0.5,
  primary_loss_magnitude NUMERIC(15, 2) NOT NULL DEFAULT 0,
  secondary_loss_magnitude NUMERIC(15, 2) NOT NULL DEFAULT 0,
  loss_event_frequency NUMERIC(10, 4) GENERATED ALWAYS AS (threat_event_frequency * vulnerability_factor) STORED,
  annual_loss_exposure NUMERIC(15, 2) GENERATED ALWAYS AS (
    (threat_event_frequency * vulnerability_factor) * (primary_loss_magnitude + secondary_loss_magnitude)
  ) STORED,
  risk_level risk_level NOT NULL DEFAULT 'medium',
  mitigating_control_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Risk calculations history (for trending)
CREATE TABLE public.risk_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  total_risk_exposure NUMERIC(15, 2) NOT NULL,
  compliance_score NUMERIC(5, 2) NOT NULL,
  maturity_level maturity_level NOT NULL,
  control_pass_rate NUMERIC(5, 2) NOT NULL,
  projected_risk_exposure NUMERIC(15, 2),
  calculation_details JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Maturity assessments history
CREATE TABLE public.maturity_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  overall_level maturity_level NOT NULL,
  domain_scores JSONB NOT NULL DEFAULT '{}',
  improvement_recommendations JSONB DEFAULT '[]',
  projected_risk_reduction NUMERIC(15, 2),
  assessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Evidence sources configuration
CREATE TABLE public.evidence_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  name TEXT NOT NULL,
  connection_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_collection_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maturity_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_sources ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_controls_updated_at
  BEFORE UPDATE ON public.organization_controls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_threat_scenarios_updated_at
  BEFORE UPDATE ON public.threat_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies: Controls table is public read (framework library)
CREATE POLICY "Controls are viewable by everyone"
  ON public.controls FOR SELECT
  USING (true);

-- For now, allow authenticated users to manage their organization data
-- (Will be refined with proper org membership after auth is implemented)
CREATE POLICY "Allow all operations for authenticated users on organizations"
  ON public.organizations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on compliance_frameworks"
  ON public.compliance_frameworks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on organization_controls"
  ON public.organization_controls FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on control_test_results"
  ON public.control_test_results FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on threat_scenarios"
  ON public.threat_scenarios FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on risk_calculations"
  ON public.risk_calculations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on maturity_assessments"
  ON public.maturity_assessments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on evidence_sources"
  ON public.evidence_sources FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed initial NIST CSF controls
INSERT INTO public.controls (framework, control_id, name, description, category, severity, test_frequency_minutes) VALUES
('nist_csf', 'PR.AC-1', 'Identity Management', 'Identities and credentials are issued, managed, verified, revoked, and audited', 'Access Control', 'critical', 30),
('nist_csf', 'PR.AC-3', 'Remote Access Management', 'Remote access is managed', 'Access Control', 'high', 60),
('nist_csf', 'PR.AC-4', 'Access Permissions', 'Access permissions and authorizations are managed', 'Access Control', 'critical', 30),
('nist_csf', 'PR.AC-5', 'Network Integrity', 'Network integrity is protected', 'Access Control', 'high', 60),
('nist_csf', 'PR.AC-7', 'User Authentication', 'Users, devices, and assets are authenticated', 'Access Control', 'critical', 15),
('nist_csf', 'PR.DS-1', 'Data-at-Rest Protection', 'Data-at-rest is protected', 'Data Security', 'critical', 60),
('nist_csf', 'PR.DS-2', 'Data-in-Transit Protection', 'Data-in-transit is protected', 'Data Security', 'critical', 60),
('nist_csf', 'PR.DS-5', 'Data Leakage Protection', 'Protections against data leaks are implemented', 'Data Security', 'high', 120),
('nist_csf', 'DE.CM-1', 'Network Monitoring', 'The network is monitored for potential cybersecurity events', 'Detection', 'high', 30),
('nist_csf', 'DE.CM-4', 'Malicious Code Detection', 'Malicious code is detected', 'Detection', 'critical', 15),
('nist_csf', 'DE.CM-7', 'Unauthorized Activity Monitoring', 'Monitoring for unauthorized personnel, connections, devices', 'Detection', 'high', 30),
('nist_csf', 'RS.RP-1', 'Incident Response Plan', 'Response plan is executed during or after an incident', 'Response', 'high', 1440),
('nist_csf', 'RC.RP-1', 'Recovery Plan', 'Recovery plan is executed during or after a cybersecurity incident', 'Recovery', 'high', 1440),
('nist_csf', 'ID.RA-1', 'Asset Vulnerabilities', 'Asset vulnerabilities are identified and documented', 'Risk Assessment', 'medium', 240),
('nist_csf', 'ID.RA-5', 'Threat Intelligence', 'Threats, vulnerabilities, likelihoods, and impacts used to determine risk', 'Risk Assessment', 'medium', 480);

-- Seed ISO 27001 controls
INSERT INTO public.controls (framework, control_id, name, description, category, severity, test_frequency_minutes) VALUES
('iso_27001', 'A.5.1', 'Information Security Policies', 'Policies for information security', 'Governance', 'medium', 1440),
('iso_27001', 'A.6.1', 'Organization of Information Security', 'Internal organization security roles', 'Governance', 'medium', 1440),
('iso_27001', 'A.8.1', 'Asset Management', 'Responsibility for assets', 'Asset Management', 'high', 480),
('iso_27001', 'A.9.1', 'Access Control Policy', 'Business requirements of access control', 'Access Control', 'critical', 60),
('iso_27001', 'A.9.2', 'User Access Management', 'User registration and de-registration', 'Access Control', 'critical', 30),
('iso_27001', 'A.9.4', 'System Access Control', 'System and application access control', 'Access Control', 'critical', 30),
('iso_27001', 'A.10.1', 'Cryptographic Controls', 'Policy on use of cryptographic controls', 'Cryptography', 'high', 240),
('iso_27001', 'A.12.2', 'Protection from Malware', 'Controls against malware', 'Operations Security', 'critical', 15),
('iso_27001', 'A.12.4', 'Logging and Monitoring', 'Event logging', 'Operations Security', 'high', 30),
('iso_27001', 'A.13.1', 'Network Security Management', 'Network controls', 'Communications Security', 'high', 60),
('iso_27001', 'A.14.2', 'Security in Development', 'Security in development and support processes', 'System Development', 'medium', 480),
('iso_27001', 'A.16.1', 'Incident Management', 'Management of information security incidents', 'Incident Management', 'high', 240),
('iso_27001', 'A.17.1', 'Business Continuity', 'Information security continuity', 'Business Continuity', 'high', 1440),
('iso_27001', 'A.18.1', 'Compliance', 'Compliance with legal and contractual requirements', 'Compliance', 'medium', 1440),
('iso_27001', 'A.18.2', 'Security Reviews', 'Information security reviews', 'Compliance', 'medium', 720);