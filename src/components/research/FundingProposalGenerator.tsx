import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, FileText, Download, Building2, GraduationCap, Landmark, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

interface FundingSource {
  id: string;
  name: string;
  type: 'government' | 'foundation' | 'industry' | 'academic';
  budgetRange: string;
  deadline?: string;
  fitScore: number;
  description: string;
  requirements: string[];
  status: 'identified' | 'preparing' | 'submitted' | 'awarded' | 'declined';
}

const fundingSources: FundingSource[] = [
  {
    id: 'nsf-stc',
    name: 'NSF Secure and Trustworthy Cyberspace (SaTC)',
    type: 'government',
    budgetRange: '$300K - $1.2M',
    deadline: 'Rolling (Medium projects)',
    fitScore: 95,
    description: 'Supports research addressing cybersecurity challenges through innovative technical and socio-technical approaches.',
    requirements: [
      'Novel research contribution',
      'Broader impact statement',
      'Data management plan',
      'IRB approval if human subjects',
      'Multi-year timeline'
    ],
    status: 'preparing'
  },
  {
    id: 'dhs-sandt',
    name: 'DHS Science and Technology Directorate',
    type: 'government',
    budgetRange: '$200K - $800K',
    deadline: 'BAA-specific',
    fitScore: 88,
    description: 'Funds cybersecurity research with practical applications for critical infrastructure protection.',
    requirements: [
      'Critical infrastructure relevance',
      'Transition plan to practice',
      'Industry partnerships preferred',
      'Security clearance may be required'
    ],
    status: 'identified'
  },
  {
    id: 'cis-foundation',
    name: 'Center for Internet Security (CIS)',
    type: 'industry',
    budgetRange: '$50K - $150K',
    fitScore: 82,
    description: 'Supports research advancing best practices in cybersecurity controls and benchmarks.',
    requirements: [
      'Alignment with CIS Controls',
      'Practical output deliverables',
      'Publication commitment'
    ],
    status: 'identified'
  },
  {
    id: 'sans-iti',
    name: 'SANS Institute Technology Institute',
    type: 'industry',
    budgetRange: '$25K - $75K',
    fitScore: 78,
    description: 'Funds applied research in security operations, incident response, and security metrics.',
    requirements: [
      'Practitioner-focused outputs',
      'Webinar/presentation commitment',
      'Case study development'
    ],
    status: 'identified'
  },
  {
    id: 'macarthur',
    name: 'MacArthur Foundation (Digital Rights)',
    type: 'foundation',
    budgetRange: '$100K - $500K',
    fitScore: 72,
    description: 'Supports research at the intersection of technology, security, and policy.',
    requirements: [
      'Policy relevance',
      'Public benefit focus',
      'Diverse team composition',
      'Open access commitment'
    ],
    status: 'identified'
  }
];

const proposalTemplate = `# Research Grant Proposal

## Project Title
Continuous Compliance with Real-Time Risk Quantification: An Empirical Validation Framework

## Principal Investigator
[Name], [Title]
[Institution]
[Email] | [Phone]

## Project Summary (250 words max)

This research addresses a fundamental challenge in cybersecurity governance: organizations invest heavily in compliance programs but cannot quantify how these investments reduce actual breach risk. We propose developing and empirically validating a novel framework that integrates continuous compliance monitoring with real-time financial risk quantification using the FAIR methodology.

The project will:
1. Create architectural patterns for continuous compliance monitoring that treats compliance controls as testable code
2. Implement operational FAIR risk quantification with direct control-to-risk integration
3. Conduct a 12-month longitudinal study with 50-80 organizations to validate the correlation between governance maturity and breach probability reduction

Expected outcomes include the first peer-reviewed empirical validation of the maturity-to-risk relationship, demonstrating that each maturity level improvement reduces breach probability following an exponential decay model (P(breach) = base × e^(-k × maturity)).

## Budget Summary

| Category | Year 1 | Year 2 | Total |
|----------|--------|--------|-------|
| Personnel | $175,000 | $175,000 | $350,000 |
| Infrastructure | $15,000 | $15,000 | $30,000 |
| Participant Incentives | $10,000 | $10,000 | $20,000 |
| Dissemination | $5,000 | $5,000 | $10,000 |
| **Total** | **$205,000** | **$205,000** | **$410,000** |

## Intellectual Merit

This research makes three novel contributions:
- First empirical model connecting governance maturity to quantified risk reduction
- Methodology for continuous compliance that reduces detection time from months to hours
- Validated framework for translating compliance investments into financial ROI

## Broader Impacts

- Open-source tools for continuous compliance monitoring
- Educational materials for security governance courses
- Industry guidance for evidence-based security investment
- Dataset for future cybersecurity research`;

export function FundingProposalGenerator() {
  const [selectedSource, setSelectedSource] = useState<FundingSource | null>(fundingSources[0]);
  const [proposal, setProposal] = useState(proposalTemplate);

  const getTypeIcon = (type: FundingSource['type']) => {
    switch (type) {
      case 'government': return <Landmark className="h-4 w-4" />;
      case 'foundation': return <Building2 className="h-4 w-4" />;
      case 'industry': return <Banknote className="h-4 w-4" />;
      case 'academic': return <GraduationCap className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: FundingSource['status']) => {
    switch (status) {
      case 'awarded': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Awarded</Badge>;
      case 'submitted': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Submitted</Badge>;
      case 'preparing': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Preparing</Badge>;
      case 'declined': return <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Declined</Badge>;
      default: return <Badge variant="outline">Identified</Badge>;
    }
  };

  const handleCopyProposal = () => {
    navigator.clipboard.writeText(proposal);
    toast.success("Proposal copied to clipboard");
  };

  const handleDownloadProposal = () => {
    const blob = new Blob([proposal], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grant-proposal.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Proposal downloaded");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5" />
          Funding Proposal Generator
        </CardTitle>
        <CardDescription>
          Per PRP Section 6.6 - Identify and pursue funding sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="sources">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sources">Funding Sources</TabsTrigger>
            <TabsTrigger value="proposal">Proposal Template</TabsTrigger>
            <TabsTrigger value="tracking">Application Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="space-y-4">
            <div className="grid gap-4">
              {fundingSources.map((source) => (
                <div
                  key={source.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedSource?.id === source.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedSource(source)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(source.type)}
                      <span className="font-medium">{source.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(source.status)}
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {source.fitScore}% fit
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2">{source.description}</p>
                  
                  <div className="flex gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Budget: </span>
                      <span className="font-medium">{source.budgetRange}</span>
                    </div>
                    {source.deadline && (
                      <div>
                        <span className="text-muted-foreground">Deadline: </span>
                        <span className="font-medium">{source.deadline}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <span className="text-xs text-muted-foreground">Requirements:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {source.requirements.map((req, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="proposal" className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyProposal}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadProposal}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
            
            <Textarea
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              className="min-h-[500px] font-mono text-sm"
            />

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Proposal Sections Checklist</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  'Project Title',
                  'PI Information',
                  'Project Summary',
                  'Budget Summary',
                  'Intellectual Merit',
                  'Broader Impacts',
                  'Research Plan',
                  'Timeline',
                  'References',
                  'Data Management Plan'
                ].map((section) => (
                  <div key={section} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>{section}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{fundingSources.length}</div>
                <div className="text-xs text-muted-foreground">Sources Identified</div>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {fundingSources.filter(s => s.status === 'preparing').length}
                </div>
                <div className="text-xs text-muted-foreground">In Preparation</div>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {fundingSources.filter(s => s.status === 'submitted').length}
                </div>
                <div className="text-xs text-muted-foreground">Submitted</div>
              </div>
              <div className="bg-emerald-500/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {fundingSources.filter(s => s.status === 'awarded').length}
                </div>
                <div className="text-xs text-muted-foreground">Awarded</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Application Pipeline</h4>
              {fundingSources.map((source) => (
                <div key={source.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(source.type)}
                    <span className="font-medium text-sm">{source.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{source.budgetRange}</span>
                    {getStatusBadge(source.status)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
