import { cn } from "@/lib/utils";

interface ComplianceGaugeProps {
  value: number;
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ComplianceGauge({
  value,
  label,
  size = "md",
  className,
}: ComplianceGaugeProps) {
  const sizeStyles = {
    sm: { container: "w-24 h-24", stroke: 6, text: "text-lg" },
    md: { container: "w-36 h-36", stroke: 8, text: "text-2xl" },
    lg: { container: "w-48 h-48", stroke: 10, text: "text-3xl" },
  };

  const styles = sizeStyles[size];
  const radius = 50 - styles.stroke / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 85) return "hsl(var(--success))";
    if (val >= 70) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getGlowClass = (val: number) => {
    if (val >= 85) return "drop-shadow-[0_0_12px_hsl(var(--success)/0.5)]";
    if (val >= 70) return "drop-shadow-[0_0_12px_hsl(var(--warning)/0.5)]";
    return "drop-shadow-[0_0_12px_hsl(var(--destructive)/0.5)]";
  };

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className={cn("relative", styles.container)}>
        <svg
          className={cn("transform -rotate-90", getGlowClass(value))}
          viewBox="0 0 100 100"
        >
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={styles.stroke}
          />
          {/* Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={getColor(value)}
            strokeWidth={styles.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold text-foreground", styles.text)}>
            {value}%
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
