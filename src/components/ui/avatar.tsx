import * as React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    const [hasImage, setHasImage] = React.useState(Boolean(src));
    const initials = fallback ? fallback.slice(0, 2).toUpperCase() : alt ? getInitials(alt) : "U";

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full overflow-hidden bg-muted",
          sizeMap[size],
          className
        )}
        {...props}
      >
        {hasImage && src ? (
          <img
            src={src}
            alt={alt || "Avatar"}
            className="h-full w-full object-cover"
            onError={() => setHasImage(false)}
          />
        ) : (
          <span className="font-medium text-muted-foreground">{initials}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };