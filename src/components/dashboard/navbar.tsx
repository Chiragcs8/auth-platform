"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import type { AuthSession } from "@/types";

interface NavbarProps {
  session: AuthSession;
  onMobileMenuToggle?: () => void;
}

export function Navbar({ session, onMobileMenuToggle }: NavbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
      }
    } catch {
      // Force redirect even on error
      router.push("/login");
    } finally {
      setLoggingOut(false);
      setDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="hidden md:flex items-center gap-2 ml-2 px-2 py-1 rounded-md hover:bg-accent transition-colors"
            >
              <Avatar src={null} alt={session.fullName} size="sm" />
              <span className="text-sm font-medium">{session.fullName}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>

            {/* Mobile avatar (no dropdown, just opens menu) */}
            <div className="md:hidden">
              <Avatar src={null} alt={session.fullName} size="sm" />
            </div>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-background shadow-lg z-50 overflow-hidden">
                {/* User info header */}
                <div className="px-4 py-3 border-b bg-accent/50">
                  <p className="text-sm font-medium">{session.fullName}</p>
                  <p className="text-xs text-muted-foreground">{session.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">{session.roleName}</p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push(`${session.roleName === "Admin" ? "/admin" : session.roleName === "Vendor" ? "/vendor" : session.roleName === "Client" ? "/client" : session.roleName === "Support Staff" ? "/support" : "/broker"}/profile`);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? "Logging out..." : "Log out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}