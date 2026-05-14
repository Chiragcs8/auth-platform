"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { PageTransition } from "@/components/ui/page-transition";
import type { SidebarItem, AuthSession } from "@/types";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  session: AuthSession;
}

export function DashboardShell({ children, sidebarItems, session }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          items={sidebarItems}
          session={session}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50">
            <Sidebar
              items={sidebarItems}
              session={session}
              collapsed={false}
              onCollapsedChange={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className="transition-all duration-200"
        style={{
          marginLeft: collapsed ? 64 : 256,
        }}
      >
        <div className="md:hidden">
          {/* On mobile, no margin-left */}
        </div>
        <Navbar session={session} onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="p-4 md:p-6">
          <Breadcrumbs className="mb-4" />
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}