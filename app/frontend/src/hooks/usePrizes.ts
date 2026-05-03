import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { TablesInsert, TablesUpdate } from "@/types/supabase";

type PrizeInsert = TablesInsert<"prizes">;
type PrizeUpdate = TablesUpdate<"prizes">;

const QUERY_KEY = ["prizes"] as const;

export function usePrizes() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prizes")
        .select("*, customers(name)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePrize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PrizeInsert) => {
      const { data, error } = await supabase
        .from("prizes")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdatePrize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: PrizeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("prizes")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeletePrize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prizes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useSelectPrize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Clear is_selected on all prizes
      const { error: clearError } = await supabase
        .from("prizes")
        .update({ is_selected: false })
        .gte("created_at", "1970-01-01");
      if (clearError) throw clearError;

      // Select the chosen prize
      const { error: selectError } = await supabase
        .from("prizes")
        .update({ is_selected: true })
        .eq("id", id);
      if (selectError) throw selectError;

      // Reset customer win/active flags (spin history is preserved in customer_prize_spins)
      const { error: resetError } = await supabase
        .from("customers")
        .update({ is_winner: false, is_active: true })
        .gte("created_at", "1970-01-01");
      if (resetError) throw resetError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
