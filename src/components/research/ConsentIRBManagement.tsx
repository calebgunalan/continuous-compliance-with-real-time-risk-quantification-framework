import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileCheck, Shield, Download, CheckCircle2, Clock, AlertTriangle, FileText, Lock, Plus
} from "lucide-react";
import { toast } from "sonner";
import { useConsentRecords } from "@/hooks/useConsentRecords";

interface IRBChecklist {
  id: string;
  category: string;
  item: string;
  status: 'complete' | 'in_progress' | 'pending';
  notes?: string;
}

const irbChecklist: IRBChecklist[] = [
  { id: 'irb-1', category: 'Documentation', item: 'Study protocol document finalized', status: 'complete' },
  { id: 'irb-2', category: 'Documentation', item: 'Informed consent template approved', status: 'complete' },
  { id: 'irb-3', category: 'Documentation', item: 'Data management plan submitted', status: 'complete' },
  { id: 'irb-4', category: 'Privacy', item: 'Data anonymization procedures documented', status: 'complete' },
  { id: 'irb-5', category: 'Privacy', item: 'Encryption at rest implemented', status: 'complete' },
  { id: 'irb-6', category: 'Privacy', item: 'Access control policies in place', status: 'complete' },
  { id: 'irb-7', category: 'Privacy', item: 'Data retention schedule defined', status: 'complete' },
  { id: 'irb-8', category: 'Risk', item: 'Risk assessment completed', status: 'complete' },
  { id: 'irb-9', category: 'Risk', item: 'Mitigation strategies documented', status: 'complete' },
  { id: 'irb-10', category: 'Approval', item: 'IRB initial review submitted', status: 'in_progress', notes: 'Under review' },
  { id: 'irb-11', category: 'Approval', item: 'IRB approval received', status: 'pending' },
  { id: 'irb-12', category: 'Ongoing', item: 'Annual renewal submitted', status: 'pending' }
];

const consentTemplate = `INFORMED CONSENT FOR RESEARCH PARTICIPATION

Study Title: Continuous Compliance with Real-Time Risk Quantification Framework
Principal Investigator: [PI Name], [Institution]
IRB Protocol Number: [Protocol Number]

PURPOSE OF THE STUDY
You are being invited to participate in a research study examining the relationship between compliance governance maturity and quantified security risk reduction.

WHAT PARTICIPATION INVOLVES
If you agree to participate, your organization will:
1. Deploy our continuous compliance monitoring system
2. Provide API access for evidence collection from your security tools
3. Participate in monthly check-in interviews
4. Complete quarterly surveys
5. Report any security incidents during the study period

CONFIDENTIALITY
All organizational data will be:
- Encrypted at rest and in transit
- Anonymized in any publications
- Accessible only to the research team
- Deleted after the retention period (5 years post-study)

VOLUNTARY PARTICIPATION
Participation is voluntary. You may withdraw at any time without penalty.

Organization: _______________________
Authorized Signatory: _______________________
Date: _______________________`;

export function ConsentIRBManagement() {
  const { consents, isLoading, stats, createConsent, revokeConsent } = useConsentRecords();
  const [checklist] = useState<IRBChecklist[]>(irbChecklist);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newConsent, setNewConsent] = useState({ signed_by: '', consent_type: 'participation', consent_version: '1.2' });

  const publicationApprovedCount = consents.filter(c => c.consent_type === 'publication' && c.is_active).length;
  const completeItems = checklist.filter(c => c.status === 'complete').length;
  const complianceScore = Math.round((completeItems / checklist.length) * 100);

  const getStatusBadge = (status: IRBChecklist['status']) => {
    switch (status) {
      case 'complete': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1"><CheckCircle2 className="h-3 w-3" />Complete</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 gap-1"><Clock className="h-3 w-3" />In Progress</Badge>;
      case 'pending': return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([consentTemplate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'informed-consent-template.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Consent template downloaded");
  };

  const handleCreateConsent = () => {
    if (!newConsent.signed_by) { toast.error("Signatory name is required"); return; }
    createConsent.mutate(newConsent, {
      onSuccess: () => {
        setDialogOpen(false);
        setNewConsent({ signed_by: '', consent_type: 'participation', consent_version: '1.2' });
      }
    });
  };

  if (isLoading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Consent & IRB Management
            </CardTitle>
            <CardDescription>Per PRP Section 8 - Ethical considerations and informed consent tracking</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Consent</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record New Consent</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Signed By</Label><Input value={newConsent.signed_by} onChange={e => setNewConsent(p => ({ ...p, signed_by: e.target.value }))} placeholder="Name of signatory" /></div>
                <div><Label>Consent Type</Label>
                  <Select value={newConsent.consent_type} onValueChange={v => setNewConsent(p => ({ ...p, consent_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="participation">Participation</SelectItem>
                      <SelectItem value="data_use">Data Use</SelectItem>
                      <SelectItem value="publication">Publication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Version</Label><Input value={newConsent.consent_version} onChange={e => setNewConsent(p => ({ ...p, consent_version: e.target.value }))} /></div>
                <Button onClick={handleCreateConsent} disabled={createConsent.isPending} className="w-full">
                  {createConsent.isPending ? "Saving..." : "Record Consent"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-emerald-500/10 rounded-lg p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-600 mb-1" />
            <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
            <div className="text-xs text-muted-foreground">Active Consents</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-amber-600 mb-1" />
            <div className="text-2xl font-bold text-amber-600">{stats.revoked}</div>
            <div className="text-xs text-muted-foreground">Revoked</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 text-center">
            <FileText className="h-6 w-6 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold text-blue-600">{publicationApprovedCount}</div>
            <div className="text-xs text-muted-foreground">Publication OK</div>
          </div>
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <Shield className="h-6 w-6 mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold">{complianceScore}%</div>
            <div className="text-xs text-muted-foreground">IRB Compliance</div>
          </div>
        </div>

        <Tabs defaultValue="consents">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="consents">Consent Tracking</TabsTrigger>
            <TabsTrigger value="irb">IRB Checklist</TabsTrigger>
            <TabsTrigger value="template">Consent Template</TabsTrigger>
          </TabsList>

          <TabsContent value="consents">
            {consents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No consent records yet. Click "Add Consent" to record one.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Signed By</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consents.map((consent) => (
                    <TableRow key={consent.id}>
                      <TableCell className="font-medium">{consent.signed_by}</TableCell>
                      <TableCell><Badge variant="outline">{consent.consent_type}</Badge></TableCell>
                      <TableCell>v{consent.consent_version}</TableCell>
                      <TableCell>{new Date(consent.signed_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {consent.is_active ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Active</Badge>
                        ) : (
                          <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Revoked</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {consent.is_active && (
                          <Button variant="ghost" size="sm" onClick={() => revokeConsent.mutate({ id: consent.id, reason: 'Participant withdrawal' })}>
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="irb" className="space-y-4">
            {['Documentation', 'Privacy', 'Risk', 'Approval', 'Ongoing'].map((category) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                {checklist.filter(c => c.category === category).map((item) => (
                  <div key={item.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={item.status === 'complete'} disabled />
                      <span className="text-sm">{item.item}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.notes && <span className="text-xs text-muted-foreground">{item.notes}</span>}
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 mr-1" />Download Template
              </Button>
            </div>
            <pre className="bg-muted/30 rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {consentTemplate}
            </pre>
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4" />Data Security Measures (PRP Section 8.3)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {['Encryption at rest (AES-256)', 'Encryption in transit (TLS 1.3)', 'Role-based access controls', 'Audit logging enabled', 'Anonymization procedures', 'Secure deletion policy'].map((measure) => (
              <div key={measure} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /><span>{measure}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}