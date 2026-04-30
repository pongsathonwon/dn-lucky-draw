import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

export default function AdminLoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    setIsPending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm border-purple-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-purple-900 flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            เข้าสู่ระบบ Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-purple-800">
                อีเมล
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="border-purple-200 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-purple-800">
                รหัสผ่าน
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-purple-200 focus:ring-purple-500"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-purple-700 hover:bg-purple-600 text-white"
            >
              {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
