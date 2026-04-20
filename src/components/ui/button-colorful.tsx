import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface ButtonColorfulProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function ButtonColorful({
  className,
  label = "Explore Components",
  size = "default",
  ...props
}: ButtonColorfulProps) {
  const sizeClasses = {
    default: "h-10 px-4",
    sm: "h-9 px-3",
    lg: "h-11 px-6",
    icon: "h-10 w-10",
  };

  return (
    <Button
      className={cn(
        "relative overflow-hidden",
        sizeClasses[size],
        "bg-zinc-900 dark:bg-zinc-100",
        "transition-all duration-200",
        "group",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0",
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
          "opacity-40 group-hover:opacity-80",
          "blur transition-opacity duration-500"
        )}
      />

      <div className="relative flex items-center justify-center gap-2">
        <span className="text-white dark:text-zinc-900">{label}</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-white/90 dark:text-zinc-900/90" />
      </div>
    </Button>
  );
}
