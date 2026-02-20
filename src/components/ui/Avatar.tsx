import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { getInitials } from "@/lib/utils/formatters";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; px: number }> = {
  xs: { container: "h-6 w-6",  text: "text-[10px]", px: 24  },
  sm: { container: "h-8 w-8",  text: "text-xs",     px: 32  },
  md: { container: "h-10 w-10",text: "text-sm",     px: 40  },
  lg: { container: "h-14 w-14",text: "text-lg",     px: 56  },
  xl: { container: "h-20 w-20",text: "text-2xl",    px: 80  },
};

export function Avatar({ src, name = "", size = "md", className }: AvatarProps) {
  const { container, text, px } = sizeStyles[size];
  const initials = getInitials(name);

  if (src) {
    return (
      <div className={cn("relative rounded-full overflow-hidden flex-shrink-0", container, className)}>
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes={`${px}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gold-500 text-navy-900 font-bold flex-shrink-0",
        container,
        text,
        className
      )}
    >
      {initials || "?"}
    </div>
  );
}
