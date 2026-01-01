import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, Layers, ChevronDown, ChevronRight } from "lucide-react";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { useOrganizationControls } from "@/hooks/useControls";

interface FrameworkCategory {
  id: string;
  name: string;
  controls: {
    id: string;
    name: string;
    status: "pass" | "fail" | "warning" | "not_tested";
    passRate: number;
  }[];
}

interface Framework {
  id: string;
  name: string;
  shortName: string;
  categories: FrameworkCategory[];
  coverage: number;
  passing: number;
}

const frameworkConfig: Record<string, { name: string; shortName: string; color: string }> = {
  nist_csf: { name: "NIST Cybersecurity Framework", shortName: "NIST CSF", color: "text-blue-500" },
  iso_27001: { name: "ISO/IEC 27001", shortName: "ISO 27001", color: "text-green-500" },
  soc2: { name: "SOC 2 Type II", shortName: "SOC 2", color: "text-purple-500" },
  cis: { name: "CIS Controls", shortName: "CIS", color: "text-orange-500" },
  cobit: { name: "COBIT 2019", shortName: "COBIT", color: "text-red-500" },
  hipaa: { name: "HIPAA Security Rule", shortName: "HIPAA", color: "text-pink-500" },
  pci_dss: { name: "PCI DSS v4.0", shortName: "PCI DSS", color: "text-yellow-500" },
};

export function FrameworkMappingView() {
  const { organizationId } = useOrganizationContext();
  const { data: orgControls } = useOrganizationControls(organizationId || "");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Group controls by framework and category
  const frameworks: Framework[] = Object.entries(frameworkConfig).map(([frameworkId, config]) => {
    const frameworkControls = orgControls?.filter(
      (oc) => oc.control?.framework === frameworkId
    ) || [];

    const categoriesMap = new Map<string, FrameworkCategory["controls"]>();
    
    frameworkControls.forEach((oc) => {
      const category = oc.control?.category || "General";
      if (!categoriesMap.has(category)) {
        categoriesMap.set(category, []);
      }
      categoriesMap.get(category)?.push({
        id: oc.control?.control_id || oc.id,
        name: oc.control?.name || "Unknown Control",
        status: oc.current_status as "pass" | "fail" | "warning" | "not_tested",
        passRate: Number(oc.pass_rate) || 0,
      });
    });

    const categories: FrameworkCategory[] = Array.from(categoriesMap.entries()).map(
      ([name, controls]) => ({
        id: `${frameworkId}-${name}`,
        name,
        controls,
      })
    );

    const totalControls = frameworkControls.length;
    const passingControls = frameworkControls.filter(
      (c) => c.current_status === "pass"
    ).length;

    return {
      id: frameworkId,
      name: config.name,
      shortName: config.shortName,
      categories,
      coverage: totalControls > 0 ? 100 : 0,
      passing: totalControls > 0 ? Math.round((passingControls / totalControls) * 100) : 0,
    };
  }).filter(f => f.categories.length > 0);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (frameworks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Layers className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Frameworks Configured</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Add compliance controls to see framework coverage and mapping across NIST, ISO 27001, SOC2, and other standards.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <CardTitle>Compliance Framework Mapping</CardTitle>
        </div>
        <CardDescription>
          Control coverage and compliance status across multiple frameworks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={frameworks[0]?.id} className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
            {frameworks.map((framework) => (
              <TabsTrigger 
                key={framework.id} 
                value={framework.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {framework.shortName}
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "ml-2 text-xs",
                    framework.passing >= 80 ? "bg-success/15 text-success" :
                    framework.passing >= 50 ? "bg-warning/15 text-warning" :
                    "bg-destructive/15 text-destructive"
                  )}
                >
                  {framework.passing}%
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {frameworks.map((framework) => (
            <TabsContent key={framework.id} value={framework.id} className="space-y-4">
              {/* Framework Overview */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Total Controls</p>
                  <p className="text-2xl font-bold text-foreground">
                    {framework.categories.reduce((acc, cat) => acc + cat.controls.length, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Passing</p>
                  <p className="text-2xl font-bold text-success">{framework.passing}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold text-foreground">{framework.categories.length}</p>
                </div>
              </div>

              {/* Category List */}
              <div className="space-y-2">
                {framework.categories.map((category) => {
                  const isExpanded = expandedCategories.has(category.id);
                  const passingInCategory = category.controls.filter(c => c.status === "pass").length;
                  const categoryPassRate = Math.round((passingInCategory / category.controls.length) * 100);

                  return (
                    <div key={category.id} className="border border-border rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        onClick={() => toggleCategory(category.id)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium text-foreground">{category.name}</span>
                          <Badge variant="secondary">{category.controls.length} controls</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-24">
                            <Progress 
                              value={categoryPassRate} 
                              className={cn(
                                "h-2",
                                categoryPassRate >= 80 ? "[&>div]:bg-success" :
                                categoryPassRate >= 50 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                              )}
                            />
                          </div>
                          <span className={cn(
                            "text-sm font-semibold w-12 text-right",
                            categoryPassRate >= 80 ? "text-success" :
                            categoryPassRate >= 50 ? "text-warning" : "text-destructive"
                          )}>
                            {categoryPassRate}%
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border bg-muted/20">
                          {category.controls.map((control) => (
                            <div
                              key={control.id}
                              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                {getStatusIcon(control.status)}
                                <div>
                                  <span className="text-xs font-mono text-muted-foreground">
                                    {control.id}
                                  </span>
                                  <p className="text-sm text-foreground">{control.name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {control.passRate}% pass rate
                                </span>
                                <Badge 
                                  className={cn(
                                    "capitalize",
                                    control.status === "pass" ? "bg-success/15 text-success" :
                                    control.status === "fail" ? "bg-destructive/15 text-destructive" :
                                    control.status === "warning" ? "bg-warning/15 text-warning" :
                                    "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {control.status.replace("_", " ")}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
