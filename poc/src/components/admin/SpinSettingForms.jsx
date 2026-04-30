import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

export default function SpinSettingsForm() {
  const queryClient = useQueryClient();
  const { data: settingsArr = [], isLoading } = useQuery({
    queryKey: ["spinSettings"],
    queryFn: () => base44.entities.SpinSettings.list(),
  });

  const existingSettings = settingsArr[0];

  const [form, setForm] = useState({
    spin_duration: 5,
    remove_after_win: false,
    prize_text: "🎉 ยินดีด้วย! คุณได้รับรางวัลพิเศษ!",
    prize_image_url: "",
  });

  useEffect(() => {
    if (existingSettings) {
      setForm({
        spin_duration: existingSettings.spin_duration || 5,
        remove_after_win: existingSettings.remove_after_win || false,
        prize_text:
          existingSettings.prize_text || "🎉 ยินดีด้วย! คุณได้รับรางวัลพิเศษ!",
        prize_image_url: existingSettings.prize_image_url || "",
      });
    }
  }, [existingSettings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingSettings) {
        return base44.entities.SpinSettings.update(existingSettings.id, data);
      } else {
        return base44.entities.SpinSettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spinSettings"] });
      toast.success("บันทึกการตั้งค่าเรียบร้อย");
    },
  });

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((prev) => ({ ...prev, prize_image_url: file_url }));
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
                  spin_duration: parseInt(e.target.value) || 5,
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
          disabled={saveMutation.isPending}
          className="bg-purple-700 hover:bg-purple-600 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </Button>
      </CardContent>
    </Card>
  );
}
