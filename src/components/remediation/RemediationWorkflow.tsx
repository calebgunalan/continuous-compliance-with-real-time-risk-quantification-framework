import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wrench, 
  Plus, 
  Clock, 
  User, 
  CheckCircle, 
  AlertTriangle,
  MessageSquare,
  Calendar,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Remediation {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  organization_control_id: string;
  root_cause: string | null;
  remediation_plan: string | null;
}

export function RemediationWorkflow() {
  const { organizationId } = useOrganizationContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRemediation, setSelectedRemediation] = useState<Remediation | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Fetch remediations
  const { data: remediations, isLoading } = useQuery({
    queryKey: ['remediations', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('control_remediations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Remediation[];
    },
    enabled: !!organizationId,
  });

  // Fetch failed controls for new remediation
  const { data: failedControls } = useQuery({
    queryKey: ['failed-controls', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_controls')
        .select('id, control_id, current_status, controls(name)')
        .eq('organization_id', organizationId)
        .in('current_status', ['fail', 'warning']);
      
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  // Fetch comments for selected remediation
  const { data: comments } = useQuery({
    queryKey: ['remediation-comments', selectedRemediation?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('remediation_comments')
        .select('*')
        .eq('remediation_id', selectedRemediation?.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedRemediation?.id,
  });

  // Update remediation status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('control_remediations')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remediations'] });
      toast({ title: 'Status Updated', description: 'Remediation status has been updated.' });
    },
  });

  // Add comment
  const addComment = useMutation({
    mutationFn: async ({ remediationId, comment }: { remediationId: string; comment: string }) => {
      const { error } = await supabase
        .from('remediation_comments')
        .insert({
          remediation_id: remediationId,
          comment,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remediation-comments'] });
      setNewComment("");
      toast({ title: 'Comment Added' });
    },
  });

  // Create new remediation
  const createRemediation = useMutation({
    mutationFn: async (data: {
      organization_control_id: string;
      title: string;
      description: string;
      priority: string;
      due_date?: string;
    }) => {
      const { error } = await supabase
        .from('control_remediations')
        .insert({
          ...data,
          organization_id: organizationId,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remediations'] });
      setIsCreateOpen(false);
      toast({ title: 'Remediation Created', description: 'New remediation task has been created.' });
    },
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "destructive" | "outline" | "secondary"; label: string }> = {
      open: { variant: 'destructive', label: 'Open' },
      in_progress: { variant: 'default', label: 'In Progress' },
      pending_verification: { variant: 'secondary', label: 'Pending Verification' },
      resolved: { variant: 'outline', label: 'Resolved' },
      accepted_risk: { variant: 'outline', label: 'Risk Accepted' },
    };
    const { variant, label } = config[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'text-destructive',
      high: 'text-warning',
      medium: 'text-primary',
      low: 'text-muted-foreground',
    };
    return colors[priority] || 'text-muted-foreground';
  };

  const groupedRemediations = {
    open: remediations?.filter(r => r.status === 'open') || [],
    in_progress: remediations?.filter(r => r.status === 'in_progress') || [],
    pending_verification: remediations?.filter(r => r.status === 'pending_verification') || [],
    resolved: remediations?.filter(r => ['resolved', 'accepted_risk'].includes(r.status)) || [],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Control Remediation
          </h2>
          <p className="text-muted-foreground">Track and manage fix progress for failed controls</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Remediation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Remediation Task</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createRemediation.mutate({
                  organization_control_id: formData.get('control') as string,
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  priority: formData.get('priority') as string,
                  due_date: formData.get('due_date') as string || undefined,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium">Failed Control</label>
                <Select name="control" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select control" />
                  </SelectTrigger>
                  <SelectContent>
                    {failedControls?.map((control) => (
                      <SelectItem key={control.id} value={control.id}>
                        {control.controls?.name || 'Unknown Control'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input name="title" placeholder="Remediation title" required />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea name="description" placeholder="Describe the issue and remediation plan" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input name="due_date" type="date" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createRemediation.isPending}>
                {createRemediation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-2xl font-bold text-foreground">{groupedRemediations.open.length}</p>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-foreground">{groupedRemediations.in_progress.length}</p>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <User className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold text-foreground">{groupedRemediations.pending_verification.length}</p>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-foreground">{groupedRemediations.resolved.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="open">Open ({groupedRemediations.open.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({groupedRemediations.in_progress.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({groupedRemediations.pending_verification.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({groupedRemediations.resolved.length})</TabsTrigger>
        </TabsList>

        {Object.entries(groupedRemediations).map(([status, items]) => (
          <TabsContent key={status} value={status === 'pending_verification' ? 'pending' : status} className="mt-4">
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items in this status
                </div>
              ) : (
                items.map((rem) => (
                  <Dialog key={rem.id}>
                    <DialogTrigger asChild>
                      <div
                        className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedRemediation(rem)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground">{rem.title}</h4>
                          {getStatusBadge(rem.status)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {rem.description || 'No description provided'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className={cn("font-medium", getPriorityColor(rem.priority))}>
                            {rem.priority.toUpperCase()}
                          </span>
                          {rem.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(rem.due_date).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(rem.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{rem.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          {getStatusBadge(rem.status)}
                          <Badge variant="outline" className={getPriorityColor(rem.priority)}>
                            {rem.priority}
                          </Badge>
                          {rem.due_date && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {new Date(rem.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div>
                          <h5 className="text-sm font-medium mb-2">Description</h5>
                          <p className="text-sm text-muted-foreground">
                            {rem.description || 'No description provided'}
                          </p>
                        </div>

                        {rem.root_cause && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">Root Cause</h5>
                            <p className="text-sm text-muted-foreground">{rem.root_cause}</p>
                          </div>
                        )}

                        {rem.remediation_plan && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">Remediation Plan</h5>
                            <p className="text-sm text-muted-foreground">{rem.remediation_plan}</p>
                          </div>
                        )}

                        <div>
                          <h5 className="text-sm font-medium mb-2">Update Status</h5>
                          <Select
                            value={rem.status}
                            onValueChange={(value) => updateStatus.mutate({ id: rem.id, status: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="pending_verification">Pending Verification</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="accepted_risk">Accept Risk</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Comments ({comments?.length || 0})
                          </h5>
                          <div className="space-y-3 mb-4">
                            {comments?.map((comment) => (
                              <div key={comment.id} className="p-3 rounded-lg bg-muted/50">
                                <p className="text-sm text-foreground">{comment.comment}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(comment.created_at).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                            />
                            <Button
                              size="sm"
                              onClick={() => addComment.mutate({ remediationId: rem.id, comment: newComment })}
                              disabled={!newComment.trim() || addComment.isPending}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
