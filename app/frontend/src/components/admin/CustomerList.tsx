import { useCustomers } from "@/hooks/useCustomers";
import { PropsWithChildren } from "react";

type CustomerListProps = Pick<
  ReturnType<typeof useCustomers>,
  "data" | "isLoading"
>;

function CustomerList({
  children,
  isLoading,
  data: customers,
}: PropsWithChildren<CustomerListProps>) {
  if (isLoading)
    return (
      <p className="text-purple-400 text-sm text-center py-4">กำลังโหลด...</p>
    );

  if (customers?.length === 0)
    return (
      <p className="text-purple-300 text-sm text-center py-8">
        ยังไม่มีรายชื่อ — เพิ่มรายชื่อด้านบน
      </p>
    );

  return <div className="space-y-2">{children}</div>;
}

export default CustomerList;
