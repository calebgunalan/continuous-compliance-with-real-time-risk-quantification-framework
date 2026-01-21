import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

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

const projectPhases: Phase[] = [
  {
    id: 'phase1',
    name: 'Framework Design & Architecture',
    startMonth: 1,
    endMonth: 2,
    status: 'completed',
    progress: 100,
    milestones: ['Architecture documentation', 'Data schemas defined', 'Control library created', 'Risk scenario library'],
    color: 'bg-emerald-500'
  },
  {
    id: 'phase2',
    name: 'System Implementation (Lovable AI)',
    startMonth: 2,
    endMonth: 4,
    status: 'completed',
    progress: 100,
    milestones: ['Evidence collectors built', 'Control testing engine', 'Risk quantification calculator', 'Dashboard interfaces'],
    color: 'bg-blue-500'
  },
  {
    id: 'phase3',
    name: 'Participant Recruitment & Deployment',
    startMonth: 3,
    endMonth: 5,
    status: 'in_progress',
    progress: 65,
    milestones: ['50-80 organizations recruited', 'Evidence collectors configured', 'Baseline measurements captured', 'Team training completed'],
    color: 'bg-violet-500'
  },
  {
    id: 'phase4',
    name: 'Data Collection & Monitoring',
    startMonth: 5,
    endMonth: 16,
    status: 'in_progress',
    progress: 25,
    milestones: ['Weekly data quality checks', 'Monthly check-in calls', 'Incident classification', 'Time-series analysis'],
    color: 'bg-amber-500'
  },
  {
    id: 'phase5',
    name: 'Analysis & Paper Development',
    startMonth: 14,
    endMonth: 18,
    status: 'upcoming',
    progress: 0,
    milestones: ['Statistical analysis complete', 'Visualizations created', 'Case studies synthesized', 'Manuscript drafted'],
    color: 'bg-rose-500'
  }
];

const currentMonth = 6; // Simulated current month

export function TimelineGanttChart() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Project Timeline - Gantt Chart
        </CardTitle>
        <CardDescription>
          14-18 month implementation plan per PRP Section 5
        </CardDescription>
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
                    {phase.progress}% complete
                  </span>
                </div>
              </div>

              {/* Milestones */}
              <div className="flex flex-wrap gap-1 pl-6">
                {phase.milestones.map((milestone, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs"
                  >
                    {milestone}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">2</div>
            <div className="text-xs text-muted-foreground">Phases Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">2</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">1</div>
            <div className="text-xs text-muted-foreground">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">38%</div>
            <div className="text-xs text-muted-foreground">Overall Progress</div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <span className="font-medium text-amber-600">Timeline Alert:</span>
            <span className="text-muted-foreground ml-1">
              Participant recruitment is at 65% - need to accelerate to meet Phase 3 deadline by Month 5.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
