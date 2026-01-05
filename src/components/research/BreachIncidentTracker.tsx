import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertTriangle, 
  Plus, 
  Calendar,
  DollarSign,
  Clock,
  Shield,
  TrendingDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BreachIncident {
  id: string;
  incident_date: string;
  incident_type: string;
  severity: string;
  financial_impact: number;
  maturity_level_at_time: string;
  root_cause: string;
  detection_method: string;
  time_to_detect_hours: number;
  time_to_remediate_hours: number;
}

// Mock data for demonstration
const mockIncidents: BreachIncident[] = [
  {
    id: "1",
    incident_date: "2024-11-15T10:30:00Z",
    incident_type: "Data Breach",
    severity: "high",
    financial_impact: 250000,
    maturity_level_at_time: "level_2",
    root_cause: "Unpatched vulnerability in web application",
    detection_method: "Continuous Monitoring",
    time_to_detect_hours: 4,
    time_to_remediate_hours: 48,
  },
  {
    id: "2",
    incident_date: "2024-10-22T14:15:00Z",
    incident_type: "Ransomware",
    severity: "critical",
    financial_impact: 1500000,
    maturity_level_at_time: "level_1",
    root_cause: "Phishing email with malicious attachment",
    detection_method: "User Report",
    time_to_detect_hours: 72,
    time_to_remediate_hours: 168,
  },
  {
    id: "3",
    incident_date: "2024-09-08T09:00:00Z",
    incident_type: "Insider Threat",
    severity: "medium",
    financial_impact: 75000,
    maturity_level_at_time: "level_3",
    root_cause: "Excessive access privileges",
    detection_method: "Continuous Monitoring",
    time_to_detect_hours: 2,
    time_to_remediate_hours: 24,
  },
];

export function BreachIncidentTracker() {
  const { toast } = useToast();
  const [incidents] = useState<BreachIncident[]>(mockIncidents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    incident_date: "",
    incident_type: "",
    severity: "",
    financial_impact: "",
    root_cause: "",
    detection_method: "",
    time_to_detect_hours: "",
    time_to_remediate_hours: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Incident Recorded",
      description: "Breach incident has been logged for research validation.",
    });
    setIsDialogOpen(false);
    setNewIncident({
      incident_date: "",
      incident_type: "",
      severity: "",
      financial_impact: "",
      root_cause: "",
      detection_method: "",
      time_to_detect_hours: "",
      time_to_remediate_hours: "",
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-destructive/15 text-destructive border-0">Critical</Badge>;
      case "high":
        return <Badge className="bg-[hsl(var(--risk-high))]/15 text-[hsl(var(--risk-high))] border-0">High</Badge>;
      case "medium":
        return <Badge className="bg-warning/15 text-warning border-0">Medium</Badge>;
      case "low":
        return <Badge className="bg-success/15 text-success border-0">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Calculate summary statistics
  const totalIncidents = incidents.length;
  const totalImpact = incidents.reduce((sum, i) => sum + i.financial_impact, 0);
  const avgDetectionTime = incidents.reduce((sum, i) => sum + i.time_to_detect_hours, 0) / totalIncidents;
  const avgRemediationTime = incidents.reduce((sum, i) => sum + i.time_to_remediate_hours, 0) / totalIncidents;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Incidents</p>
                <p className="text-2xl font-bold">{totalIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15">
                <DollarSign className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Impact</p>
                <p className="text-2xl font-bold">{formatCurrency(totalImpact)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Detection</p>
                <p className="text-2xl font-bold">{avgDetectionTime.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
                <TrendingDown className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Remediation</p>
                <p className="text-2xl font-bold">{avgRemediationTime.toFixed(0)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Breach Incidents Log
              </CardTitle>
              <CardDescription>
                Track security incidents for empirical validation of maturity-to-risk correlation
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Record Incident
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Record Security Incident</DialogTitle>
                  <DialogDescription>
                    Log a security incident for research validation. This data helps validate the maturity-to-breach correlation hypothesis.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="incident_date">Incident Date</Label>
                      <Input
                        id="incident_date"
                        type="datetime-local"
                        value={newIncident.incident_date}
                        onChange={(e) => setNewIncident({ ...newIncident, incident_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="incident_type">Incident Type</Label>
                      <Select
                        value={newIncident.incident_type}
                        onValueChange={(value) => setNewIncident({ ...newIncident, incident_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="data_breach">Data Breach</SelectItem>
                          <SelectItem value="ransomware">Ransomware</SelectItem>
                          <SelectItem value="phishing">Phishing Attack</SelectItem>
                          <SelectItem value="insider_threat">Insider Threat</SelectItem>
                          <SelectItem value="ddos">DDoS Attack</SelectItem>
                          <SelectItem value="sql_injection">SQL Injection</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity</Label>
                      <Select
                        value={newIncident.severity}
                        onValueChange={(value) => setNewIncident({ ...newIncident, severity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="financial_impact">Financial Impact ($)</Label>
                      <Input
                        id="financial_impact"
                        type="number"
                        placeholder="250000"
                        value={newIncident.financial_impact}
                        onChange={(e) => setNewIncident({ ...newIncident, financial_impact: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="detection_method">Detection Method</Label>
                      <Select
                        value={newIncident.detection_method}
                        onValueChange={(value) => setNewIncident({ ...newIncident, detection_method: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="How was it detected?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="continuous_monitoring">Continuous Monitoring</SelectItem>
                          <SelectItem value="periodic_audit">Periodic Audit</SelectItem>
                          <SelectItem value="user_report">User Report</SelectItem>
                          <SelectItem value="external_notification">External Notification</SelectItem>
                          <SelectItem value="threat_intelligence">Threat Intelligence</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time_to_detect">Time to Detect (hours)</Label>
                      <Input
                        id="time_to_detect"
                        type="number"
                        placeholder="4"
                        value={newIncident.time_to_detect_hours}
                        onChange={(e) => setNewIncident({ ...newIncident, time_to_detect_hours: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time_to_remediate">Time to Remediate (hours)</Label>
                    <Input
                      id="time_to_remediate"
                      type="number"
                      placeholder="48"
                      value={newIncident.time_to_remediate_hours}
                      onChange={(e) => setNewIncident({ ...newIncident, time_to_remediate_hours: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="root_cause">Root Cause Analysis</Label>
                    <Textarea
                      id="root_cause"
                      placeholder="Describe the root cause of the incident..."
                      value={newIncident.root_cause}
                      onChange={(e) => setNewIncident({ ...newIncident, root_cause: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Record Incident</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Maturity Level</TableHead>
                <TableHead>Detection Method</TableHead>
                <TableHead className="text-right">Impact</TableHead>
                <TableHead className="text-right">MTTD</TableHead>
                <TableHead className="text-right">MTTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(incident.incident_date), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{incident.incident_type}</TableCell>
                  <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {incident.maturity_level_at_time.replace("level_", "L")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {incident.detection_method === "Continuous Monitoring" ? (
                        <Shield className="h-4 w-4 text-success" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{incident.detection_method}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(incident.financial_impact)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={incident.time_to_detect_hours < 24 ? "text-success" : "text-warning"}>
                      {incident.time_to_detect_hours}h
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {incident.time_to_remediate_hours}h
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
