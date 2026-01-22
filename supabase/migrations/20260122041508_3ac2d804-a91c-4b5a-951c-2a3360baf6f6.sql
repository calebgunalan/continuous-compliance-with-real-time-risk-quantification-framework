-- Create support tickets table for participant support ticketing
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create consent records table for IRB/consent management
CREATE TABLE public.consent_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.study_participants(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL DEFAULT 'participation',
  consent_version TEXT NOT NULL DEFAULT '1.0',
  signed_by TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  consent_document_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revocation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funding applications table for proposal tracking
CREATE TABLE public.funding_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  funding_source TEXT NOT NULL,
  program_name TEXT NOT NULL,
  proposal_title TEXT NOT NULL,
  requested_amount NUMERIC NOT NULL DEFAULT 0,
  awarded_amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'draft',
  submission_deadline TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  decision_date TIMESTAMP WITH TIME ZONE,
  decision_notes TEXT,
  proposal_document_url TEXT,
  principal_investigator TEXT,
  co_investigators JSONB DEFAULT '[]'::jsonb,
  budget_breakdown JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project milestones table for timeline tracking
CREATE TABLE public.project_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_name TEXT NOT NULL,
  milestone_name TEXT NOT NULL,
  description TEXT,
  target_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  progress_percentage NUMERIC NOT NULL DEFAULT 0,
  dependencies JSONB DEFAULT '[]'::jsonb,
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budget items table for budget tracking
CREATE TABLE public.budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  budgeted_amount NUMERIC NOT NULL DEFAULT 0,
  spent_amount NUMERIC NOT NULL DEFAULT 0,
  funding_source TEXT,
  fiscal_year TEXT,
  is_recurring BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project risks table for risk tracking
CREATE TABLE public.project_risks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_category TEXT NOT NULL,
  risk_name TEXT NOT NULL,
  description TEXT NOT NULL,
  likelihood INTEGER NOT NULL DEFAULT 3 CHECK (likelihood BETWEEN 1 AND 5),
  impact INTEGER NOT NULL DEFAULT 3 CHECK (impact BETWEEN 1 AND 5),
  risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
  mitigation_strategy TEXT,
  contingency_plan TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  owner TEXT,
  review_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create success metrics table for tracking research success criteria
CREATE TABLE public.success_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  measurement_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  last_measured_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for support_tickets
CREATE POLICY "Authenticated users can view support tickets"
  ON public.support_tickets FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create support tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update support tickets"
  ON public.support_tickets FOR UPDATE
  USING (true);

-- RLS policies for consent_records
CREATE POLICY "Admins and researchers can manage consent records"
  ON public.consent_records FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'researcher'));

CREATE POLICY "Authenticated users can view consent records"
  ON public.consent_records FOR SELECT
  USING (true);

-- RLS policies for funding_applications
CREATE POLICY "Admins and researchers can manage funding applications"
  ON public.funding_applications FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'researcher'));

CREATE POLICY "Authenticated users can view funding applications"
  ON public.funding_applications FOR SELECT
  USING (true);

-- RLS policies for project_milestones
CREATE POLICY "Authenticated users can manage project milestones"
  ON public.project_milestones FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS policies for budget_items
CREATE POLICY "Admins can manage budget items"
  ON public.budget_items FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'researcher'));

CREATE POLICY "Authenticated users can view budget items"
  ON public.budget_items FOR SELECT
  USING (true);

-- RLS policies for project_risks
CREATE POLICY "Authenticated users can manage project risks"
  ON public.project_risks FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS policies for success_metrics
CREATE POLICY "Authenticated users can manage success metrics"
  ON public.success_metrics FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funding_applications_updated_at
  BEFORE UPDATE ON public.funding_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at
  BEFORE UPDATE ON public.project_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at
  BEFORE UPDATE ON public.budget_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_risks_updated_at
  BEFORE UPDATE ON public.project_risks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_success_metrics_updated_at
  BEFORE UPDATE ON public.success_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_support_tickets_org ON public.support_tickets(organization_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_consent_records_org ON public.consent_records(organization_id);
CREATE INDEX idx_consent_records_participant ON public.consent_records(participant_id);
CREATE INDEX idx_funding_applications_status ON public.funding_applications(status);
CREATE INDEX idx_project_milestones_phase ON public.project_milestones(phase_name);
CREATE INDEX idx_project_milestones_status ON public.project_milestones(status);
CREATE INDEX idx_budget_items_category ON public.budget_items(category);
CREATE INDEX idx_project_risks_category ON public.project_risks(risk_category);
CREATE INDEX idx_project_risks_status ON public.project_risks(status);
CREATE INDEX idx_success_metrics_category ON public.success_metrics(category);