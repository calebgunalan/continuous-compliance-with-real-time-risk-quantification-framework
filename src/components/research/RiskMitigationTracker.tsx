import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, Shield, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Risk {
  id: string;
  name: string;
  description: string;
  likelihood: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  status: 'mitigated' | 'monitoring' | 'active' | 'resolved';
  mitigationStrategies: string[];
  currentActions: string[];
}

interface RiskCategory {
  name: string;
  icon: React.ReactNode;
  risks: Risk[];
}

const riskCategories: RiskCategory[] = [
  {
    name: 'Technical Risks',
    icon: <Shield className="h-4 w-4" />,
    risks: [
      {
        id: 'tech1',
        name: 'Evidence Collection Complexity',
        description: 'API limitations, rate limiting, or authentication complexities at participating organizations',
        likelihood: 'medium',
        impact: 'high',
        status: 'monitoring',
        mitigationStrategies: [
          'Conduct technical feasibility assessments with pilot organizations',
          'Prioritize common, well-documented platforms',
          'Design for graceful handling of partial evidence',
          'Maintain flexibility in collection approach'
        ],
        currentActions: ['Running pilot with 3 organizations', 'Documenting API quirks']
      },
      {
        id: 'tech2',
        name: 'Performance Degradation',
        description: 'System performance degrades with realistic data volumes and user loads',
        likelihood: 'low',
        impact: 'medium',
        status: 'mitigated',
        mitigationStrategies: [
          'Load testing with realistic data volumes',
          'Performance monitoring and alerting',
          'Scalable architecture design',
          'Caching and async processing'
        ],
        currentActions: ['Implemented caching layer', 'Set up performance dashboards']
      },
      {
        id: 'tech3',
        name: 'Risk Calculation Errors',
        description: 'Bugs or errors in FAIR implementation producing incorrect risk estimates',
        likelihood: 'medium',
        impact: 'high',
        status: 'monitoring',
        mitigationStrategies: [
          'Unit tests for calculation components',
          'Integration tests against hand-calculated examples',
          'Peer review by FAIR methodology experts',
          'Comparison with commercial tools'
        ],
        currentActions: ['Created test suite', 'Awaiting external FAIR expert review']
      }
    ]
  },
  {
    name: 'Recruitment & Retention Risks',
    icon: <AlertTriangle className="h-4 w-4" />,
    risks: [
      {
        id: 'recruit1',
        name: 'Insufficient Participant Recruitment',
        description: 'Unable to recruit 50-80 organizations for the study',
        likelihood: 'medium',
        impact: 'high',
        status: 'active',
        mitigationStrategies: [
          'Leverage personal networks and professional relationships',
          'Create compelling value proposition materials',
          'Offer tiered participation levels',
          'Partner with industry associations'
        ],
        currentActions: ['42 organizations enrolled', 'Outreach to 15 more pending']
      },
      {
        id: 'recruit2',
        name: 'Participant Dropout',
        description: 'Organizations withdraw during 12-month study period',
        likelihood: 'medium',
        impact: 'medium',
        status: 'monitoring',
        mitigationStrategies: [
          'Regular engagement through monthly check-ins',
          'Continuous value delivery',
          'Milestone recognition',
          'Flexible participation burden'
        ],
        currentActions: ['Monthly newsletter active', 'Quarterly executive briefings scheduled']
      }
    ]
  },
  {
    name: 'Research Validity Risks',
    icon: <Shield className="h-4 w-4" />,
    risks: [
      {
        id: 'valid1',
        name: 'Selection Bias',
        description: 'Participating organizations differ systematically from general population',
        likelihood: 'high',
        impact: 'medium',
        status: 'monitoring',
        mitigationStrategies: [
          'Transparent reporting of sample characteristics',
          'Recruit across diverse organization types',
          'Acknowledge limitations in discussion',
          'Compare with industry benchmarks'
        ],
        currentActions: ['Tracking diversity metrics', 'Documenting limitations section']
      },
      {
        id: 'valid2',
        name: 'Confounding Variables',
        description: 'External factors influence breach probability beyond maturity improvements',
        likelihood: 'medium',
        impact: 'high',
        status: 'monitoring',
        mitigationStrategies: [
          'Use industry sector as control variable',
          'Track external events and major vulnerabilities',
          'Statistical controls for size and complexity',
          'Large sample size to average random variation'
        ],
        currentActions: ['Threat landscape monitoring active', 'Control variables defined']
      },
      {
        id: 'valid3',
        name: 'Measurement Validity',
        description: 'Systematic errors in maturity assessment or risk calculations',
        likelihood: 'low',
        impact: 'high',
        status: 'mitigated',
        mitigationStrategies: [
          'Triangulation with multiple assessment methods',
          'Validation against external audit results',
          'Expert review of measurement approaches'
        ],
        currentActions: ['Triangulation implemented', 'External validation pending']
      }
    ]
  },
  {
    name: 'Timeline & Scope Risks',
    icon: <Clock className="h-4 w-4" />,
    risks: [
      {
        id: 'time1',
        name: 'Timeline Overrun',
        description: 'Project extends beyond 14-16 month target',
        likelihood: 'medium',
        impact: 'medium',
        status: 'monitoring',
        mitigationStrategies: [
          'Buffer time in schedule',
          'Parallel workstreams',
          'Regular milestone monitoring',
          'Scope adjustment if needed'
        ],
        currentActions: ['Weekly progress reviews', 'Parallel tracks active']
      },
      {
        id: 'time2',
        name: 'Scope Creep',
        description: 'Project expands beyond initial boundaries',
        likelihood: 'medium',
        impact: 'low',
        status: 'mitigated',
        mitigationStrategies: [
          'Disciplined prioritization',
          'Defer lower-priority activities',
          'Regular scope reviews'
        ],
        currentActions: ['Scope document maintained', 'Change control process active']
      }
    ]
  }
];

const getLikelihoodColor = (likelihood: Risk['likelihood']) => {
  switch (likelihood) {
    case 'high': return 'bg-red-500/10 text-red-600 border-red-500/30';
    case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
    case 'low': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
  }
};

const getStatusIcon = (status: Risk['status']) => {
  switch (status) {
    case 'resolved': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'mitigated': return <Shield className="h-4 w-4 text-blue-500" />;
    case 'monitoring': return <Clock className="h-4 w-4 text-amber-500" />;
    case 'active': return <AlertTriangle className="h-4 w-4 text-red-500" />;
  }
};

const getStatusBadge = (status: Risk['status']) => {
  switch (status) {
    case 'resolved': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Resolved</Badge>;
    case 'mitigated': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Mitigated</Badge>;
    case 'monitoring': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Monitoring</Badge>;
    case 'active': return <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Active</Badge>;
  }
};

export function RiskMitigationTracker() {
  const allRisks = riskCategories.flatMap(cat => cat.risks);
  const activeRisks = allRisks.filter(r => r.status === 'active').length;
  const monitoringRisks = allRisks.filter(r => r.status === 'monitoring').length;
  const mitigatedRisks = allRisks.filter(r => r.status === 'mitigated' || r.status === 'resolved').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Risk Mitigation Tracker
        </CardTitle>
        <CardDescription>
          Per PRP Section 7 - Monitoring {allRisks.length} identified risks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-500/10 rounded-lg p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto text-red-600 mb-1" />
            <div className="text-2xl font-bold text-red-600">{activeRisks}</div>
            <div className="text-xs text-muted-foreground">Active Risks</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-amber-600 mb-1" />
            <div className="text-2xl font-bold text-amber-600">{monitoringRisks}</div>
            <div className="text-xs text-muted-foreground">Monitoring</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 text-center">
            <Shield className="h-6 w-6 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold text-blue-600">{mitigatedRisks}</div>
            <div className="text-xs text-muted-foreground">Mitigated</div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-600 mb-1" />
            <div className="text-2xl font-bold text-emerald-600">
              {((mitigatedRisks / allRisks.length) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Risk Coverage</div>
          </div>
        </div>

        {/* Risk Categories */}
        <Accordion type="multiple" className="space-y-2">
          {riskCategories.map((category) => (
            <AccordionItem key={category.name} value={category.name} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  {category.icon}
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {category.risks.length} risks
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {category.risks.map((risk) => (
                  <div key={risk.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(risk.status)}
                        <span className="font-medium">{risk.name}</span>
                      </div>
                      {getStatusBadge(risk.status)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{risk.description}</p>
                    
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getLikelihoodColor(risk.likelihood)}>
                        Likelihood: {risk.likelihood}
                      </Badge>
                      <Badge variant="outline" className={getLikelihoodColor(risk.impact)}>
                        Impact: {risk.impact}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <h5 className="text-xs font-medium text-muted-foreground mb-2">Mitigation Strategies</h5>
                        <ul className="text-xs space-y-1">
                          {risk.mitigationStrategies.map((strategy, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-primary">•</span>
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-muted-foreground mb-2">Current Actions</h5>
                        <ul className="text-xs space-y-1">
                          {risk.currentActions.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
