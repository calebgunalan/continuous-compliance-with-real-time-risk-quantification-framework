
-- Control Dependencies table for Cascade Failure Prediction
CREATE TABLE public.control_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_control_id UUID NOT NULL REFERENCES public.controls(id) ON DELETE CASCADE,
  child_control_id UUID NOT NULL REFERENCES public.controls(id) ON DELETE CASCADE,
  dependency_strength DOUBLE PRECISION NOT NULL DEFAULT 0.5 CHECK (dependency_strength >= 0 AND dependency_strength <= 1),
  dependency_type TEXT NOT NULL DEFAULT 'functional',
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_control_id, child_control_id, organization_id)
);

ALTER TABLE public.control_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view control dependencies for their org"
  ON public.control_dependencies FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage control dependencies for their org"
  ON public.control_dependencies FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE INDEX idx_control_deps_org ON public.control_dependencies(organization_id);
CREATE INDEX idx_control_deps_parent ON public.control_dependencies(parent_control_id);
CREATE INDEX idx_control_deps_child ON public.control_dependencies(child_control_id);
