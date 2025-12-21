import { cn } from "@/lib/utils";

interface MaturityIndicatorProps {
  level: number;
  maxLevel?: number;
  showLabels?: boolean;
  className?: string;
}

const maturityLabels = [
  { level: 1, label: "Reactive", description: "Minimal formal processes" },
  { level: 2, label: "Repeatable", description: "Documented but inconsistent" },
  { level: 3, label: "Defined", description: "Standardized processes" },
  { level: 4, label: "Managed", description: "Measured and optimized" },
  { level: 5, label: "Optimized", description: "Predictive and automated" },
];

export function MaturityIndicator({
  level,
  maxLevel = 5,
  showLabels = true,
  className,
}: MaturityIndicatorProps) {
  const currentInfo = maturityLabels.find((m) => m.level === Math.floor(level));

  const getSegmentColor = (segmentLevel: number) => {
    if (segmentLevel <= Math.floor(level)) {
      if (segmentLevel === 1) return "bg-maturity-1";
      if (segmentLevel === 2) return "bg-maturity-2";
      if (segmentLevel === 3) return "bg-maturity-3";
      if (segmentLevel === 4) return "bg-maturity-4";
      if (segmentLevel === 5) return "bg-maturity-5";
    }
    return "bg-muted";
  };

  const getGlowClass = () => {
    if (level >= 4.5) return "shadow-glow";
    if (level >= 3.5) return "shadow-glow-success";
    if (level >= 2.5) return "shadow-glow-warning";
    return "";
  };

  return (
    <div className={cn("", className)}>
      <div className="flex flex-col items-center">
        {/* Main Level Indicator */}
        <div
          className={cn(
            "relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/30",
            getGlowClass()
          )}
        >
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-transparent" />
          <div className="relative flex flex-col items-center">
            <span className="text-4xl font-bold text-foreground">{level.toFixed(1)}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Level</span>
          </div>
        </div>

        {showLabels && currentInfo && (
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold text-foreground">{currentInfo.label}</p>
            <p className="text-sm text-muted-foreground">{currentInfo.description}</p>
          </div>
        )}

        {/* Progress Segments */}
        <div className="mt-6 flex gap-2">
          {Array.from({ length: maxLevel }, (_, i) => i + 1).map((segmentLevel) => (
            <div key={segmentLevel} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "h-2 w-10 rounded-full transition-colors duration-500",
                  getSegmentColor(segmentLevel)
                )}
              />
              <span className="text-[10px] text-muted-foreground">{segmentLevel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
