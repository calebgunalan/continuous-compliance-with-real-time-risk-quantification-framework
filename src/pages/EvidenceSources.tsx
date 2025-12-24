import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Cloud, 
  Server, 
  Key, 
  Database, 
  Shield, 
  Plus, 
  Check, 
  X, 
  RefreshCw,
  Loader2,
  Settings,
  Trash2,
  Power,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useEvidenceSources, useCreateEvidenceSource, useToggleEvidenceSource, useDeleteEvidenceSource } from "@/hooks/useEvidenceSources";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";

const connectorTypes = [
  { 
    id: "aws", 
    name: "Amazon Web Services", 
    icon: Cloud, 
    color: "text-[#FF9900]",
    bgColor: "bg-[#FF9900]/10",
    description: "CloudTrail, IAM, Security Groups, S3 policies"
  },
  { 
    id: "azure", 
    name: "Microsoft Azure", 
    icon: Cloud, 
    color: "text-[#0078D4]",
    bgColor: "bg-[#0078D4]/10",
    description: "Activity Logs, Entra ID, NSG rules, Azure Policy"
  },
  { 
    id: "gcp", 
    name: "Google Cloud Platform", 
    icon: Cloud, 
    color: "text-[#4285F4]",
    bgColor: "bg-[#4285F4]/10",
    description: "Cloud Logging, IAM, Firewall rules, Cloud Armor"
  },
  { 
    id: "okta", 
    name: "Okta", 
    icon: Key, 
    color: "text-[#007DC1]",
    bgColor: "bg-[#007DC1]/10",
    description: "User management, MFA status, authentication logs"
  },
  { 
    id: "azure_ad", 
    name: "Microsoft Entra ID", 
    icon: Key, 
    color: "text-[#0078D4]",
    bgColor: "bg-[#0078D4]/10",
    description: "User accounts, group memberships, security events"
  },
  { 
    id: "crowdstrike", 
    name: "CrowdStrike", 
    icon: Shield, 
    color: "text-[#E01E5A]",
    bgColor: "bg-[#E01E5A]/10",
    description: "Endpoint protection status, threat detections"
  },
  { 
    id: "splunk", 
    name: "Splunk", 
    icon: Database, 
    color: "text-[#65A637]",
    bgColor: "bg-[#65A637]/10",
    description: "SIEM logs, security alerts, compliance events"
  },
  { 
    id: "custom", 
    name: "Custom API", 
    icon: Server, 
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "Custom REST API integration for proprietary systems"
  },
];

export default function EvidenceSourcesPage() {
  const { organizationId } = useOrganizationContext();
  const { data: sources, isLoading } = useEvidenceSources(organizationId || "");
  const createSource = useCreateEvidenceSource();
  const toggleSource = useToggleEvidenceSource();
  const deleteSource = useDeleteEvidenceSource();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [sourceName, setSourceName] = useState("");

  const handleAddSource = async () => {
    if (!organizationId || !selectedType || !sourceName) return;

    try {
      await createSource.mutateAsync({
        organization_id: organizationId,
        name: sourceName,
        source_type: selectedType,
        connection_config: {},
      });
      toast.success("Evidence source added successfully");
      setIsAddDialogOpen(false);
      setSelectedType("");
      setSourceName("");
    } catch (error) {
      toast.error("Failed to add evidence source");
    }
  };

  const handleToggleSource = async (id: string, currentState: boolean) => {
    if (!organizationId) return;
    try {
      await toggleSource.mutateAsync({ id, is_active: !currentState, organization_id: organizationId });
      toast.success(currentState ? "Source deactivated" : "Source activated");
    } catch (error) {
      toast.error("Failed to update source");
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!organizationId) return;
    try {
      await deleteSource.mutateAsync({ id, organization_id: organizationId });
      toast.success("Evidence source deleted");
    } catch (error) {
      toast.error("Failed to delete source");
    }
  };

  const getConnectorInfo = (sourceType: string) => {
    return connectorTypes.find(c => c.id === sourceType) || connectorTypes[connectorTypes.length - 1];
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Evidence Sources
          </h1>
          <p className="mt-1 text-muted-foreground">
            Configure integrations for automated evidence collection
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Evidence Source</DialogTitle>
              <DialogDescription>
                Connect a new platform for automated evidence collection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="source-type">Platform</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform type" />
                  </SelectTrigger>
                  <SelectContent>
                    {connectorTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", type.color)} />
                            <span>{type.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source-name">Display Name</Label>
                <Input
                  id="source-name"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g., Production AWS Account"
                />
              </div>
              {selectedType && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    {getConnectorInfo(selectedType).description}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddSource} 
                disabled={!selectedType || !sourceName || createSource.isPending}
              >
                {createSource.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Source
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <div className="metric-card py-4 animate-slide-up">
          <p className="text-sm text-muted-foreground">Total Sources</p>
          <p className="text-2xl font-bold text-foreground">{sources?.length || 0}</p>
        </div>
        <div className="metric-card py-4 animate-slide-up" style={{ animationDelay: "50ms" }}>
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-success">
            {sources?.filter(s => s.is_active).length || 0}
          </p>
        </div>
        <div className="metric-card py-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="text-2xl font-bold text-muted-foreground">
            {sources?.filter(s => !s.is_active).length || 0}
          </p>
        </div>
        <div className="metric-card py-4 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <p className="text-sm text-muted-foreground">Last Collection</p>
          <p className="text-lg font-bold text-foreground">
            {sources?.[0]?.last_collection_at 
              ? formatDistanceToNow(parseISO(sources[0].last_collection_at), { addSuffix: true })
              : "Never"}
          </p>
        </div>
      </div>

      {/* Available Connectors */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Available Connectors</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {connectorTypes.slice(0, -1).map((connector, index) => {
            const Icon = connector.icon;
            const isConnected = sources?.some(s => s.source_type === connector.id);
            return (
              <div
                key={connector.id}
                className={cn(
                  "metric-card cursor-pointer group animate-slide-up transition-all",
                  isConnected && "border-success/50"
                )}
                style={{ animationDelay: `${200 + index * 50}ms` }}
                onClick={() => {
                  setSelectedType(connector.id);
                  setSourceName(`${connector.name} Integration`);
                  setIsAddDialogOpen(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", connector.bgColor)}>
                    <Icon className={cn("h-5 w-5", connector.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{connector.name}</p>
                    {isConnected ? (
                      <div className="flex items-center gap-1 text-success text-xs">
                        <Check className="h-3 w-3" />
                        Connected
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Click to connect</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connected Sources */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Connected Sources</h2>
        {sources && sources.length > 0 ? (
          <div className="space-y-3">
            {sources.map((source, index) => {
              const connectorInfo = getConnectorInfo(source.source_type);
              const Icon = connectorInfo.icon;
              return (
                <div
                  key={source.id}
                  className="metric-card animate-slide-up"
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", connectorInfo.bgColor)}>
                        <Icon className={cn("h-6 w-6", connectorInfo.color)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{source.name}</h3>
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                            source.is_active 
                              ? "bg-success/15 text-success" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {source.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{connectorInfo.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {source.last_collection_at 
                            ? `Last collection: ${formatDistanceToNow(parseISO(source.last_collection_at), { addSuffix: true })}`
                            : "No data collected yet"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Power className="h-4 w-4 text-muted-foreground" />
                        <Switch
                          checked={source.is_active}
                          onCheckedChange={() => handleToggleSource(source.id, source.is_active)}
                        />
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteSource(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="metric-card text-center py-12 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Evidence Sources Connected</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Connect your cloud platforms, identity providers, and security tools to enable continuous compliance monitoring.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Source
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
