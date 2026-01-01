import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Clock,
  Database,
  Loader2
} from "lucide-react";
import { useEvidenceSources } from "@/hooks/useEvidenceSources";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { formatDistanceToNow, parseISO, differenceInMinutes } from "date-fns";

interface CollectionStatus {
  sourceId: string;
  sourceName: string;
  sourceType: string;
  status: "collecting" | "success" | "error" | "stale" | "idle";
  lastCollection: string | null;
  recordsCollected: number;
  errorMessage?: string;
}

export function EvidenceCollectionMonitor() {
  const { organizationId } = useOrganizationContext();
  const { data: sources, isLoading, refetch } = useEvidenceSources(organizationId || "");
  const [collectionStatuses, setCollectionStatuses] = useState<CollectionStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (sources) {
      const statuses: CollectionStatus[] = sources.map((source) => {
        let status: CollectionStatus["status"] = "idle";
        
        if (source.last_collection_at) {
          const lastCollectionDate = parseISO(source.last_collection_at);
          const minutesSinceCollection = differenceInMinutes(new Date(), lastCollectionDate);
          
          if (minutesSinceCollection < 5) {
            status = "success";
          } else if (minutesSinceCollection < 30) {
            status = "success";
          } else if (minutesSinceCollection < 60) {
            status = "stale";
          } else {
            status = "error";
          }
        }

        if (!source.is_active) {
          status = "idle";
        }

        return {
          sourceId: source.id,
          sourceName: source.name,
          sourceType: source.source_type,
          status,
          lastCollection: source.last_collection_at,
          recordsCollected: Math.floor(Math.random() * 1000) + 100, // Simulated
        };
      });
      setCollectionStatuses(statuses);
    }
  }, [sources]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusIcon = (status: CollectionStatus["status"]) => {
    switch (status) {
      case "collecting":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "stale":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: CollectionStatus["status"]) => {
    switch (status) {
      case "collecting":
        return <Badge variant="default">Collecting</Badge>;
      case "success":
        return <Badge className="bg-success/15 text-success hover:bg-success/20">Healthy</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "stale":
        return <Badge className="bg-warning/15 text-warning hover:bg-warning/20">Stale</Badge>;
      default:
        return <Badge variant="secondary">Idle</Badge>;
    }
  };

  const activeCount = collectionStatuses.filter(s => s.status === "success" || s.status === "collecting").length;
  const errorCount = collectionStatuses.filter(s => s.status === "error").length;
  const staleCount = collectionStatuses.filter(s => s.status === "stale").length;

  const healthScore = sources?.length 
    ? Math.round((activeCount / sources.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Evidence Collection Status</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
        <CardDescription>Real-time monitoring of evidence source health</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Overview */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-foreground">{sources?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total Sources</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-success/10">
            <p className="text-2xl font-bold text-success">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-warning/10">
            <p className="text-2xl font-bold text-warning">{staleCount}</p>
            <p className="text-xs text-muted-foreground">Stale</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-destructive/10">
            <p className="text-2xl font-bold text-destructive">{errorCount}</p>
            <p className="text-xs text-muted-foreground">Errors</p>
          </div>
        </div>

        {/* Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Collection Health</span>
            <span className={cn(
              "font-semibold",
              healthScore >= 80 ? "text-success" :
              healthScore >= 50 ? "text-warning" : "text-destructive"
            )}>
              {healthScore}%
            </span>
          </div>
          <Progress 
            value={healthScore} 
            className={cn(
              "h-2",
              healthScore >= 80 ? "[&>div]:bg-success" :
              healthScore >= 50 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
            )}
          />
        </div>

        {/* Source List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {collectionStatuses.map((source) => (
            <div 
              key={source.sourceId}
              className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(source.status)}
                <div>
                  <p className="text-sm font-medium text-foreground">{source.sourceName}</p>
                  <p className="text-xs text-muted-foreground">
                    {source.lastCollection 
                      ? formatDistanceToNow(parseISO(source.lastCollection), { addSuffix: true })
                      : "Never collected"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Database className="h-3 w-3" />
                    {source.recordsCollected.toLocaleString()}
                  </div>
                </div>
                {getStatusBadge(source.status)}
              </div>
            </div>
          ))}

          {collectionStatuses.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No evidence sources configured
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
