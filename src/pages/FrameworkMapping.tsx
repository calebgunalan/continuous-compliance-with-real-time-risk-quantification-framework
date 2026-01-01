import { AppLayout } from "@/components/layout/AppLayout";
import { FrameworkMappingView } from "@/components/compliance/FrameworkMappingView";

export default function FrameworkMappingPage() {
  return (
    <AppLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Framework Mapping
        </h1>
        <p className="mt-1 text-muted-foreground">
          View control coverage across NIST CSF, ISO 27001, SOC 2, and other compliance frameworks
        </p>
      </div>

      <div className="animate-slide-up">
        <FrameworkMappingView />
      </div>
    </AppLayout>
  );
}
