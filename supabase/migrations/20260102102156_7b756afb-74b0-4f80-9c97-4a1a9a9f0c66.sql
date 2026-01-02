-- Create notifications table for in-app notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('control_failure', 'control_warning', 'risk_alert', 'maturity_change', 'security_incident', 'report_ready', 'remediation_update')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create control_remediations table for tracking fix progress
CREATE TABLE public.control_remediations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_control_id UUID NOT NULL REFERENCES public.organization_controls(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending_verification', 'resolved', 'accepted_risk')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT,
  root_cause TEXT,
  remediation_plan TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create remediation_comments for tracking progress notes
CREATE TABLE public.remediation_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  remediation_id UUID NOT NULL REFERENCES public.control_remediations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_remediations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remediation_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- RLS policies for control_remediations
CREATE POLICY "Authenticated users can view org remediations"
  ON public.control_remediations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert remediations"
  ON public.control_remediations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update remediations"
  ON public.control_remediations FOR UPDATE
  USING (true);

-- RLS policies for remediation_comments
CREATE POLICY "Authenticated users can view comments"
  ON public.remediation_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON public.remediation_comments FOR INSERT
  WITH CHECK (true);

-- Create updated_at trigger for remediations
CREATE TRIGGER update_control_remediations_updated_at
  BEFORE UPDATE ON public.control_remediations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;