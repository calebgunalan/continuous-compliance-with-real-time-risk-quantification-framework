import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface OrganizationContextType {
  organizationId: string | null;
}

const OrganizationContext = createContext<OrganizationContextType>({ organizationId: null });

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  
  return (
    <OrganizationContext.Provider value={{ organizationId: profile?.organization_id || null }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  return useContext(OrganizationContext);
}
