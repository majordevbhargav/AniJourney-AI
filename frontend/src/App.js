import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";

import Landing from "@/pages/Landing";
import { LoginPage, RegisterPage } from "@/pages/Auth";
import Explore from "@/pages/Explore";
import AnimeDetail from "@/pages/AnimeDetail";
import MapView from "@/pages/MapView";
import Planner from "@/pages/Planner";
import Companion from "@/pages/Companion";
import Food from "@/pages/Food";
import Passport from "@/pages/Passport";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0A0D14] text-zinc-500 flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Toaster theme="dark" position="top-right" toastOptions={{
            style: { background: "#121620", border: "1px solid rgba(244,197,214,0.3)", color: "#F8FAFC" }
          }} />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/anime/:id" element={<AnimeDetail />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/companion" element={<Protected><Companion /></Protected>} />
            <Route path="/food" element={<Food />} />
            <Route path="/passport" element={<Protected><Passport /></Protected>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
