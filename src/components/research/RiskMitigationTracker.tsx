import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Shield, CheckCircle2, Clock, Plus } from "lucide-react";
import { useProjectRisks } from "@/hooks/useProjectRisks";

const getLikelihoodColor = (level: number) => {
  if (level >= 4) return 'bg-red-500/10 text-red-600 border-red-500/30';
  if (level >= 3) return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
  return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'closed': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'mitigated': return <Shield className="h-4 w-4 text-blue-500" />;
    case 'monitoring': return <Clock className="h-4 w-4 text-amber-500" />;
    default: return <AlertTriangle className="h-4 w-4 text-red-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'closed': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Closed</Badge>;
    case 'mitigated': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Mitigated</Badge>;
    case 'monitoring': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Monitoring</Badge>;
    default: return <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Open</Badge>;
  }
};

export function RiskMitigationTracker() {
  const { risks, isLoading, stats, createRisk, updateRisk } = useProjectRisks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRisk, setNewRisk] = useState({
    risk_category: 'Technical', risk_name: '', description: '', likelihood: 3, impact: 3,
    mitigation_strategy: '', owner: ''
  });

  const handleCreate = () => {
    if (!newRisk.risk_name || !newRisk.description) return;
    createRisk.mutate(newRisk, {
      onSuccess: () => {
        setDialogOpen(false);
        setNewRisk({ risk_category: 'Technical', risk_name: '', description: '', likelihood: 3, impact: 3, mitigation_strategy: '', owner: '' });
      }
    });
  };

  // Group risks by category
  const categories = risks.reduce<Record<string, typeof risks>>((acc, risk) => {
    const cat = risk.risk_category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(risk);
    return acc;
  }, {});

  if (isLoading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />Risk Mitigation Tracker
            </CardTitle>
            <CardDescription>Per PRP Section 7 - Monitoring {stats.total} identified risks</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Risk</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Risk</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Category</Label>
                  <Select value={newRisk.risk_category} onValueChange={v => setNewRisk(p => ({ ...p, risk_category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Recruitment">Recruitment & Retention</SelectItem>
                      <SelectItem value="Research Validity">Research Validity</SelectItem>
                      <SelectItem value="Timeline">Timeline & Scope</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Risk Name</Label><Input value={newRisk.risk_name} onChange={e => setNewRisk(p => ({ ...p, risk_name: e.target.value }))} /></div>
                <div><Label>Description</Label><Textarea value={newRisk.description} onChange={e => setNewRisk(p => ({ ...p, description: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Likelihood (1-5)</Label><Input type="number" min={1} max={5} value={newRisk.likelihood} onChange={e => setNewRisk(p => ({ ...p, likelihood: Number(e.target.value) }))} /></div>
                  <div><Label>Impact (1-5)</Label><Input type="number" min={1} max={5} value={newRisk.impact} onChange={e => setNewRisk(p => ({ ...p, impact: Number(e.target.value) }))} /></div>
                </div>
                <div><Label>Mitigation Strategy</Label><Textarea value={newRisk.mitigation_strategy} onChange={e => setNewRisk(p => ({ ...p, mitigation_strategy: e.target.value }))} /></div>
                <div><Label>Owner</Label><Input value={newRisk.owner} onChange={e => setNewRisk(p => ({ ...p, owner: e.target.value }))} /></div>
                <Button onClick={handleCreate} disabled={createRisk.isPending} className="w-full">
                  {createRisk.isPending ? "Saving..." : "Add Risk"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-500/10 rounded-lg p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto text-red-600 mb-1" />
            <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            <div className="text-xs text-muted-foreground">Open Risks</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-amber-600 mb-1" />
            <div className="text-2xl font-bold text-amber-600">{stats.monitoring}</div>
            <div className="text-xs text-muted-foreground">Monitoring</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 text-center">
            <Shield className="h-6 w-6 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold text-blue-600">{stats.mitigated}</div>
            <div className="text-xs text-muted-foreground">Mitigated</div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-600 mb-1" />
            <div className="text-2xl font-bold text-emerald-600">
              {stats.total > 0 ? (((stats.mitigated + stats.closed) / stats.total) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">Risk Coverage</div>
          </div>
        </div>

        {Object.keys(categories).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No risks recorded yet. Click "Add Risk" to get started.</div>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {Object.entries(categories).map(([catName, catRisks]) => (
              <AccordionItem key={catName} value={catName} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">{catName}</span>
                    <Badge variant="outline" className="ml-2">{catRisks.length} risks</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {catRisks.map((risk) => (
                    <div key={risk.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(risk.status)}
                          <span className="font-medium">{risk.risk_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(risk.status)}
                          <Select value={risk.status} onValueChange={v => updateRisk.mutate({ id: risk.id, status: v })}>
                            <SelectTrigger className="w-[120px] h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="monitoring">Monitoring</SelectItem>
                              <SelectItem value="mitigated">Mitigated</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{risk.description}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getLikelihoodColor(risk.likelihood)}>
                          Likelihood: {risk.likelihood}/5
                        </Badge>
                        <Badge variant="outline" className={getLikelihoodColor(risk.impact)}>
                          Impact: {risk.impact}/5
                        </Badge>
                        <Badge variant="outline">Score: {risk.risk_score}</Badge>
                      </div>
                      {risk.mitigation_strategy && (
                        <div>
                          <h5 className="text-xs font-medium text-muted-foreground mb-1">Mitigation Strategy</h5>
                          <p className="text-xs">{risk.mitigation_strategy}</p>
                        </div>
                      )}
                      {risk.owner && (
                        <div className="text-xs text-muted-foreground">Owner: {risk.owner}</div>
                      )}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}