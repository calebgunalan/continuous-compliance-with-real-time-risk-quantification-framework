import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Ticket, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  MessageSquare,
  User,
  Building2
} from "lucide-react";
import { toast } from "sonner";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  organization: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  category: 'technical' | 'evidence' | 'reporting' | 'general';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  responses: { author: string; message: string; timestamp: string }[];
}

const mockTickets: SupportTicket[] = [
  {
    id: 'TKT-001',
    title: 'AWS Evidence Collector Connection Failure',
    description: 'Unable to connect to AWS CloudTrail. Getting authentication errors.',
    organization: 'Acme Financial',
    priority: 'high',
    status: 'in_progress',
    category: 'evidence',
    createdAt: '2026-01-18T09:30:00Z',
    updatedAt: '2026-01-19T14:00:00Z',
    assignedTo: 'Tech Support',
    responses: [
      { author: 'Tech Support', message: 'We\'re investigating the IAM role permissions. Please verify the role ARN.', timestamp: '2026-01-18T11:00:00Z' }
    ]
  },
  {
    id: 'TKT-002',
    title: 'Dashboard loading slowly',
    description: 'The risk quantification dashboard takes over 10 seconds to load.',
    organization: 'HealthFirst Medical',
    priority: 'medium',
    status: 'open',
    category: 'technical',
    createdAt: '2026-01-19T16:45:00Z',
    updatedAt: '2026-01-19T16:45:00Z',
    responses: []
  },
  {
    id: 'TKT-003',
    title: 'Monthly report not generating',
    description: 'The scheduled monthly compliance report did not run for January.',
    organization: 'TechStart Inc',
    priority: 'medium',
    status: 'resolved',
    category: 'reporting',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-16T10:30:00Z',
    assignedTo: 'Tech Support',
    responses: [
      { author: 'Tech Support', message: 'The scheduled job was paused due to a system update. It has been restarted.', timestamp: '2026-01-15T14:00:00Z' },
      { author: 'TechStart Inc', message: 'Confirmed - report is now available. Thank you!', timestamp: '2026-01-16T10:30:00Z' }
    ]
  },
  {
    id: 'TKT-004',
    title: 'Question about maturity assessment scoring',
    description: 'How is the overall maturity level calculated from domain scores?',
    organization: 'Manufacturing Corp',
    priority: 'low',
    status: 'closed',
    category: 'general',
    createdAt: '2026-01-10T11:20:00Z',
    updatedAt: '2026-01-11T09:00:00Z',
    assignedTo: 'Research Team',
    responses: [
      { author: 'Research Team', message: 'The overall maturity level is a weighted average of domain scores, with critical controls weighted higher. See the documentation for details.', timestamp: '2026-01-11T09:00:00Z' }
    ]
  }
];

const getPriorityBadge = (priority: SupportTicket['priority']) => {
  switch (priority) {
    case 'critical': return <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Critical</Badge>;
    case 'high': return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30">High</Badge>;
    case 'medium': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Medium</Badge>;
    case 'low': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Low</Badge>;
  }
};

const getStatusBadge = (status: SupportTicket['status']) => {
  switch (status) {
    case 'open': return <Badge variant="outline" className="gap-1"><AlertTriangle className="h-3 w-3" />Open</Badge>;
    case 'in_progress': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 gap-1"><Clock className="h-3 w-3" />In Progress</Badge>;
    case 'waiting': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1"><Clock className="h-3 w-3" />Waiting</Badge>;
    case 'resolved': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1"><CheckCircle2 className="h-3 w-3" />Resolved</Badge>;
    case 'closed': return <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" />Closed</Badge>;
  }
};

export function ParticipantSupportTicketing() {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [newResponse, setNewResponse] = useState('');

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'open') return t.status === 'open';
    if (filter === 'in_progress') return t.status === 'in_progress' || t.status === 'waiting';
    if (filter === 'resolved') return t.status === 'resolved' || t.status === 'closed';
    return true;
  });

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress' || t.status === 'waiting').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  const handleAddResponse = () => {
    if (!selectedTicket || !newResponse.trim()) return;
    
    const updatedTicket = {
      ...selectedTicket,
      responses: [
        ...selectedTicket.responses,
        { author: 'Support Team', message: newResponse, timestamp: new Date().toISOString() }
      ],
      updatedAt: new Date().toISOString()
    };
    
    setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setNewResponse('');
    toast.success("Response added");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Participant Support Ticketing
        </CardTitle>
        <CardDescription>
          Per PRP Section 9.1 - Dedicated support channel for participating organizations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <Ticket className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
            <div className="text-2xl font-bold">{tickets.length}</div>
            <div className="text-xs text-muted-foreground">Total Tickets</div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto text-orange-600 mb-1" />
            <div className="text-2xl font-bold text-orange-600">{openTickets}</div>
            <div className="text-xs text-muted-foreground">Open</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold text-blue-600">{inProgressTickets}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-600 mb-1" />
            <div className="text-2xl font-bold text-emerald-600">{resolvedTickets}</div>
            <div className="text-xs text-muted-foreground">Resolved</div>
          </div>
        </div>

        <Tabs defaultValue="tickets">
          <TabsList>
            <TabsTrigger value="tickets">Ticket Queue</TabsTrigger>
            <TabsTrigger value="new">Create Ticket</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4">
            {/* Filter */}
            <div className="flex gap-2">
              {(['all', 'open', 'in_progress', 'resolved'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Ticket List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <h4 className="font-medium text-sm mt-1">{ticket.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Building2 className="h-3 w-3" />
                      <span>{ticket.organization}</span>
                      <span>•</span>
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ticket Detail */}
              {selectedTicket ? (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{selectedTicket.id}</span>
                        {getPriorityBadge(selectedTicket.priority)}
                        {getStatusBadge(selectedTicket.status)}
                      </div>
                      <h3 className="font-medium mt-1">{selectedTicket.title}</h3>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 text-sm">
                    <p>{selectedTicket.description}</p>
                  </div>

                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Organization: </span>
                      <span className="font-medium">{selectedTicket.organization}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category: </span>
                      <Badge variant="outline">{selectedTicket.category}</Badge>
                    </div>
                  </div>

                  {/* Responses */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Responses ({selectedTicket.responses.length})
                    </h4>
                    
                    {selectedTicket.responses.map((response, idx) => (
                      <div key={idx} className="bg-muted/20 rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3" />
                          <span className="font-medium">{response.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(response.timestamp)}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{response.message}</p>
                      </div>
                    ))}

                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add a response..."
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <Button size="sm" onClick={handleAddResponse} disabled={!newResponse.trim()}>
                        Send Response
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-8 flex items-center justify-center text-muted-foreground">
                  Select a ticket to view details
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <div className="grid gap-4 max-w-xl">
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acme">Acme Financial</SelectItem>
                    <SelectItem value="health">HealthFirst Medical</SelectItem>
                    <SelectItem value="tech">TechStart Inc</SelectItem>
                    <SelectItem value="mfg">Manufacturing Corp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Brief description of the issue" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="evidence">Evidence Collection</SelectItem>
                      <SelectItem value="reporting">Reporting</SelectItem>
                      <SelectItem value="general">General Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea placeholder="Detailed description of the issue..." className="min-h-[120px]" />
              </div>
              
              <Button onClick={() => toast.success("Ticket created successfully")}>
                <Plus className="h-4 w-4 mr-1" />
                Create Ticket
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
