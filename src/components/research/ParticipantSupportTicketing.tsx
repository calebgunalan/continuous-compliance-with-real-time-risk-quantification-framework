import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Ticket, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2, Plus } from "lucide-react";
import { useSupportTickets, CreateTicketInput, SupportTicket } from "@/hooks/useSupportTickets";
import { useState } from "react";
import { format } from "date-fns";

const TICKET_CATEGORIES = ['technical', 'evidence', 'reporting', 'general'];
const PRIORITY_LEVELS = ['low', 'medium', 'high', 'critical'];

export function ParticipantSupportTicketing() {
  const { tickets, isLoading, stats, createTicket, updateTicket } = useSupportTickets();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [newTicket, setNewTicket] = useState<CreateTicketInput>({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
  });

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description) return;
    createTicket.mutate(newTicket, {
      onSuccess: () => {
        setNewTicket({ title: '', description: '', category: 'general', priority: 'medium' });
      }
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">Medium</Badge>;
      case 'low':
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600">Open</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600">In Progress</Badge>;
      case 'waiting':
        return <Badge variant="outline" className="bg-violet-500/10 text-violet-600">Waiting</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">Resolved</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
    } catch {
      return dateStr;
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Participant Support Ticketing
        </CardTitle>
        <CardDescription>
          Track and resolve participant issues during the study
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
            <div className="text-xs text-muted-foreground">Open</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.inProgress}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.resolved}</div>
            <div className="text-xs text-muted-foreground">Resolved</div>
          </div>
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        <Tabs defaultValue="queue">
          <TabsList>
            <TabsTrigger value="queue">Ticket Queue</TabsTrigger>
            <TabsTrigger value="create">Create Ticket</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-4">
            {/* Filter */}
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Ticket List */}
              <ScrollArea className="h-[400px] border rounded-lg">
                {filteredTickets.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No tickets found
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedTicket?.id === ticket.id ? 'bg-muted border-primary' : ''
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-sm truncate flex-1">{ticket.title}</span>
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {getStatusBadge(ticket.status)}
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">{ticket.category}</Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(ticket.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Ticket Detail */}
              <div className="border rounded-lg p-4">
                {selectedTicket ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{selectedTicket.title}</h3>
                      {getStatusBadge(selectedTicket.status)}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {getPriorityBadge(selectedTicket.priority)}
                      <Badge variant="outline">{selectedTicket.category}</Badge>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
                    </div>

                    {selectedTicket.resolution && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Resolution</h4>
                        <p className="text-sm text-muted-foreground bg-emerald-500/10 p-2 rounded">
                          {selectedTicket.resolution}
                        </p>
                      </div>
                    )}

                    <Separator />

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Created: {formatDate(selectedTicket.created_at)}</div>
                      <div>Updated: {formatDate(selectedTicket.updated_at)}</div>
                      {selectedTicket.resolved_at && (
                        <div>Resolved: {formatDate(selectedTicket.resolved_at)}</div>
                      )}
                    </div>

                    {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                      <div className="flex gap-2 pt-2">
                        {selectedTicket.status === 'open' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTicket.mutate({ id: selectedTicket.id, status: 'in_progress' })}
                          >
                            Start Working
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTicket.mutate({ id: selectedTicket.id, status: 'resolved' })}
                        >
                          Mark Resolved
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    <p>Select a ticket to view details</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4 max-w-md">
              <Input
                placeholder="Ticket title"
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
              />
              <Textarea
                placeholder="Describe the issue..."
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                rows={4}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={newTicket.category}
                  onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={newTicket.priority}
                  onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map((p) => (
                      <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateTicket}
                disabled={createTicket.isPending || !newTicket.title || !newTicket.description}
                className="w-full"
              >
                {createTicket.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Ticket
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
