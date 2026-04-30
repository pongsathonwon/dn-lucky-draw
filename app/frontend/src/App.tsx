import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/AuthContext";
import { queryClient } from "@/lib/queryClient";
import SpinPage from "@/pages/SpinPage";
import AdminPage from "@/pages/AdminPage";
import PageNotFound from "@/pages/PageNotFound";

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<SpinPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
