import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/hooks/useCustomers";
import type { Customer } from "@/types/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import CustomerList from "./CustomerList";
import CustomerListItem from "./CustomerListItem";

const customerSchema = z.object({
  name: z.string().min(1, "กรุณาใส่ชื่อ").max(100),
});
type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomerManager() {
  const { data: customers = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  const onAddSingle = async (values: CustomerFormValues) => {
    await createCustomer.mutateAsync(
      { name: values.name.trim() },
      {
        onSuccess: () => {
          reset();
          toast.success(`เพิ่ม "${values.name.trim()}" เรียบร้อย`);
        },
        onError: () => toast.error("เพิ่มรายชื่อไม่สำเร็จ"),
      },
    );
  };

  const handleBulkImport = async () => {
    const names = bulkText
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) return;

    let added = 0;
    for (const name of names) {
      try {
        await createCustomer.mutateAsync({ name });
        added++;
      } catch {
        // skip duplicates or errors
      }
    }
    setBulkText("");
    setShowBulk(false);
    toast.success(`เพิ่มรายชื่อ ${added} รายการเรียบร้อย`);
  };

  const handleToggleActive = (customer: Customer) => {
    updateCustomer.mutate(
      { id: customer.id, data: { is_active: !customer.is_active } },
      {
        onError: () => toast.error("อัพเดทไม่สำเร็จ"),
      },
    );
  };

  const handleDelete = async (id: string) => {
    await deleteCustomer.mutateAsync(id, {
      onSuccess: () => {
        setDeleteConfirmId(null);
        toast.success("ลบรายชื่อเรียบร้อย");
      },
      onError: () => toast.error("ลบไม่สำเร็จ"),
    });
  };

  const activeCount = customers.filter((c) => c.is_active).length;

  return (
    <Card className="border-purple-100 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Users className="w-5 h-5" />
            จัดการรายชื่อ
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-purple-700">
              {activeCount} / {customers.length} คน
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowBulk((v) => !v)}
              className="text-purple-700 border-purple-200 hover:bg-purple-50 gap-1.5"
            >
              <Upload className="w-4 h-4" />
              นำเข้าหลายชื่อ
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add single */}
        <form onSubmit={handleSubmit(onAddSingle)} className="flex gap-2">
          <div className="flex-1">
            <Input
              {...register("name")}
              placeholder="ชื่อร้าน / ลูกค้า"
              className="border-purple-200 focus:ring-purple-500"
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={createCustomer.isPending}
            className="bg-purple-700 hover:bg-purple-600 text-white gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            เพิ่ม
          </Button>
        </form>

        {/* Bulk import */}
        {showBulk && (
          <div className="space-y-2 p-4 bg-purple-50 rounded-xl">
            <Label className="text-purple-800">
              วางรายชื่อ (หนึ่งชื่อต่อบรรทัด)
            </Label>
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={5}
              placeholder={"ร้านค้า A\nร้านค้า B\nร้านค้า C"}
              className="border-purple-200 font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleBulkImport}
                disabled={createCustomer.isPending || !bulkText.trim()}
                className="bg-purple-700 hover:bg-purple-600 text-white"
              >
                นำเข้า
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowBulk(false);
                  setBulkText("");
                }}
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        )}

        <Separator className="bg-purple-100" />
        <CustomerList {...{ isLoading, data: customers }}>
          {customers?.map((customer) => (
            <CustomerListItem key={customer.id} customer={customer}>
              {/* Active toggle */}
              <Switch
                checked={customer.is_active}
                onCheckedChange={() => handleToggleActive(customer)}
                disabled={updateCustomer.isPending}
              />

              {/* Delete */}
              {deleteConfirmId === customer.id ? (
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(customer.id)}
                    className="text-xs h-7 px-2"
                  >
                    ยืนยันลบ
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteConfirmId(null)}
                    className="text-xs h-7 px-2"
                  >
                    ยกเลิก
                  </Button>
                </div>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeleteConfirmId(customer.id)}
                  className="text-gray-400 hover:text-destructive h-8 w-8 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </CustomerListItem>
          ))}
        </CustomerList>
      </CardContent>
    </Card>
  );
}
