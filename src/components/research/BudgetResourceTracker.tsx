import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Users, Server, Gift, TrendingUp, AlertTriangle } from "lucide-react";

interface BudgetCategory {
  name: string;
  budgeted: number;
  spent: number;
  items: { name: string; budgeted: number; spent: number }[];
}

const budgetData: BudgetCategory[] = [
  {
    name: 'Personnel',
    budgeted: 350000,
    spent: 145000,
    items: [
      { name: 'Project Lead (18 months FTE)', budgeted: 150000, spent: 62500 },
      { name: 'Systems Engineer (15 months FTE)', budgeted: 125000, spent: 52000 },
      { name: 'Research Analyst (18 months 0.5 FTE)', budgeted: 45000, spent: 18750 },
      { name: 'Industry Liaison (12 months 0.5 FTE)', budgeted: 30000, spent: 11750 },
    ]
  },
  {
    name: 'Infrastructure & Technology',
    budgeted: 30000,
    spent: 8500,
    items: [
      { name: 'Cloud Hosting (12 months)', budgeted: 22000, spent: 5500 },
      { name: 'Software Licenses', budgeted: 6500, spent: 2500 },
      { name: 'API Services', budgeted: 1500, spent: 500 },
    ]
  },
  {
    name: 'Participant Incentives',
    budgeted: 20000,
    spent: 3200,
    items: [
      { name: 'Standard Participant Stipends', budgeted: 15000, spent: 2400 },
      { name: 'Case Study Compensation', budgeted: 5000, spent: 800 },
    ]
  },
  {
    name: 'Publication & Dissemination',
    budgeted: 10000,
    spent: 1200,
    items: [
      { name: 'Open Access Fees', budgeted: 4000, spent: 0 },
      { name: 'Conference Attendance', budgeted: 5000, spent: 1000 },
      { name: 'Materials & Printing', budgeted: 1000, spent: 200 },
    ]
  }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function BudgetResourceTracker() {
  const totalBudget = budgetData.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = budgetData.reduce((sum, cat) => sum + cat.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallProgress = (totalSpent / totalBudget) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Budget & Resource Tracker
        </CardTitle>
        <CardDescription>
          Per PRP Section 6 - Total Budget: {formatCurrency(totalBudget)}
        </CardDescription>
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
            {budgetData.map((category) => {
              const progress = (category.spent / category.budgeted) * 100;
              const isOverBudget = progress > 100;
              const isNearLimit = progress > 80 && progress <= 100;
              
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}
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
            })}
          </TabsContent>

          {budgetData.map((category, idx) => (
            <TabsContent key={category.name} value={['overview', 'personnel', 'infrastructure', 'incentives', 'publication'][idx + 1]}>
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
                  {category.items.map((item) => {
                    const progress = (item.spent / item.budgeted) * 100;
                    return (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.budgeted)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.spent)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(item.budgeted - item.spent)}
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
            </TabsContent>
          ))}
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
