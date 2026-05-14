"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Shield,
  Activity,
  UserCircle,
  Lock,
  Key,
  BarChart3,
  TicketCheck,
  Search,
  Handshake,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { SidebarItem, AuthSession } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Shield,
  Activity,
  UserCircle,
  Lock,
  Key,
  BarChart3,
  TicketCheck,
  Search,
  Handshake,
};

interface SidebarProps {
  items: SidebarItem[];
  session: AuthSession;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ items, session, collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 h-screen border-r bg-sidebar-background text-sidebar-foreground flex flex-col"
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">AP</span>
                </div>
                <span className="font-semibold text-lg">AuthPlatform</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AP</span>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => onCollapsedChange?.(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && item.badge && (
                    <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info + Logout */}
      <div className="border-t border-sidebar-border p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar
            src={null}
            alt={session.fullName}
            size="sm"
          />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium truncate">{session.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{session.roleName}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-red-500"
              onClick={handleLogout}
              disabled={loggingOut}
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mt-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-red-500 w-full"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.aside>
  );
}