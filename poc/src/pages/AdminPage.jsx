import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Users,
  Settings,
  Save,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CustomerManager from "@/components/admin/CustomerManager";
import SpinSettingsForm from "@/components/admin/SpinSettingsForm";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-purple-100 px-4 md:px-8 py-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-purple-700 hover:bg-purple-50"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-purple-900">จัดการระบบ</h1>
              <p className="text-sm text-purple-500">
                ตั้งค่าวงล้อจับฉลาก DN Center
              </p>
            </div>
          </div>
          <img
            src="https://media.base44.com/images/public/user_69e9e496e533f666d146d362/bcbffd7ce_Gemini_Generated_Image_aoc5swaoc5swaoc5.png"
            alt="DN Center"
            className="h-10 object-contain"
          />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <SpinSettingsForm />
        <CustomerManager />
      </main>
    </div>
  );
}
