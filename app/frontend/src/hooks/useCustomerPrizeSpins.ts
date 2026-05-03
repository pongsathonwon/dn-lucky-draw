import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
export type { CustomerPrizeSpin } from "@/types/supabase";

const queryKey = (prizeId: string) => ["customerPrizeSpins", prizeId] as const;

export function useCustomerPrizeSpins(prizeId: string | null | undefined) {
  return useQuery({
    queryKey: prizeId ? queryKey(prizeId) : ["customerPrizeSpins", null],
    enabled: !!prizeId,
    queryFn: async () => {
      if (!prizeId) throw new Error("prizeId is required");
      const { data, error } = await supabase
        .from("customer_prize_spins")
        .select("*, customers(name, is_winner)")
        .eq("prize_id", prizeId)
        .order("spin_count", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertPrizeSpin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customer_id,
      prize_id,
    }: {
      customer_id: string;
      prize_id: string;
    }): Promise<number> => {
      // Atomically increment spin_count using upsert
      const { data, error } = await supabase.rpc("increment_prize_spin", {
        p_customer_id: customer_id,
        p_prize_id: prize_id,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (_data, { prize_id }) => {
      queryClient.invalidateQueries({ queryKey: queryKey(prize_id) });
    },
  });
}
