import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { TablesUpdate } from "@/types/supabase";

type SpinSettingsUpdate = TablesUpdate<"spin_settings">;

const QUERY_KEY = ["spinSettings"] as const;

export function useSpinSettings() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spin_settings")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateSpinSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: SpinSettingsUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("spin_settings")
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
