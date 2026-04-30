# /port-entity

Port a single Base44 entity → Postgres migration + generated types + typed React Query hooks.

## Usage

```
/port-entity <EntityName>
```

Example: `/port-entity Customer`

## What this command does

1. **Read the schema** from `poc/entities/<EntityName>`

2. **Generate a Postgres migration** at `app/supabase/migrations/<timestamp>_create_<table>.sql`
   - Map Base44 field types → Postgres types (see table below)
   - Add `uuid` PK, `created_at` timestamptz
   - Add foreign key constraints where applicable
   - Enable RLS with a permissive policy stub

3. **Remind to regenerate types** — after migration is applied, run:

   ```bash
   cd app
   supabase gen types --local --schema public > frontend/src/types/supabase.ts
   ```

4. **Generate typed React Query hooks** at `app/frontend/src/hooks/use<EntityName>.ts`
   - Import `Database` from `@/types/supabase`
   - Define `type <EntityName> = Database['public']['Tables']['<table>']['Row']`
   - Export typed hooks: `useList`, `use<Entity>(id)`, `useCreate`, `useUpdate`, `useDelete`
   - All mutations invalidate the correct React Query cache keys

5. **Update task file** — mark the corresponding task as `in-progress`

## Type mapping

| Base44 type      | Postgres type                 |
| ---------------- | ----------------------------- |
| string           | text                          |
| integer          | integer                       |
| float            | numeric                       |
| boolean          | boolean                       |
| date / datetime  | timestamptz                   |
| reference (FK)   | uuid references \<table\>(id) |
| file / image URL | text                          |

## Hook output shape (example for Customer)

```ts
// app/frontend/src/hooks/useCustomers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];

const QUERY_KEY = ["customers"] as const;

export function useCustomers() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Customer[]> => {
      const { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CustomerInsert) => {
      const { data, error } = await supabase
        .from("customers")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
// ... useUpdateCustomer, useDeleteCustomer follow same pattern
```

## Notes

- Never use `any` — rely on generated `Database` types
- Preserve all field names from POC — they are referenced in existing component logic
- Add `// ported from poc/entities/<EntityName>` at top of migration file
