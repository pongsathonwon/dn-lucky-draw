import React, { useState, useEffect } from "react";
import {
  useSpinSettings,
  useUpdateSpinSettings,
} from "@/hooks/useSpinSettings";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

interface FormState {
  spin_duration: number;
  remove_after_win: boolean;
  prize_text: string;
  prize_image_url: string;
}

export default function SpinSettingsForm() {
  const { data: settings, isLoading } = useSpinSettings();
  const updateSettings = useUpdateSpinSettings();

  const [form, setForm] = useState<FormState>({
    spin_duration: 5,
    remove_after_win: false,
    prize_text: "🎉 ยินดีด้วย! คุณได้รับรางวัลพิเศษ!",
    prize_image_url: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        spin_duration: settings.spin_duration ?? 5,
        remove_after_win: settings.remove_after_win ?? false,
        prize_text:
          settings.prize_text ?? "🎉 ยินดีด้วย! คุณได้รับรางวัลพิเศษ!",
        prize_image_url: settings.prize_image_url ?? "",
      });
    }
  }, [settings]);

  const handleSave = () => {
    if (!settings) return;
    updateSettings.mutate(
      {
        id: settings.id,
        spin_duration: form.spin_duration,
        remove_after_win: form.remove_after_win,
        prize_text: form.prize_text || null,
        prize_image_url: form.prize_image_url || null,
      },
      {
        onSuccess: () => toast.success("บันทึกการตั้งค่าเรียบร้อย"),
        onError: () => toast.error("บันทึกไม่สำเร็จ"),
      },
    );
  };

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

    setForm((prev) => ({ ...prev, prize_image_url: publicUrl }));
    toast.success("อัพโหลดรูปรางวัลเรียบร้อย");
  };

  if (isLoading) return null;

  return (
    <Card className="border-purple-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Settings className="w-5 h-5" />
          ตั้งค่าวงล้อ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-purple-800">
              ระยะเวลาหมุน (วินาที)
            </Label>
            <Input
              id="duration"
              type="number"
              min={1}
              max={30}
              value={form.spin_duration}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  spin_duration: Number.parseInt(e.target.value) || 5,
                }))
              }
              className="border-purple-200 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
            <div>
              <Label className="text-purple-800">คัดออกหลังชนะ</Label>
              <p className="text-xs text-purple-500 mt-1">
                เอาชื่อออกจากวงล้อหลังได้รางวัล
              </p>
            </div>
            <Switch
              checked={form.remove_after_win}
              onCheckedChange={(v) =>
                setForm((prev) => ({ ...prev, remove_after_win: v }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prize" className="text-purple-800">
            ข้อความรางวัล (แสดงใน Popup)
          </Label>
          <Textarea
            id="prize"
            value={form.prize_text}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, prize_text: e.target.value }))
            }
            rows={3}
            className="border-purple-200 focus:ring-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-purple-800">รูปรางวัล (ไม่จำเป็น)</Label>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="border-purple-200"
            />
            {form.prize_image_url && (
              <img
                src={form.prize_image_url}
                alt="รางวัล"
                className="w-16 h-16 rounded-lg object-cover border border-purple-200"
              />
            )}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="bg-purple-700 hover:bg-purple-600 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateSettings.isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </Button>
      </CardContent>
    </Card>
  );
}
