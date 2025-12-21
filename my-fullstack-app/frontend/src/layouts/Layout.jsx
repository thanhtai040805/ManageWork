// src/layouts/Layout.jsx
import { Header } from "../components/Header";
import { VerticalNav } from "../components/VerticleNav";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        <VerticalNav />
        <main className="flex-1 bg-gray-50 p-6">
          {/* Nơi render các page con */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
