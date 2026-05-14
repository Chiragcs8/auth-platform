"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Remove the role prefix from display
  const displaySegments = segments.length > 1 ? segments.slice(1) : segments;

  return (
    <nav className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}>
      <Link
        href={`/${segments[0]}/dashboard`}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>
      {displaySegments.map((segment, index) => {
        const href = `/${segments[0]}/${displaySegments.slice(0, index + 1).join("/")}`;
        const isLast = index === displaySegments.length - 1;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

        return (
          <div key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}