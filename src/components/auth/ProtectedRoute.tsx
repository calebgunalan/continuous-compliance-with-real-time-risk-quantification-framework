import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresOrganization?: boolean;
}

export function ProtectedRoute({ children, requiresOrganization = true }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    // If user is authenticated but has no organization and we require one,
    // redirect to onboarding (unless already on onboarding page)
    if (!loading && user && profile && requiresOrganization && !profile.organization_id) {
      if (location.pathname !== '/onboarding') {
        navigate('/onboarding');
      }
    }
  }, [user, profile, loading, navigate, requiresOrganization, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If we require organization and profile is loaded but no org, don't render children
  if (requiresOrganization && profile && !profile.organization_id && location.pathname !== '/onboarding') {
    return null;
  }

  return <>{children}</>;
}
