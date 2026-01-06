import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users,
  UserPlus,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type StudyParticipant = Tables<'study_participants'> & {
  organization?: Tables<'organizations'>;
};

export function StudyParticipantsManager() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    organization_id: '',
    industry_sector: '',
    study_group: 'continuous',
    consent_signed: false,
    notes: '',
  });

  const { data: participants, isLoading } = useQuery({
    queryKey: ['study_participants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_participants')
        .select(`
          *,
          organization:organizations(*)
        `)
        .order('enrollment_date', { ascending: false });

      if (error) throw error;
      return data as StudyParticipant[];
    },
  });

  const { data: organizations } = useQuery({
    queryKey: ['organizations_for_enrollment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, industry')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const addParticipantMutation = useMutation({
    mutationFn: async (input: typeof newParticipant) => {
      const org = organizations?.find(o => o.id === input.organization_id);
      const { data, error } = await supabase
        .from('study_participants')
        .insert({
          organization_id: input.organization_id,
          industry_sector: input.industry_sector || org?.industry || 'Unknown',
          study_group: input.study_group,
          consent_signed: input.consent_signed,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_participants'] });
      setIsAddDialogOpen(false);
      setNewParticipant({
        organization_id: '',
        industry_sector: '',
        study_group: 'continuous',
        consent_signed: false,
        notes: '',
      });
      toast.success("Participant enrolled successfully");
    },
    onError: (error) => {
      toast.error("Failed to enroll participant", {
        description: error.message,
      });
    },
  });

  const updateConsentMutation = useMutation({
    mutationFn: async ({ id, consent_signed }: { id: string; consent_signed: boolean }) => {
      const { error } = await supabase
        .from('study_participants')
        .update({ consent_signed })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_participants'] });
      toast.success("Consent status updated");
    },
  });

  const withdrawParticipantMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('study_participants')
        .update({ withdrawal_date: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study_participants'] });
      toast.success("Participant withdrawn from study");
    },
  });

  const activeParticipants = participants?.filter(p => !p.withdrawal_date) || [];
  const withdrawnParticipants = participants?.filter(p => p.withdrawal_date) || [];
  const continuousGroup = activeParticipants.filter(p => p.study_group === 'continuous');
  const traditionalGroup = activeParticipants.filter(p => p.study_group === 'traditional');
  const consentPending = activeParticipants.filter(p => !p.consent_signed);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
                <p className="text-2xl font-bold">{activeParticipants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Continuous Group</p>
                <p className="text-2xl font-bold text-success">{continuousGroup.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Traditional Group</p>
                <p className="text-2xl font-bold text-warning">{traditionalGroup.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Consent Pending</p>
                <p className="text-2xl font-bold text-destructive">{consentPending.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Withdrawn</p>
                <p className="text-2xl font-bold text-muted-foreground">{withdrawnParticipants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Study Participants</CardTitle>
              <CardDescription>
                Manage organizations enrolled in the research study
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Enroll Participant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enroll New Participant</DialogTitle>
                  <DialogDescription>
                    Add an organization to the research study
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Organization</Label>
                    <Select
                      value={newParticipant.organization_id}
                      onValueChange={(value) => {
                        const org = organizations?.find(o => o.id === value);
                        setNewParticipant(prev => ({
                          ...prev,
                          organization_id: value,
                          industry_sector: org?.industry || '',
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations?.map(org => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Industry Sector</Label>
                    <Input
                      value={newParticipant.industry_sector}
                      onChange={(e) => setNewParticipant(prev => ({ ...prev, industry_sector: e.target.value }))}
                      placeholder="e.g., Financial Services, Healthcare"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Study Group</Label>
                    <Select
                      value={newParticipant.study_group}
                      onValueChange={(value) => setNewParticipant(prev => ({ ...prev, study_group: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="continuous">Continuous Monitoring</SelectItem>
                        <SelectItem value="traditional">Traditional Audit (Control)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="consent"
                      checked={newParticipant.consent_signed}
                      onCheckedChange={(checked) => 
                        setNewParticipant(prev => ({ ...prev, consent_signed: !!checked }))
                      }
                    />
                    <Label htmlFor="consent">Research consent signed</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={newParticipant.notes}
                      onChange={(e) => setNewParticipant(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about this participant"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => addParticipantMutation.mutate(newParticipant)}
                    disabled={!newParticipant.organization_id || addParticipantMutation.isPending}
                  >
                    {addParticipantMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Enroll
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Organization
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Industry
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Study Group
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Consent
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Enrolled
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {participants?.map((participant) => (
                  <tr key={participant.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className="font-medium">
                          {participant.organization?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline">{participant.industry_sector}</Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge className={cn(
                        participant.study_group === 'continuous' 
                          ? 'bg-success/15 text-success' 
                          : 'bg-warning/15 text-warning'
                      )}>
                        {participant.study_group}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateConsentMutation.mutate({
                          id: participant.id,
                          consent_signed: !participant.consent_signed,
                        })}
                      >
                        {participant.consent_signed ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        )}
                      </Button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {participant.withdrawal_date ? (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive">
                          Withdrawn
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-success/10 text-success">
                          Active
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-muted-foreground">
                      {new Date(participant.enrollment_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {!participant.withdrawal_date && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to withdraw this participant?')) {
                              withdrawParticipantMutation.mutate(participant.id);
                            }
                          }}
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {(!participants || participants.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      No participants enrolled yet. Click "Enroll Participant" to add organizations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
