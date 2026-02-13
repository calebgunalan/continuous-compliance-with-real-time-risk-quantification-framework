import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Banknote, Download, Building2, GraduationCap, Landmark, CheckCircle2, Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { useFundingApplications } from "@/hooks/useFundingApplications";

const proposalTemplate = `# Research Grant Proposal

## Project Title
Continuous Compliance with Real-Time Risk Quantification: An Empirical Validation Framework

## Principal Investigator
[Name], [Title]
[Institution]

## Project Summary (250 words max)

This research addresses a fundamental challenge in cybersecurity governance: organizations invest heavily in compliance programs but cannot quantify how these investments reduce actual breach risk. We propose developing and empirically validating a novel framework that integrates continuous compliance monitoring with real-time financial risk quantification using the FAIR methodology.

## Budget Summary

| Category | Year 1 | Year 2 | Total |
|----------|--------|--------|-------|
| Personnel | $175,000 | $175,000 | $350,000 |
| Infrastructure | $15,000 | $15,000 | $30,000 |
| Participant Incentives | $10,000 | $10,000 | $20,000 |
| Dissemination | $5,000 | $5,000 | $10,000 |
| **Total** | **$205,000** | **$205,000** | **$410,000** |

## Intellectual Merit

- First empirical model connecting governance maturity to quantified risk reduction
- Methodology for continuous compliance that reduces detection time from months to hours
- Validated framework for translating compliance investments into financial ROI

## Broader Impacts

- Open-source tools for continuous compliance monitoring
- Educational materials for security governance courses
- Industry guidance for evidence-based security investment`;

export function FundingProposalGenerator() {
  const { applications, isLoading, stats, createApplication, updateApplication } = useFundingApplications();
  const [proposal, setProposal] = useState(proposalTemplate);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newApp, setNewApp] = useState({
    funding_source: '', program_name: '', proposal_title: '', requested_amount: 0, principal_investigator: ''
  });

  const getTypeIcon = (source: string) => {
    if (source.toLowerCase().includes('nsf') || source.toLowerCase().includes('dhs')) return <Landmark className="h-4 w-4" />;
    if (source.toLowerCase().includes('foundation') || source.toLowerCase().includes('macarthur')) return <Building2 className="h-4 w-4" />;
    if (source.toLowerCase().includes('university') || source.toLowerCase().includes('academic')) return <GraduationCap className="h-4 w-4" />;
    return <Banknote className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'awarded': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Awarded</Badge>;
      case 'submitted': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Submitted</Badge>;
      case 'preparing': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Preparing</Badge>;
      case 'declined': return <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Declined</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  const handleCopyProposal = () => {
    navigator.clipboard.writeText(proposal);
    toast.success("Proposal copied to clipboard");
  };

  const handleDownloadProposal = () => {
    const blob = new Blob([proposal], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grant-proposal.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Proposal downloaded");
  };

  const handleCreateApp = () => {
    if (!newApp.funding_source || !newApp.proposal_title) { toast.error("Source and title required"); return; }
    createApplication.mutate(newApp, {
      onSuccess: () => {
        setDialogOpen(false);
        setNewApp({ funding_source: '', program_name: '', proposal_title: '', requested_amount: 0, principal_investigator: '' });
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
              <Banknote className="h-5 w-5" />Funding Proposal Generator
            </CardTitle>
            <CardDescription>Per PRP Section 6.6 - Identify and pursue funding sources</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Application</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Funding Application</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Funding Source</Label><Input value={newApp.funding_source} onChange={e => setNewApp(p => ({ ...p, funding_source: e.target.value }))} placeholder="e.g., NSF, DHS" /></div>
                <div><Label>Program Name</Label><Input value={newApp.program_name} onChange={e => setNewApp(p => ({ ...p, program_name: e.target.value }))} placeholder="e.g., SaTC" /></div>
                <div><Label>Proposal Title</Label><Input value={newApp.proposal_title} onChange={e => setNewApp(p => ({ ...p, proposal_title: e.target.value }))} /></div>
                <div><Label>Requested Amount ($)</Label><Input type="number" value={newApp.requested_amount} onChange={e => setNewApp(p => ({ ...p, requested_amount: Number(e.target.value) }))} /></div>
                <div><Label>Principal Investigator</Label><Input value={newApp.principal_investigator} onChange={e => setNewApp(p => ({ ...p, principal_investigator: e.target.value }))} /></div>
                <Button onClick={handleCreateApp} disabled={createApplication.isPending} className="w-full">
                  {createApplication.isPending ? "Saving..." : "Create Application"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="tracking">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tracking">Application Tracking</TabsTrigger>
            <TabsTrigger value="sources">Funding Sources</TabsTrigger>
            <TabsTrigger value="proposal">Proposal Template</TabsTrigger>
          </TabsList>

          <TabsContent value="tracking" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Applications</div>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{stats.draft + stats.submitted}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="bg-emerald-500/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{stats.awarded}</div>
                <div className="text-xs text-muted-foreground">Awarded</div>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">${(stats.totalRequested / 1000).toFixed(0)}K</div>
                <div className="text-xs text-muted-foreground">Total Requested</div>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No applications yet. Click "Add Application" to create one.</div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(app.funding_source)}
                      <div>
                        <span className="font-medium text-sm">{app.proposal_title}</span>
                        <div className="text-xs text-muted-foreground">{app.funding_source} — {app.program_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">${app.requested_amount.toLocaleString()}</span>
                      {getStatusBadge(app.status)}
                      <Select value={app.status} onValueChange={v => updateApplication.mutate({ id: app.id, status: v })}>
                        <SelectTrigger className="w-[120px] h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="preparing">Preparing</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="awarded">Awarded</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Per PRP Section 6.6, potential funding sources include NSF SaTC, DHS S&T, CIS, SANS Institute, and private foundations like MacArthur.
              Create applications from the Tracking tab above.
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Recommended Sources</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { name: 'NSF SaTC', range: '$300K-$1.2M', fit: 95 },
                  { name: 'DHS S&T', range: '$200K-$800K', fit: 88 },
                  { name: 'CIS Foundation', range: '$50K-$150K', fit: 82 },
                  { name: 'SANS Institute', range: '$25K-$75K', fit: 78 },
                  { name: 'MacArthur Foundation', range: '$100K-$500K', fit: 72 },
                ].map(s => (
                  <div key={s.name} className="flex items-center justify-between border rounded p-2">
                    <span>{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">{s.range}</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary text-xs">{s.fit}% fit</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="proposal" className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyProposal}><Copy className="h-4 w-4 mr-1" />Copy</Button>
              <Button variant="outline" size="sm" onClick={handleDownloadProposal}><Download className="h-4 w-4 mr-1" />Download</Button>
            </div>
            <Textarea value={proposal} onChange={(e) => setProposal(e.target.value)} className="min-h-[500px] font-mono text-sm" />
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Proposal Sections Checklist</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {['Project Title', 'PI Information', 'Project Summary', 'Budget Summary', 'Intellectual Merit', 'Broader Impacts', 'Research Plan', 'Timeline', 'References', 'Data Management Plan'].map((section) => (
                  <div key={section} className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /><span>{section}</span></div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}