import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { toast } from "sonner";

export interface ConsentRecord {
  id: string;
  organization_id: string;
  participant_id: string | null;
  consent_type: string;
  consent_version: string;
  signed_by: string;
  signed_at: string;
  ip_address: string | null;
  consent_document_url: string | null;
  is_active: boolean;
  revoked_at: string | null;
  revocation_reason: string | null;
  created_at: string;
}

export interface CreateConsentInput {
  participant_id?: string;
  consent_type: string;
  consent_version: string;
  signed_by: string;
}

export function useConsentRecords() {
  const { organizationId } = useOrganizationContext();
  const queryClient = useQueryClient();

  const { data: consents = [], isLoading, error } = useQuery({
    queryKey: ["consent-records", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from("consent_records")
        .select("*")
        .order("signed_at", { ascending: false });

      if (error) throw error;
      return data as ConsentRecord[];
    },
    enabled: !!organizationId,
  });

  const createConsent = useMutation({
    mutationFn: async (input: CreateConsentInput) => {
      if (!organizationId) throw new Error("No organization selected");

      const { data, error } = await supabase
        .from("consent_records")
        .insert({
          organization_id: organizationId,
          participant_id: input.participant_id || null,
          consent_type: input.consent_type,
          consent_version: input.consent_version,
          signed_by: input.signed_by,
          signed_at: new Date().toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consent-records"] });
      toast.success("Consent record created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create consent: ${error.message}`);
    },
  });

  const revokeConsent = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await supabase
        .from("consent_records")
        .update({
          is_active: false,
          revoked_at: new Date().toISOString(),
          revocation_reason: reason,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consent-records"] });
      toast.success("Consent revoked");
    },
    onError: (error) => {
      toast.error(`Failed to revoke consent: ${error.message}`);
    },
  });

  const stats = {
    total: consents.length,
    active: consents.filter((c) => c.is_active).length,
    revoked: consents.filter((c) => !c.is_active).length,
  };

  return {
    consents,
    isLoading,
    error,
    stats,
    createConsent,
    revokeConsent,
  };
}
