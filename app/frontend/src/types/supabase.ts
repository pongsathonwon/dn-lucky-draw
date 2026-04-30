// Hand-crafted types — replace with `supabase gen types --local --schema public` output
// after running `supabase start`.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          spin_count: number;
          is_winner: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          spin_count?: number;
          is_winner?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          spin_count?: number;
          is_winner?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      spin_results: {
        Row: {
          id: string;
          customer_id: string | null;
          outcome: "win" | "no_win";
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          outcome: "win" | "no_win";
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          outcome?: "win" | "no_win";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "spin_results_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      spin_settings: {
        Row: {
          id: string;
          spin_duration: number;
          remove_after_win: boolean;
          prize_text: string | null;
          prize_image_url: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          spin_duration?: number;
          remove_after_win?: boolean;
          prize_text?: string | null;
          prize_image_url?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          spin_duration?: number;
          remove_after_win?: boolean;
          prize_text?: string | null;
          prize_image_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerInsert =
  Database["public"]["Tables"]["customers"]["Insert"];
export type CustomerUpdate =
  Database["public"]["Tables"]["customers"]["Update"];

export type SpinResult = Database["public"]["Tables"]["spin_results"]["Row"];
export type SpinResultInsert =
  Database["public"]["Tables"]["spin_results"]["Insert"];

export type SpinSettings =
  Database["public"]["Tables"]["spin_settings"]["Row"];
export type SpinSettingsUpdate =
  Database["public"]["Tables"]["spin_settings"]["Update"];
