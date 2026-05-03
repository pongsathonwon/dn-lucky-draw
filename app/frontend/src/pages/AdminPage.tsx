import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import SpinSettingsForm from "@/components/admin/SpinSettingsForm";
import CustomerManager from "@/components/admin/CustomerManager";
import PrizeManager from "@/components/admin/PrizeManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";

export default function AdminPage() {
  const { session, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AdminLoginForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-purple-500 hover:text-purple-700 hover:bg-purple-50 gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <PrizeManager />
        <SpinSettingsForm />
        <CustomerManager />
      </main>
    </div>
  );
}
