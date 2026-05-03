import { Database } from "@/types/supabase";
import { Trophy } from "lucide-react";
import { PropsWithChildren } from "react";

type CustomerListItemProps = {
  readonly customer: Database["public"]["Tables"]["customers"]["Row"];
};
function CustomerListItem({
  customer,
  children,
}: PropsWithChildren<CustomerListItemProps>) {
  return (
    <div
      key={customer.id}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        customer.is_active
          ? "bg-white border-purple-100"
          : "bg-gray-50 border-gray-100 opacity-60"
      }`}
    >
      {/* Name + badges */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span
          className={`font-medium truncate ${
            customer.is_active ? "text-purple-900" : "text-gray-400"
          }`}
        >
          {customer.name}
        </span>
        {customer.is_winner && (
          <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />
        )}
      </div>
      {children}
    </div>
  );
}

export default CustomerListItem;
