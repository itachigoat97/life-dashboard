"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { DataProvider } from "@/lib/data-context";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <DataProvider>
      <div className="min-h-screen bg-[#0a0a0a]">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
        <main className="pb-20 md:pb-0 min-h-screen">
          <div
            className="hidden md:block"
            style={{ paddingLeft: collapsed ? 72 : 240, transition: "padding-left 0.2s ease-in-out" }}
          >
            <div className="max-w-6xl mx-auto px-8 py-8">
              {children}
            </div>
          </div>
          <div className="md:hidden">
            <div className="max-w-6xl mx-auto px-4 py-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </DataProvider>
  );
}
