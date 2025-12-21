import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "critical" | "primary";
  className?: string;
  delay?: number;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
  delay = 0,
}: MetricCardProps) {
  const variantStyles = {
    default: {
      icon: "bg-muted text-muted-foreground",
      glow: "",
    },
    success: {
      icon: "bg-success/15 text-success",
      glow: "glow-success",
    },
    warning: {
      icon: "bg-warning/15 text-warning",
      glow: "glow-warning",
    },
    critical: {
      icon: "bg-destructive/15 text-destructive",
      glow: "glow-critical",
    },
    primary: {
      icon: "bg-primary/15 text-primary",
      glow: "glow-primary",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "metric-card group cursor-default animate-slide-up",
        styles.glow,
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", styles.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              trend.isPositive
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <p className="mt-2 text-xs text-muted-foreground">{trend.label}</p>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute -inset-px rounded-xl bg-gradient-primary opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-10" />
    </div>
  );
}
