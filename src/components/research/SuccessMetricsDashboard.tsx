import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, CheckCircle2, AlertTriangle, TrendingUp, BookOpen, Server, Briefcase, GraduationCap, Plus, Loader2 } from "lucide-react";
import { useSuccessMetrics, CreateMetricInput } from "@/hooks/useSuccessMetrics";
import { useState } from "react";

const METRIC_CATEGORIES = [
  { value: 'Research Success', icon: <BookOpen className="h-5 w-5" />, description: 'Academic publication and empirical validation metrics' },
  { value: 'Technical Implementation', icon: <Server className="h-5 w-5" />, description: 'System reliability, performance, and feature completeness' },
  { value: 'Practical Impact', icon: <Briefcase className="h-5 w-5" />, description: 'Organizational adoption and demonstrated value' },
  { value: 'Academic Influence', icon: <GraduationCap className="h-5 w-5" />, description: 'Citations, follow-on research, and educational impact' },
];

export function SuccessMetricsDashboard() {
  const { metrics, groupedByCategory, isLoading, stats, createMetric, updateMetric } = useSuccessMetrics();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMetric, setNewMetric] = useState<CreateMetricInput>({
    category: 'Research Success',
    metric_name: '',
    target_value: 100,
    unit: '%',
  });

  const handleCreateMetric = () => {
    if (!newMetric.metric_name) return;
    createMetric.mutate(newMetric, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewMetric({ category: 'Research Success', metric_name: '', target_value: 100, unit: '%' });
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achieved':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'on_track':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'behind':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'achieved':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Achieved</Badge>;
      case 'on_track':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">On Track</Badge>;
      case 'at_risk':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">At Risk</Badge>;
      case 'behind':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">Behind</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Pending</Badge>;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return '[&>div]:bg-emerald-500';
      case 'on_track':
        return '[&>div]:bg-blue-500';
      case 'at_risk':
        return '[&>div]:bg-amber-500';
      case 'behind':
        return '[&>div]:bg-red-500';
      default:
        return '';
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Success Metrics Dashboard
            </CardTitle>
            <CardDescription>
              Per PRP Section 10 - Success Criteria and Evaluation Metrics
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Metric
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Success Metric</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Select
                  value={newMetric.category}
                  onValueChange={(v) => setNewMetric({ ...newMetric, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {METRIC_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Metric name"
                  value={newMetric.metric_name}
                  onChange={(e) => setNewMetric({ ...newMetric, metric_name: e.target.value })}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newMetric.description || ''}
                  onChange={(e) => setNewMetric({ ...newMetric, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Target Value</label>
                    <Input
                      type="number"
                      value={newMetric.target_value || ''}
                      onChange={(e) => setNewMetric({ ...newMetric, target_value: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Unit</label>
                    <Input
                      placeholder="%"
                      value={newMetric.unit || ''}
                      onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateMetric} disabled={createMetric.isPending} className="w-full">
                  {createMetric.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Metric'}
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
            <div className="text-2xl font-bold text-emerald-600">{stats.achieved}</div>
            <div className="text-xs text-muted-foreground">Achieved</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold text-blue-600">{stats.onTrack}</div>
            <div className="text-xs text-muted-foreground">On Track</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto text-amber-600 mb-1" />
            <div className="text-2xl font-bold text-amber-600">{stats.atRisk + stats.behind}</div>
            <div className="text-xs text-muted-foreground">At Risk / Behind</div>
          </div>
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <Target className="h-6 w-6 mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold text-primary">{stats.overallProgress.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Overall Progress</div>
          </div>
        </div>

        {/* Metrics by Category */}
        {metrics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No success metrics defined yet. Add metrics to track project success.
          </div>
        ) : (
          <Tabs defaultValue={METRIC_CATEGORIES[0].value}>
            <TabsList className="grid w-full grid-cols-4">
              {METRIC_CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
                  {cat.value.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {METRIC_CATEGORIES.map((category) => {
              const categoryMetrics = groupedByCategory[category.value] || [];
              
              return (
                <TabsContent key={category.value} value={category.value} className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                    {category.icon}
                    <span>{category.description}</span>
                  </div>

                  {categoryMetrics.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No metrics in this category yet.
                    </div>
                  ) : (
                    categoryMetrics.map((metric) => {
                      const progress = metric.target_value
                        ? Math.min((metric.current_value / metric.target_value) * 100, 100)
                        : 0;

                      return (
                        <div key={metric.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(metric.status)}
                              <span className="font-medium">{metric.metric_name}</span>
                            </div>
                            {getStatusBadge(metric.status)}
                          </div>
                          
                          {metric.description && (
                            <p className="text-sm text-muted-foreground">{metric.description}</p>
                          )}

                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>
                                Current: {metric.current_value}{metric.unit || ''}
                              </span>
                              <span className="text-muted-foreground">
                                Target: {metric.target_value}{metric.unit || ''}
                              </span>
                            </div>
                            <Progress
                              value={progress}
                              className={`h-2 ${getProgressColor(metric.status)}`}
                            />
                          </div>

                          {metric.notes && (
                            <div className="bg-muted/50 rounded p-2 text-sm text-muted-foreground">
                              {metric.notes}
                            </div>
                          )}

                          {metric.status !== 'achieved' && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateMetric.mutate({ 
                                  id: metric.id, 
                                  current_value: metric.current_value + 10 
                                })}
                              >
                                Update Progress
                              </Button>
                              {metric.target_value && metric.current_value >= metric.target_value && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateMetric.mutate({ id: metric.id, status: 'achieved' })}
                                >
                                  Mark Achieved
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}

        {/* Key Achievements */}
        {stats.achieved > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Key Achievements
            </h4>
            <div className="flex flex-wrap gap-2">
              {metrics
                .filter(m => m.status === 'achieved')
                .map((metric) => (
                  <Badge key={metric.id} className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    ✓ {metric.metric_name}
                  </Badge>
                ))
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
