-- Breach incident tracking for empirical validation of maturity-to-risk correlation
CREATE TABLE public.breach_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  financial_impact NUMERIC,
  maturity_level_at_time public.maturity_level,
  controls_failing_at_time UUID[],
  root_cause TEXT,
  detection_method TEXT,
  time_to_detect_hours NUMERIC,
  time_to_remediate_hours NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Study participant enrollment tracking
CREATE TABLE public.study_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  study_group TEXT NOT NULL DEFAULT 'continuous',
  industry_sector TEXT NOT NULL,
  baseline_maturity_level public.maturity_level,
  baseline_risk_exposure NUMERIC,
  consent_signed BOOLEAN DEFAULT false,
  withdrawal_date TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Control effectiveness measurements for research validation
CREATE TABLE public.control_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id UUID NOT NULL REFERENCES public.controls(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  measurement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  vulnerability_reduction_factor NUMERIC,
  breach_probability_impact NUMERIC,
  confidence_level NUMERIC,
  supporting_evidence JSONB DEFAULT '{}'::jsonb
);

-- Audit comparison tracking (traditional vs continuous compliance)
CREATE TABLE public.audit_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  comparison_period_start TIMESTAMP WITH TIME ZONE,
  comparison_period_end TIMESTAMP WITH TIME ZONE,
  traditional_prep_time_hours NUMERIC,
  continuous_prep_time_hours NUMERIC,
  issues_detected_traditional INTEGER,
  issues_detected_continuous INTEGER,
  mean_time_to_detect_traditional_days NUMERIC,
  mean_time_to_detect_continuous_hours NUMERIC,
  compliance_score_traditional NUMERIC,
  compliance_score_continuous NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.breach_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_effectiveness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS policies for breach_incidents
CREATE POLICY "Users can view org breach incidents"
  ON public.breach_incidents
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert breach incidents"
  ON public.breach_incidents
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update breach incidents"
  ON public.breach_incidents
  FOR UPDATE
  USING (true);

-- RLS policies for study_participants (admin/researcher only)
CREATE POLICY "Admins can manage study participants"
  ON public.study_participants
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'researcher'));

-- RLS policies for control_effectiveness
CREATE POLICY "Users can view control effectiveness"
  ON public.control_effectiveness
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert control effectiveness"
  ON public.control_effectiveness
  FOR INSERT
  WITH CHECK (true);

-- RLS policies for audit_comparisons
CREATE POLICY "Users can view audit comparisons"
  ON public.audit_comparisons
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert audit comparisons"
  ON public.audit_comparisons
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update audit comparisons"
  ON public.audit_comparisons
  FOR UPDATE
  USING (true);

-- Add indexes for common queries
CREATE INDEX idx_breach_incidents_org_date ON public.breach_incidents(organization_id, incident_date DESC);
CREATE INDEX idx_breach_incidents_maturity ON public.breach_incidents(maturity_level_at_time);
CREATE INDEX idx_study_participants_org ON public.study_participants(organization_id);
CREATE INDEX idx_control_effectiveness_control ON public.control_effectiveness(control_id);
CREATE INDEX idx_audit_comparisons_org ON public.audit_comparisons(organization_id);