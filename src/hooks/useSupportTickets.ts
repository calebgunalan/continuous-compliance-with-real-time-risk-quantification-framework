import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { toast } from "sonner";

export interface SupportTicket {
  id: string;
  organization_id: string;
  created_by: string | null;
  assigned_to: string | null;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  category: string;
  priority: string;
}

export interface UpdateTicketInput {
  id: string;
  status?: string;
  resolution?: string;
  assigned_to?: string;
  priority?: string;
}

export function useSupportTickets() {
  const { organizationId } = useOrganizationContext();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading, error } = useQuery({
    queryKey: ["support-tickets", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    },
    enabled: !!organizationId,
  });

  const createTicket = useMutation({
    mutationFn: async (input: CreateTicketInput) => {
      if (!organizationId) throw new Error("No organization selected");

      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          organization_id: organizationId,
          created_by: userData.user?.id || null,
          title: input.title,
          description: input.description,
          category: input.category,
          priority: input.priority,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success("Support ticket created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create ticket: ${error.message}`);
    },
  });

  const updateTicket = useMutation({
    mutationFn: async (input: UpdateTicketInput) => {
      const updates: Record<string, unknown> = {};
      if (input.status) updates.status = input.status;
      if (input.resolution) updates.resolution = input.resolution;
      if (input.assigned_to) updates.assigned_to = input.assigned_to;
      if (input.priority) updates.priority = input.priority;
      
      if (input.status === "resolved" || input.status === "closed") {
        updates.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("support_tickets")
        .update(updates)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success("Ticket updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update ticket: ${error.message}`);
    },
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress" || t.status === "waiting").length,
    resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
  };

  return {
    tickets,
    isLoading,
    error,
    stats,
    createTicket,
    updateTicket,
  };
}
