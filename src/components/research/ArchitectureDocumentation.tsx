import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Network, 
  Database, 
  Shield,
  Calculator,
  Layers,
  FileCode,
  GitBranch,
  Box
} from "lucide-react";

export function ArchitectureDocumentation() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>System Architecture Documentation</CardTitle>
          </div>
          <CardDescription>
            Comprehensive technical architecture for continuous compliance with real-time risk quantification
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-2">
            <Layers className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            Data Layer
          </TabsTrigger>
          <TabsTrigger value="evidence" className="gap-2">
            <FileCode className="h-4 w-4" />
            Evidence
          </TabsTrigger>
          <TabsTrigger value="risk" className="gap-2">
            <Calculator className="h-4 w-4" />
            Risk Engine
          </TabsTrigger>
          <TabsTrigger value="components" className="gap-2">
            <Box className="h-4 w-4" />
            Components
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* System Overview Diagram */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Three-Layer Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-6 rounded-lg font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Compliance  │  │    Risk     │  │  Executive  │  │  Research   │        │
│  │  Dashboard  │  │  Dashboard  │  │   Reports   │  │ Validation  │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        React Application                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │ Control Test │  │     FAIR     │  │   Maturity   │              │   │
│  │  │    Engine    │  │  Calculator  │  │  Assessor    │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Edge Functions                                │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │   AWS    │  │  Azure   │  │   Okta   │  │ Scheduled│            │   │
│  │  │Collector │  │Collector │  │Collector │  │  Tests   │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Supabase                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │ PostgreSQL  │  │    Auth     │  │   Storage   │                 │   │
│  │  │  Database   │  │   (Users)   │  │  (Evidence) │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                  `}</pre>
                </div>
              </CardContent>
            </Card>

            {/* Key Principles */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Design Principles</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">1</Badge>
                      <span><strong>Continuous over Periodic</strong> - Real-time monitoring replaces point-in-time audits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <span><strong>Compliance as Code</strong> - Controls encoded as executable tests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">3</Badge>
                      <span><strong>Risk Quantification</strong> - FAIR methodology for financial impact</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">4</Badge>
                      <span><strong>Evidence-Based</strong> - All assertions backed by collected evidence</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Technology Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge>Frontend</Badge>
                      <span>React 18, TypeScript, Tailwind CSS, Recharts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge>Backend</Badge>
                      <span>Supabase Edge Functions (Deno)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge>Database</Badge>
                      <span>PostgreSQL with Row-Level Security</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge>Auth</Badge>
                      <span>Supabase Auth with role-based access</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <div className="space-y-6">
            {/* Entity Relationship Diagram */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Schema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre">{`
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   organizations  │       │     controls     │       │ threat_scenarios │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ name             │       │ control_id       │       │ name             │
│ industry         │       │ framework        │       │ threat_type      │
│ size             │       │ category         │       │ asset_at_risk    │
│ current_maturity │       │ severity         │       │ vulnerability    │
│ risk_exposure    │       │ test_frequency   │       │ loss_magnitude   │
└────────┬─────────┘       └────────┬─────────┘       │ organization_id  │
         │                          │                 └────────┬─────────┘
         │                          │                          │
         ▼                          ▼                          │
┌──────────────────┐       ┌──────────────────┐               │
│ organization_    │       │ control_test_    │               │
│ controls         │       │ results          │               │
├──────────────────┤       ├──────────────────┤               │
│ id (PK)          │◄──────│ org_control_id   │               │
│ organization_id  │       │ status           │               │
│ control_id       │       │ evidence         │               │
│ current_status   │       │ tested_at        │               │
│ pass_rate        │       │ failure_reason   │               │
└──────────────────┘       └──────────────────┘               │
         │                                                     │
         │                 ┌──────────────────┐               │
         │                 │ breach_incidents │               │
         │                 ├──────────────────┤               │
         └────────────────►│ organization_id  │◄──────────────┘
                           │ incident_type    │
                           │ severity         │
                           │ maturity_at_time │
                           │ financial_impact │
                           └──────────────────┘

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ evidence_sources │       │ risk_calculations│       │maturity_assess   │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ organization_id  │       │ organization_id  │       │ organization_id  │
│ source_type      │       │ control_pass_rate│       │ overall_level    │
│ connection_config│       │ compliance_score │       │ domain_scores    │
│ last_collection  │       │ total_risk       │       │ assessed_at      │
└──────────────────┘       └──────────────────┘       └──────────────────┘
                  `}</pre>
                </div>
              </CardContent>
            </Card>

            {/* Key Tables Description */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Core Tables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Badge variant="secondary">organizations</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Study participants with industry, size, and current risk metrics
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary">controls</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Framework-specific control definitions (NIST, ISO, SOC2, etc.)
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary">organization_controls</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Control implementation status per organization with pass rates
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary">control_test_results</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Historical test results with evidence and failure reasons
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Research Tables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Badge variant="secondary">breach_incidents</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Security incidents with maturity context for correlation analysis
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary">study_participants</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Research enrollment tracking with consent and study group
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary">audit_comparisons</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Traditional vs continuous metrics for comparative analysis
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary">control_effectiveness</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Per-control vulnerability reduction measurements
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="evidence">
          <div className="space-y-6">
            {/* Evidence Flow */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Evidence Collection Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-6 rounded-lg font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EVIDENCE SOURCES                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │   AWS   │  │  Azure  │  │  Okta   │  │  GCP    │  │ On-Prem │           │
│  │CloudTrail│ │Entra ID │  │  Users  │  │ Logging │  │   AD    │           │
│  │   IAM   │  │Activity │  │   MFA   │  │   IAM   │  │  SIEM   │           │
│  │   S3    │  │  NSGs   │  │  Apps   │  │   GKE   │  │Firewall │           │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘           │
└───────┼────────────┼────────────┼────────────┼────────────┼─────────────────┘
        │            │            │            │            │
        ▼            ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EDGE FUNCTIONS (Deno)                                │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  collect-aws-evidence  │  collect-azure-evidence  │  collect-okta    │  │
│  │  ─────────────────────  ─────────────────────────  ─────────────────  │  │
│  │  • API authentication   • Incremental collection  • Rate limiting    │  │
│  │  • Error handling       • Retry logic             • Timeout handling │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────┬──────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NORMALIZATION LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    evidenceNormalization.ts                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │  │
│  │  │  Identity   │  │   Access    │  │   Network   │  │   Config   │  │  │
│  │  │ Normalizer  │  │ Normalizer  │  │ Normalizer  │  │ Normalizer │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │  │
│  │                                                                       │  │
│  │  Unified Schema: { source, type, timestamp, data, status }           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────┬──────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EVIDENCE REPOSITORY                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Tables    │  Indexed by organization, timestamp, type    │  │
│  │  ─────────────────────  ─────────────────────────────────────────    │  │
│  │  • evidence_sources   │  • Retention policies                        │  │
│  │  • collected_evidence │  • Archival strategies                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                  `}</pre>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Types */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">AWS Evidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• CloudTrail audit logs</li>
                    <li>• IAM users, roles, policies</li>
                    <li>• Security Group configurations</li>
                    <li>• S3 bucket policies & encryption</li>
                    <li>• Config compliance rules</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Azure Evidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Entra ID users & groups</li>
                    <li>• Activity logs</li>
                    <li>• Network Security Groups</li>
                    <li>• Policy compliance status</li>
                    <li>• Defender recommendations</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Okta Evidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• User directory status</li>
                    <li>• MFA enrollment status</li>
                    <li>• Group memberships</li>
                    <li>• Application assignments</li>
                    <li>• Authentication logs</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <div className="space-y-6">
            {/* FAIR Model */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  FAIR Risk Quantification Model
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-6 rounded-lg font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{`
                              ┌─────────────────┐
                              │   Annual Risk   │
                              │    Exposure     │
                              │   (ALE = $)     │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                      │
           ┌────────▼────────┐                   ┌────────▼────────┐
           │  Loss Event     │                   │  Loss Magnitude │
           │   Frequency     │                   │      ($)        │
           │  (per year)     │                   │                 │
           └────────┬────────┘                   └────────┬────────┘
                    │                                      │
        ┌───────────┴───────────┐               ┌─────────┴─────────┐
        │                       │               │                   │
┌───────▼───────┐      ┌───────▼───────┐ ┌─────▼─────┐     ┌───────▼───────┐
│ Threat Event  │      │ Vulnerability │ │  Primary  │     │   Secondary   │
│  Frequency    │   ×  │  (0-1)        │ │   Loss    │  +  │     Loss      │
│  (attempts)   │      │               │ │           │     │               │
└───────┬───────┘      └───────┬───────┘ └───────────┘     └───────────────┘
        │                      │
        │           ┌──────────┴──────────┐
        │           │                      │
        │    ┌──────▼──────┐       ┌──────▼──────┐
        │    │  Control    │       │   Threat    │
        │    │Effectiveness│   ×   │ Capability  │
        │    │  (0-1)      │       │   (0-1)     │
        │    └──────┬──────┘       └─────────────┘
        │           │
        │           │   ◄─── FROM CONTINUOUS COMPLIANCE MONITORING
        │           │         (Control pass rates → Effectiveness)
        │           │
        │    ┌──────▼──────────────────────────────┐
        │    │  Control Test Results               │
        │    │  • Pass rate per control            │
        │    │  • Weighted by severity             │
        │    │  • Aggregated by threat scenario    │
        │    └─────────────────────────────────────┘
        │
┌───────▼─────────────────────────────────────────┐
│  Threat Intelligence + Historical Data          │
│  • Industry attack frequency data               │
│  • Organization's historical incidents          │
│  • Threat landscape changes                     │
└─────────────────────────────────────────────────┘
                  `}</pre>
                </div>
              </CardContent>
            </Card>

            {/* Calculation Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Key Formulas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-3 rounded font-mono text-sm">
                    <p className="text-muted-foreground mb-1">Loss Event Frequency:</p>
                    <code>LEF = TEF × Vulnerability</code>
                  </div>
                  <div className="bg-muted/50 p-3 rounded font-mono text-sm">
                    <p className="text-muted-foreground mb-1">Vulnerability:</p>
                    <code>V = (1 - ControlEffectiveness) × ThreatCapability</code>
                  </div>
                  <div className="bg-muted/50 p-3 rounded font-mono text-sm">
                    <p className="text-muted-foreground mb-1">Annual Loss Exposure:</p>
                    <code>ALE = LEF × (PrimaryLoss + SecondaryLoss)</code>
                  </div>
                  <div className="bg-muted/50 p-3 rounded font-mono text-sm">
                    <p className="text-muted-foreground mb-1">Breach Probability:</p>
                    <code>P(breach) = base × e^(-k × maturity_level)</code>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Monte Carlo Simulation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    The risk engine uses Monte Carlo simulation to handle uncertainty:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">1</Badge>
                      <span>Model each parameter as probability distribution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <span>Run 10,000+ iterations sampling from distributions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">3</Badge>
                      <span>Generate percentile-based confidence intervals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">4</Badge>
                      <span>Report 10th, 50th, 90th percentile estimates</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="components">
          <div className="space-y-6">
            {/* Component Hierarchy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Component Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Dashboard Components */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Dashboard
                    </h4>
                    <div className="space-y-2 pl-6 border-l-2 border-muted">
                      <Badge variant="secondary" className="text-xs">ComplianceGauge</Badge>
                      <Badge variant="secondary" className="text-xs">RiskExposureChart</Badge>
                      <Badge variant="secondary" className="text-xs">MaturityIndicator</Badge>
                      <Badge variant="secondary" className="text-xs">ControlStatusList</Badge>
                      <Badge variant="secondary" className="text-xs">ThreatScenarioCard</Badge>
                      <Badge variant="secondary" className="text-xs">BreachProbabilityTracker</Badge>
                    </div>
                  </div>

                  {/* Compliance Components */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-primary" />
                      Compliance
                    </h4>
                    <div className="space-y-2 pl-6 border-l-2 border-muted">
                      <Badge variant="secondary" className="text-xs">ControlTestRunner</Badge>
                      <Badge variant="secondary" className="text-xs">ControlDriftDetector</Badge>
                      <Badge variant="secondary" className="text-xs">ControlRiskImpact</Badge>
                      <Badge variant="secondary" className="text-xs">DetectionTimeAnalyzer</Badge>
                      <Badge variant="secondary" className="text-xs">FrameworkMappingView</Badge>
                      <Badge variant="secondary" className="text-xs">ScheduledTestConfig</Badge>
                    </div>
                  </div>

                  {/* Risk Components */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-primary" />
                      Risk
                    </h4>
                    <div className="space-y-2 pl-6 border-l-2 border-muted">
                      <Badge variant="secondary" className="text-xs">MonteCarloSimulation</Badge>
                      <Badge variant="secondary" className="text-xs">WhatIfScenarioModeler</Badge>
                      <Badge variant="secondary" className="text-xs">InvestmentPrioritizer</Badge>
                    </div>
                  </div>

                  {/* Research Components */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      Research
                    </h4>
                    <div className="space-y-2 pl-6 border-l-2 border-muted">
                      <Badge variant="secondary" className="text-xs">BreachIncidentTracker</Badge>
                      <Badge variant="secondary" className="text-xs">CorrelationValidator</Badge>
                      <Badge variant="secondary" className="text-xs">BeforeAfterComparison</Badge>
                      <Badge variant="secondary" className="text-xs">TraditionalAuditSimulator</Badge>
                      <Badge variant="secondary" className="text-xs">DecisionExperiment</Badge>
                      <Badge variant="secondary" className="text-xs">UserFeedbackCollector</Badge>
                      <Badge variant="secondary" className="text-xs">InterviewGuide</Badge>
                    </div>
                  </div>

                  {/* Reports Components */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      Reports
                    </h4>
                    <div className="space-y-2 pl-6 border-l-2 border-muted">
                      <Badge variant="secondary" className="text-xs">BusinessCaseGenerator</Badge>
                      <Badge variant="secondary" className="text-xs">ComplianceSummaryReport</Badge>
                      <Badge variant="secondary" className="text-xs">ExecutiveReportExport</Badge>
                      <Badge variant="secondary" className="text-xs">PDFReportGenerator</Badge>
                    </div>
                  </div>

                  {/* Admin Components */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Network className="h-4 w-4 text-primary" />
                      Admin
                    </h4>
                    <div className="space-y-2 pl-6 border-l-2 border-muted">
                      <Badge variant="secondary" className="text-xs">StudyParticipantsManager</Badge>
                      <Badge variant="secondary" className="text-xs">UserRoleManager</Badge>
                      <Badge variant="secondary" className="text-xs">DataExporter</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Hooks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Custom Hooks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-3 rounded">
                    <code className="text-sm font-semibold">useControls</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      Fetches organization controls with pass rates
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded">
                    <code className="text-sm font-semibold">useRiskCalculations</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      Real-time risk exposure calculations
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded">
                    <code className="text-sm font-semibold">useThreatScenarios</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      FAIR threat scenario management
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded">
                    <code className="text-sm font-semibold">useBreachIncidents</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      Security incident tracking for research
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded">
                    <code className="text-sm font-semibold">useControlTestEngine</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automated control testing execution
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded">
                    <code className="text-sm font-semibold">useEvidenceSources</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      Evidence collection status monitoring
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
