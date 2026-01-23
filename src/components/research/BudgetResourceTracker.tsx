import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Users, TrendingUp, Plus, Loader2 } from "lucide-react";
import { useBudgetItems, CreateBudgetInput } from "@/hooks/useBudgetItems";
import { useState } from "react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const CATEGORIES = ['Personnel', 'Infrastructure & Technology', 'Participant Incentives', 'Publication & Dissemination'];

export function BudgetResourceTracker() {
  const { items, groupedByCategory, isLoading, stats, createItem, updateItem } = useBudgetItems();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<CreateBudgetInput>({
    category: 'Personnel',
    item_name: '',
    budgeted_amount: 0,
  });

  const handleCreateItem = () => {
    if (!newItem.item_name || newItem.budgeted_amount <= 0) return;
    createItem.mutate(newItem, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewItem({ category: 'Personnel', item_name: '', budgeted_amount: 0 });
      }
    });
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

  const totalBudget = stats.totalBudgeted || 410000; // Fallback to PRP default if empty
  const totalSpent = stats.totalSpent;
  const totalRemaining = totalBudget - totalSpent;
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget & Resource Tracker
            </CardTitle>
            <CardDescription>
              Per PRP Section 6 - Total Budget: {formatCurrency(totalBudget)}
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Budget Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Select
                  value={newItem.category}
                  onValueChange={(v) => setNewItem({ ...newItem, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Item name"
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Budgeted amount"
                  value={newItem.budgeted_amount || ''}
                  onChange={(e) => setNewItem({ ...newItem, budgeted_amount: Number(e.target.value) })}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
                <Button onClick={handleCreateItem} disabled={createItem.isPending} className="w-full">
                  {createItem.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Item'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <DollarSign className="h-6 w-6 mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <div className="text-xs text-muted-foreground">Total Budget</div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto text-emerald-600 mb-1" />
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalSpent)}</div>
            <div className="text-xs text-muted-foreground">Spent to Date</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 text-center">
            <DollarSign className="h-6 w-6 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalRemaining)}</div>
            <div className="text-xs text-muted-foreground">Remaining</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-4 text-center">
            <Users className="h-6 w-6 mx-auto text-amber-600 mb-1" />
            <div className="text-2xl font-bold text-amber-600">{overallProgress.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Budget Used</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personnel">Personnel</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="incentives">Incentives</TabsTrigger>
            <TabsTrigger value="publication">Publication</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No budget items yet. Add items to track spending.
              </div>
            ) : (
              stats.categoryTotals.map((cat) => {
                const progress = cat.budgeted > 0 ? (cat.spent / cat.budgeted) * 100 : 0;
                const isOverBudget = progress > 100;
                const isNearLimit = progress > 80 && progress <= 100;
                
                return (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{cat.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(cat.spent)} / {formatCurrency(cat.budgeted)}
                        </span>
                        {isOverBudget && (
                          <Badge variant="destructive">Over Budget</Badge>
                        )}
                        {isNearLimit && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600">Near Limit</Badge>
                        )}
                      </div>
                    </div>
                    <Progress
                      value={Math.min(progress, 100)}
                      className={`h-2 ${isOverBudget ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-amber-500' : ''}`}
                    />
                  </div>
                );
              })
            )}
          </TabsContent>

          {CATEGORIES.map((category, idx) => {
            const categoryItems = groupedByCategory[category] || [];
            const tabValue = ['overview', 'personnel', 'infrastructure', 'incentives', 'publication'][idx + 1];
            
            return (
              <TabsContent key={category} value={tabValue}>
                {categoryItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No items in this category yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Budgeted</TableHead>
                        <TableHead className="text-right">Spent</TableHead>
                        <TableHead className="text-right">Remaining</TableHead>
                        <TableHead className="text-right">Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryItems.map((item) => {
                        const progress = item.budgeted_amount > 0 
                          ? (item.spent_amount / item.budgeted_amount) * 100 
                          : 0;
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.item_name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.budgeted_amount)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.spent_amount)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatCurrency(item.budgeted_amount - item.spent_amount)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant={progress > 80 ? "outline" : "secondary"} className={progress > 80 ? "bg-amber-500/10 text-amber-600" : ""}>
                                {progress.toFixed(0)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Funding Sources */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Potential Funding Sources (PRP Section 6.6)</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              'NSF Secure and Trustworthy Cyberspace',
              'DHS Science and Technology Directorate',
              'Industry Consortia (CIS, SANS)',
              'Private Foundations (MacArthur)'
            ].map((source) => (
              <Badge key={source} variant="outline" className="justify-start">
                {source}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
