import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  usePrizes,
  useCreatePrize,
  useUpdatePrize,
  useDeletePrize,
  useSelectPrize,
} from "@/hooks/usePrizes";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Gift, Plus, Pencil, Trash2, CheckCircle2, Trophy } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/types/supabase";

type Prize = Tables<"prizes">;

const prizeSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อรางวัล"),
  description: z.string().optional(),
  wins_required: z.number().int().min(1).max(10),
  remove_after_win: z.boolean(),
  image_url: z.string().optional(),
});

type PrizeFormValues = z.infer<typeof prizeSchema>;

interface PrizeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<PrizeFormValues>;
  onSubmit: (values: PrizeFormValues) => Promise<void>;
  title: string;
  isPending: boolean;
}

function PrizeFormDialog({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  title,
  isPending,
}: PrizeFormDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PrizeFormValues>({
    resolver: zodResolver(prizeSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      wins_required: initialValues?.wins_required ?? 1,
      remove_after_win: initialValues?.remove_after_win ?? false,
      image_url: initialValues?.image_url ?? "",
    },
  });

  const removeAfterWin = watch("remove_after_win");
  const imageUrl = watch("image_url");

  React.useEffect(() => {
    if (open) {
      reset({
        name: initialValues?.name ?? "",
        description: initialValues?.description ?? "",
        wins_required: initialValues?.wins_required ?? 1,
        remove_after_win: initialValues?.remove_after_win ?? false,
        image_url: initialValues?.image_url ?? "",
      });
    }
  }, [open, initialValues, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `prize-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("prize-images")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast.error("อัพโหลดรูปไม่สำเร็จ");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("prize-images").getPublicUrl(fileName);

    setValue("image_url", publicUrl);
    toast.success("อัพโหลดรูปรางวัลเรียบร้อย");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-purple-900">{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          id="prize-form"
        >
          <div className="space-y-1.5">
            <Label className="text-purple-800">ชื่อรางวัล *</Label>
            <Input
              {...register("name")}
              className="border-purple-200 focus:ring-purple-500"
              placeholder="เช่น คูปองส่วนลด 500 บาท"
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-purple-800">คำอธิบาย (แสดงใน Popup)</Label>
            <Textarea
              {...register("description")}
              rows={2}
              className="border-purple-200 focus:ring-purple-500"
              placeholder="รายละเอียดรางวัล..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-purple-800">
              จำนวนครั้งที่ต้องหมุนเพื่อชนะ
            </Label>
            <Input
              type="number"
              min={1}
              max={10}
              {...register("wins_required", { valueAsNumber: true })}
              className="border-purple-200 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
            <div>
              <Label className="text-purple-800">คัดออกหลังชนะ</Label>
              <p className="text-xs text-purple-500 mt-0.5">
                เอาชื่อออกจากวงล้อหลังได้รางวัล
              </p>
            </div>
            <Switch
              checked={removeAfterWin}
              onCheckedChange={(v) => setValue("remove_after_win", v)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-purple-800">รูปรางวัล (ไม่จำเป็น)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border-purple-200"
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="รางวัล"
                  className="w-14 h-14 rounded-lg object-cover border border-purple-200 shrink-0"
                />
              )}
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            form="prize-form"
            disabled={isPending}
            className="bg-purple-700 hover:bg-purple-600 text-white"
          >
            {isPending ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PrizeWithWinner extends Prize {
  customers: { name: string } | null;
}

export default function PrizeManager() {
  const { data: prizes = [] } = usePrizes();
  const createPrize = useCreatePrize();
  const updatePrize = useUpdatePrize();
  const deletePrize = useDeletePrize();
  const selectPrize = useSelectPrize();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Prize | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Prize | null>(null);
  const [selectTarget, setSelectTarget] = useState<Prize | null>(null);

  const handleCreate = async (values: PrizeFormValues) => {
    await createPrize.mutateAsync(
      {
        name: values.name,
        description: values.description || null,
        image_url: values.image_url || null,
        wins_required: values.wins_required,
        remove_after_win: values.remove_after_win,
      },
      {
        onSuccess: () => {
          toast.success("เพิ่มรางวัลเรียบร้อย");
          setCreateOpen(false);
        },
        onError: () => toast.error("เพิ่มรางวัลไม่สำเร็จ"),
      },
    );
  };

  const handleEdit = async (values: PrizeFormValues) => {
    if (!editTarget) return;
    await updatePrize.mutateAsync(
      {
        id: editTarget.id,
        name: values.name,
        description: values.description || null,
        image_url: values.image_url || null,
        wins_required: values.wins_required,
        remove_after_win: values.remove_after_win,
      },
      {
        onSuccess: () => {
          toast.success("แก้ไขรางวัลเรียบร้อย");
          setEditTarget(null);
        },
        onError: () => toast.error("แก้ไขรางวัลไม่สำเร็จ"),
      },
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deletePrize.mutateAsync(deleteTarget.id, {
      onSuccess: () => {
        toast.success("ลบรางวัลเรียบร้อย");
        setDeleteTarget(null);
      },
      onError: () => toast.error("ลบรางวัลไม่สำเร็จ"),
    });
  };

  const handleSelect = async () => {
    if (!selectTarget) return;
    await selectPrize.mutateAsync(selectTarget.id, {
      onSuccess: () => {
        toast.success("เลือกรางวัลและรีเซ็ตรายชื่อเรียบร้อย");
        setSelectTarget(null);
      },
      onError: () => toast.error("เลือกรางวัลไม่สำเร็จ"),
    });
  };

  return (
    <Card className="border-purple-100 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Gift className="w-5 h-5" />
            จัดการรางวัล
          </CardTitle>
          <Button
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="bg-purple-700 hover:bg-purple-600 text-white gap-1.5"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรางวัล
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {prizes.length === 0 && (
          <div className="text-center py-10 text-purple-400 text-sm border-2 border-dashed border-purple-100 rounded-xl">
            ยังไม่มีรางวัล — กดปุ่มเพิ่มรางวัลเพื่อเริ่มต้น
          </div>
        )}

        {(prizes as PrizeWithWinner[]).map((prize) => (
          <div
            key={prize.id}
            className={`relative rounded-xl border p-4 transition-colors ${
              prize.is_selected
                ? "border-purple-500 bg-purple-50"
                : "border-purple-100 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              {prize.image_url && (
                <img
                  src={prize.image_url}
                  alt={prize.name}
                  className="w-14 h-14 rounded-lg object-cover border border-purple-100 shrink-0"
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-purple-900 truncate">
                    {prize.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-purple-100 text-purple-700 shrink-0"
                  >
                    ต้องหมุน {prize.wins_required} ครั้ง
                  </Badge>
                  {prize.is_selected && (
                    <Badge className="text-xs bg-purple-600 text-white shrink-0">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      กำลังใช้งาน
                    </Badge>
                  )}
                  {prize.is_won && (
                    <Badge className="text-xs bg-amber-500 text-white shrink-0">
                      <Trophy className="w-3 h-3 mr-1" />
                      มีผู้ชนะแล้ว
                    </Badge>
                  )}
                </div>

                {prize.description && (
                  <p className="text-sm text-purple-600 truncate">
                    {prize.description}
                  </p>
                )}

                {prize.is_won && prize.customers && (
                  <p className="text-xs text-amber-600 mt-1">
                    ผู้ชนะ: {prize.customers.name}
                  </p>
                )}
              </div>

              <div className="flex gap-1.5 shrink-0">
                {!prize.is_won && !prize.is_selected && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs px-2 h-8"
                    onClick={() => setSelectTarget(prize)}
                  >
                    เลือกรางวัลนี้
                  </Button>
                )}
                {!prize.is_won && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                    onClick={() => setEditTarget(prize)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                )}
                {!prize.is_selected && !prize.is_won && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteTarget(prize)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>

      {/* Create dialog */}
      <PrizeFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        title="เพิ่มรางวัลใหม่"
        isPending={createPrize.isPending}
      />

      {/* Edit dialog */}
      {editTarget && (
        <PrizeFormDialog
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          initialValues={{
            name: editTarget.name,
            description: editTarget.description ?? "",
            wins_required: editTarget.wins_required,
            remove_after_win: editTarget.remove_after_win,
            image_url: editTarget.image_url ?? "",
          }}
          onSubmit={handleEdit}
          title="แก้ไขรางวัล"
          isPending={updatePrize.isPending}
        />
      )}

      {/* Select confirmation */}
      <AlertDialog
        open={!!selectTarget}
        onOpenChange={(open) => !open && setSelectTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>เลือกรางวัลนี้?</AlertDialogTitle>
            <AlertDialogDescription>
              การเลือกรางวัล <strong>{selectTarget?.name}</strong>{" "}
              จะรีเซ็ตรายชื่อลูกค้าทั้งหมด (spin_count, is_winner)
              กลับเป็นค่าเริ่มต้น
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSelect}
              className="bg-purple-700 hover:bg-purple-600 text-white"
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบรางวัลนี้?</AlertDialogTitle>
            <AlertDialogDescription>
              ลบ <strong>{deleteTarget?.name}</strong>{" "}
              ออกจากระบบถาวร ไม่สามารถกู้คืนได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
