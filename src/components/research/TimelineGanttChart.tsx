import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, CheckCircle2, Clock, AlertTriangle, Plus, Loader2 } from "lucide-react";
import { useProjectMilestones, CreateMilestoneInput } from "@/hooks/useProjectMilestones";
import { useState, useMemo } from "react";

interface Phase {
  id: string;
  name: string;
  startMonth: number;
  endMonth: number;
  status: 'completed' | 'in_progress' | 'upcoming';
  progress: number;
  milestones: string[];
  color: string;
}

const PHASE_DEFINITIONS = [
  { id: 'phase1', name: 'Framework Design & Architecture', startMonth: 1, endMonth: 2, color: 'bg-emerald-500' },
  { id: 'phase2', name: 'System Implementation (Lovable AI)', startMonth: 2, endMonth: 4, color: 'bg-blue-500' },
  { id: 'phase3', name: 'Participant Recruitment & Deployment', startMonth: 3, endMonth: 5, color: 'bg-violet-500' },
  { id: 'phase4', name: 'Data Collection & Monitoring', startMonth: 5, endMonth: 16, color: 'bg-amber-500' },
  { id: 'phase5', name: 'Analysis & Paper Development', startMonth: 14, endMonth: 18, color: 'bg-rose-500' },
];

const currentMonth = 6; // Simulated current month

export function TimelineGanttChart() {
  const { milestones, groupedByPhase, isLoading, stats, createMilestone } = useProjectMilestones();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState<CreateMilestoneInput>({
    phase_name: 'Phase 1',
    milestone_name: '',
    target_date: new Date().toISOString().split('T')[0],
  });

  const projectPhases = useMemo<Phase[]>(() => {
    return PHASE_DEFINITIONS.map((def, idx) => {
      const phaseName = `Phase ${idx + 1}`;
      const phaseMilestones = groupedByPhase[phaseName] || [];
      const progress = phaseMilestones.length > 0
        ? phaseMilestones.reduce((sum, m) => sum + m.progress_percentage, 0) / phaseMilestones.length
        : (currentMonth >= def.endMonth ? 100 : currentMonth >= def.startMonth ? 50 : 0);

      let status: Phase['status'] = 'upcoming';
      if (progress >= 100) status = 'completed';
      else if (progress > 0 || currentMonth >= def.startMonth) status = 'in_progress';

      return {
        ...def,
        status,
        progress,
        milestones: phaseMilestones.map(m => m.milestone_name),
      };
    });
  }, [groupedByPhase]);

  const handleCreateMilestone = () => {
    if (!newMilestone.milestone_name) return;
    createMilestone.mutate(newMilestone, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewMilestone({ phase_name: 'Phase 1', milestone_name: '', target_date: new Date().toISOString().split('T')[0] });
      }
    });
  };

  const totalMonths = 18;
  const monthWidth = 100 / totalMonths;

  const getStatusIcon = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'upcoming':
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">In Progress</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Upcoming</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const completedPhases = projectPhases.filter(p => p.status === 'completed').length;
  const inProgressPhases = projectPhases.filter(p => p.status === 'in_progress').length;
  const upcomingPhases = projectPhases.filter(p => p.status === 'upcoming').length;
  const overallProgress = stats.overallProgress || projectPhases.reduce((sum, p) => sum + p.progress, 0) / projectPhases.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Timeline - Gantt Chart
            </CardTitle>
            <CardDescription>
              14-18 month implementation plan per PRP Section 5
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Milestone</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Select
                  value={newMilestone.phase_name}
                  onValueChange={(v) => setNewMilestone({ ...newMilestone, phase_name: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHASE_DEFINITIONS.map((_, idx) => (
                      <SelectItem key={idx} value={`Phase ${idx + 1}`}>Phase {idx + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Milestone name"
                  value={newMilestone.milestone_name}
                  onChange={(e) => setNewMilestone({ ...newMilestone, milestone_name: e.target.value })}
                />
                <Input
                  type="date"
                  value={newMilestone.target_date}
                  onChange={(e) => setNewMilestone({ ...newMilestone, target_date: e.target.value })}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newMilestone.description || ''}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                />
                <Button onClick={handleCreateMilestone} disabled={createMilestone.isPending} className="w-full">
                  {createMilestone.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Milestone'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Header */}
        <div className="relative">
          <div className="flex border-b border-border pb-2">
            {Array.from({ length: totalMonths }, (_, i) => (
              <div
                key={i}
                className={`text-xs text-center flex-shrink-0 ${i + 1 === currentMonth ? 'font-bold text-primary' : 'text-muted-foreground'}`}
                style={{ width: `${monthWidth}%` }}
              >
                M{i + 1}
              </div>
            ))}
          </div>
          
          {/* Current Month Indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
            style={{ left: `${(currentMonth - 0.5) * monthWidth}%` }}
          />
        </div>

        {/* Gantt Bars */}
        <div className="space-y-4">
          {projectPhases.map((phase) => (
            <div key={phase.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(phase.status)}
                  <span className="font-medium text-sm">{phase.name}</span>
                </div>
                {getStatusBadge(phase.status)}
              </div>
              
              {/* Gantt Bar */}
              <div className="relative h-8 bg-muted/30 rounded">
                <div
                  className={`absolute h-full rounded ${phase.color} opacity-80 flex items-center px-2`}
                  style={{
                    left: `${(phase.startMonth - 1) * monthWidth}%`,
                    width: `${(phase.endMonth - phase.startMonth + 1) * monthWidth}%`
                  }}
                >
                  <span className="text-xs text-white font-medium truncate">
                    {phase.progress.toFixed(0)}% complete
                  </span>
                </div>
              </div>

              {/* Milestones */}
              <div className="flex flex-wrap gap-1 pl-6">
                {phase.milestones.length > 0 ? (
                  phase.milestones.map((milestone, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {milestone}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No milestones defined</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{completedPhases}</div>
            <div className="text-xs text-muted-foreground">Phases Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{inProgressPhases}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">{upcomingPhases}</div>
            <div className="text-xs text-muted-foreground">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{overallProgress.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Overall Progress</div>
          </div>
        </div>

        {/* Alerts */}
        {stats.delayed > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <span className="font-medium text-amber-600">Timeline Alert:</span>
              <span className="text-muted-foreground ml-1">
                {stats.delayed} milestone(s) are delayed. Review and update timelines.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
