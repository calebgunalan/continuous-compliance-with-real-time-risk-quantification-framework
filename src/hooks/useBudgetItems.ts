import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BudgetItem {
  id: string;
  category: string;
  item_name: string;
  description: string | null;
  budgeted_amount: number;
  spent_amount: number;
  funding_source: string | null;
  fiscal_year: string | null;
  is_recurring: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetInput {
  category: string;
  item_name: string;
  description?: string;
  budgeted_amount: number;
  funding_source?: string;
  fiscal_year?: string;
  is_recurring?: boolean;
}

export interface UpdateBudgetInput {
  id: string;
  spent_amount?: number;
  budgeted_amount?: number;
  notes?: string;
}

export function useBudgetItems() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["budget-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_items")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      return data as BudgetItem[];
    },
  });

  const createItem = useMutation({
    mutationFn: async (input: CreateBudgetInput) => {
      const { data, error } = await supabase
        .from("budget_items")
        .insert({
          category: input.category,
          item_name: input.item_name,
          description: input.description || null,
          budgeted_amount: input.budgeted_amount,
          spent_amount: 0,
          funding_source: input.funding_source || null,
          fiscal_year: input.fiscal_year || null,
          is_recurring: input.is_recurring || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-items"] });
      toast.success("Budget item added");
    },
    onError: (error) => {
      toast.error(`Failed to add item: ${error.message}`);
    },
  });

  const updateItem = useMutation({
    mutationFn: async (input: UpdateBudgetInput) => {
      const updates: Record<string, unknown> = {};
      if (input.spent_amount !== undefined) updates.spent_amount = input.spent_amount;
      if (input.budgeted_amount !== undefined) updates.budgeted_amount = input.budgeted_amount;
      if (input.notes) updates.notes = input.notes;

      const { data, error } = await supabase
        .from("budget_items")
        .update(updates)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-items"] });
      toast.success("Budget item updated");
    },
    onError: (error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });

  const groupedByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, BudgetItem[]>);

  const categoryTotals = Object.entries(groupedByCategory).map(([category, categoryItems]) => ({
    category,
    budgeted: categoryItems.reduce((sum, i) => sum + i.budgeted_amount, 0),
    spent: categoryItems.reduce((sum, i) => sum + i.spent_amount, 0),
    items: categoryItems.length,
  }));

  const stats = {
    totalBudgeted: items.reduce((sum, i) => sum + i.budgeted_amount, 0),
    totalSpent: items.reduce((sum, i) => sum + i.spent_amount, 0),
    itemCount: items.length,
    utilizationRate: items.reduce((sum, i) => sum + i.budgeted_amount, 0) > 0
      ? (items.reduce((sum, i) => sum + i.spent_amount, 0) / 
         items.reduce((sum, i) => sum + i.budgeted_amount, 0)) * 100
      : 0,
    categoryTotals,
  };

  return {
    items,
    groupedByCategory,
    isLoading,
    error,
    stats,
    createItem,
    updateItem,
  };
}
