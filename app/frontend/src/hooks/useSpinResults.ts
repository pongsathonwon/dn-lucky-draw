import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const QUERY_KEY = ["spinResults"] as const;

export function useSpinResults() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spin_results")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSpinResult() {
  return useMutation({
    mutationFn: async ({
      customer_id,
      outcome,
    }: {
      customer_id: string;
      outcome: "win" | "no_win";
    }) => {
      const { data, error } = await supabase
        .from("spin_results")
        .insert({ customer_id, outcome })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });
}
