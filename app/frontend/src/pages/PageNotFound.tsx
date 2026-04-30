import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 gap-4">
      <h1 className="text-6xl font-black text-purple-200">404</h1>
      <p className="text-purple-700 font-semibold text-lg">ไม่พบหน้าที่ต้องการ</p>
      <Link to="/">
        <Button className="bg-purple-700 hover:bg-purple-600 text-white">
          กลับหน้าหลัก
        </Button>
      </Link>
    </div>
  );
}
