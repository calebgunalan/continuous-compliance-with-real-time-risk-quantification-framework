import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, AlertTriangle, Zap, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateCascadeRisk, simulateControlFailure, type GraphNode, type GraphEdge } from "@/lib/controlDependencyGraph";
import { cn } from "@/lib/utils";

interface CascadeFailureAnalyzerProps {
  controls: Array<{
    id: string;
    name: string;
    passRate: number;
    category: string;
  }>;
  dependencies?: Array<{
    parentId: string;
    childId: string;
    strength: number;
    type: string;
  }>;
  className?: string;
}

// Generate sample dependencies if none provided
function generateSampleDependencies(controls: CascadeFailureAnalyzerProps['controls']): GraphEdge[] {
  if (controls.length < 2) return [];
  const edges: GraphEdge[] = [];
  const categories = [...new Set(controls.map(c => c.category))];
  
  // Create inter-category dependencies
  for (let i = 0; i < controls.length; i++) {
    for (let j = i + 1; j < controls.length && j < i + 3; j++) {
      if (controls[i].category !== controls[j].category || Math.random() > 0.5) {
        edges.push({
          parentId: controls[i].id,
          childId: controls[j].id,
          strength: 0.3 + Math.random() * 0.5,
          type: controls[i].category === controls[j].category ? 'functional' : 'operational',
        });
      }
    }
  }
  return edges.slice(0, Math.min(edges.length, controls.length * 2));
}

export function CascadeFailureAnalyzer({ controls, dependencies, className }: CascadeFailureAnalyzerProps) {
  const [selectedControl, setSelectedControl] = useState<string>("");
  const [showSimulation, setShowSimulation] = useState(false);

  const nodes: GraphNode[] = useMemo(() => controls.map(c => ({
    id: c.id,
    name: c.name,
    passRate: c.passRate,
    failureProbability: 1 - c.passRate / 100,
    cascadeRisk: 0,
    depth: 0,
    category: c.category,
  })), [controls]);

  const edges = useMemo(
    () => dependencies?.map(d => ({
      parentId: d.parentId,
      childId: d.childId,
      strength: d.strength,
      type: d.type,
    })) || generateSampleDependencies(controls),
    [dependencies, controls]
  );

  const cascadeResult = useMemo(
    () => calculateCascadeRisk(nodes, edges),
    [nodes, edges]
  );

  const whatIfResult = useMemo(() => {
    if (!selectedControl || !showSimulation) return null;
    return simulateControlFailure(nodes, edges, selectedControl);
  }, [nodes, edges, selectedControl, showSimulation]);

  const getRiskColor = (risk: number) => {
    if (risk >= 0.7) return 'text-destructive';
    if (risk >= 0.4) return 'text-warning';
    return 'text-success';
  };

  const getRiskBg = (risk: number) => {
    if (risk >= 0.7) return 'bg-destructive/15';
    if (risk >= 0.4) return 'bg-warning/15';
    return 'bg-success/15';
  };

  return (
    <Card className={cn("animate-slide-up", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Cascade Failure Analysis</CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Models control dependencies as a DAG. The CRP algorithm propagates failure probabilities through the graph to predict cascade risks.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-muted/30 p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Avg Cascade Risk</p>
            <p className={cn("text-lg font-bold", getRiskColor(cascadeResult.totalCascadeRisk))}>
              {(cascadeResult.totalCascadeRisk * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Dependencies</p>
            <p className="text-lg font-bold text-foreground">{edges.length}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3 text-center">
            <p className="text-[11px] text-muted-foreground">Max Depth</p>
            <p className="text-lg font-bold text-foreground">{cascadeResult.cascadeDepth}</p>
          </div>
        </div>

        {/* Most Vulnerable Control */}
        {cascadeResult.mostVulnerableNode && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Highest Cascade Risk</p>
              <p className="text-sm font-medium text-foreground truncate">
                {cascadeResult.mostVulnerableNode.name}
              </p>
            </div>
            <span className="text-sm font-bold text-destructive">
              {(cascadeResult.mostVulnerableNode.cascadeRisk * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Top Cascade Risks */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {cascadeResult.nodes
            .sort((a, b) => b.cascadeRisk - a.cascadeRisk)
            .slice(0, 8)
            .map(node => (
              <div key={node.id} className="flex items-center gap-2 py-1.5">
                <div className={cn("h-2 w-2 rounded-full flex-shrink-0", getRiskBg(node.cascadeRisk).replace('/15', ''))} />
                <span className="text-xs text-foreground truncate flex-1">{node.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    own: {((1 - node.passRate / 100) * 100).toFixed(0)}%
                  </span>
                  <span className={cn("text-xs font-semibold", getRiskColor(node.cascadeRisk))}>
                    {(node.cascadeRisk * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* What-If Simulation */}
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-xs font-medium text-foreground flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" /> What-If Simulation
          </p>
          <div className="flex gap-2">
            <Select value={selectedControl} onValueChange={setSelectedControl}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Select control to fail..." />
              </SelectTrigger>
              <SelectContent>
                {controls.map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs"
              disabled={!selectedControl}
              onClick={() => setShowSimulation(true)}
            >
              Simulate
            </Button>
          </div>

          {whatIfResult && whatIfResult.affectedControls.length > 0 && (
            <div className="space-y-1.5 rounded-lg bg-destructive/5 border border-destructive/20 p-2.5">
              <p className="text-xs text-destructive font-medium">
                {whatIfResult.affectedControls.length} controls affected
              </p>
              {whatIfResult.affectedControls.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="text-foreground truncate">{c.name}</span>
                  <span className="text-destructive font-medium">
                    +{(c.riskIncrease * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
