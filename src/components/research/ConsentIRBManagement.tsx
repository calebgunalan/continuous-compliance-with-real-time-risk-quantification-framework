import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileCheck, 
  Shield, 
  Users, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileText,
  Lock
} from "lucide-react";
import { toast } from "sonner";

interface ConsentRecord {
  organizationId: string;
  organizationName: string;
  signedDate: string | null;
  signatoryName: string | null;
  signatoryTitle: string | null;
  consentVersion: string;
  dataUseApproved: boolean;
  publicationApproved: boolean;
  withdrawalDate: string | null;
}

interface IRBChecklist {
  id: string;
  category: string;
  item: string;
  status: 'complete' | 'in_progress' | 'pending';
  notes?: string;
}

const mockConsents: ConsentRecord[] = [
  {
    organizationId: 'org-001',
    organizationName: 'Acme Financial Services',
    signedDate: '2026-01-05',
    signatoryName: 'John Smith',
    signatoryTitle: 'CISO',
    consentVersion: '1.2',
    dataUseApproved: true,
    publicationApproved: true,
    withdrawalDate: null
  },
  {
    organizationId: 'org-002',
    organizationName: 'HealthFirst Medical',
    signedDate: '2026-01-08',
    signatoryName: 'Sarah Johnson',
    signatoryTitle: 'VP Security',
    consentVersion: '1.2',
    dataUseApproved: true,
    publicationApproved: true,
    withdrawalDate: null
  },
  {
    organizationId: 'org-003',
    organizationName: 'TechStart Inc',
    signedDate: '2026-01-10',
    signatoryName: 'Mike Chen',
    signatoryTitle: 'CTO',
    consentVersion: '1.2',
    dataUseApproved: true,
    publicationApproved: false,
    withdrawalDate: null
  },
  {
    organizationId: 'org-004',
    organizationName: 'Manufacturing Corp',
    signedDate: null,
    signatoryName: null,
    signatoryTitle: null,
    consentVersion: '1.2',
    dataUseApproved: false,
    publicationApproved: false,
    withdrawalDate: null
  }
];

const irbChecklist: IRBChecklist[] = [
  { id: 'irb-1', category: 'Documentation', item: 'Study protocol document finalized', status: 'complete' },
  { id: 'irb-2', category: 'Documentation', item: 'Informed consent template approved', status: 'complete' },
  { id: 'irb-3', category: 'Documentation', item: 'Data management plan submitted', status: 'complete' },
  { id: 'irb-4', category: 'Privacy', item: 'Data anonymization procedures documented', status: 'complete' },
  { id: 'irb-5', category: 'Privacy', item: 'Encryption at rest implemented', status: 'complete' },
  { id: 'irb-6', category: 'Privacy', item: 'Access control policies in place', status: 'complete' },
  { id: 'irb-7', category: 'Privacy', item: 'Data retention schedule defined', status: 'complete' },
  { id: 'irb-8', category: 'Risk', item: 'Risk assessment completed', status: 'complete' },
  { id: 'irb-9', category: 'Risk', item: 'Mitigation strategies documented', status: 'complete' },
  { id: 'irb-10', category: 'Approval', item: 'IRB initial review submitted', status: 'in_progress', notes: 'Under review' },
  { id: 'irb-11', category: 'Approval', item: 'IRB approval received', status: 'pending' },
  { id: 'irb-12', category: 'Ongoing', item: 'Annual renewal submitted', status: 'pending' }
];

const consentTemplate = `INFORMED CONSENT FOR RESEARCH PARTICIPATION

Study Title: Continuous Compliance with Real-Time Risk Quantification Framework
Principal Investigator: [PI Name], [Institution]
IRB Protocol Number: [Protocol Number]

PURPOSE OF THE STUDY
You are being invited to participate in a research study examining the relationship between compliance governance maturity and quantified security risk reduction. The study aims to validate whether continuous compliance monitoring reduces breach probability proportionally to governance maturity level.

WHAT PARTICIPATION INVOLVES
If you agree to participate, your organization will:
1. Deploy our continuous compliance monitoring system
2. Provide API access for evidence collection from your security tools
3. Participate in monthly check-in interviews
4. Complete quarterly surveys
5. Report any security incidents during the study period

DATA COLLECTION
We will collect:
- Compliance control test results (automated, continuous)
- Security configuration snapshots
- Maturity assessment scores (monthly)
- Security incident reports (if any occur)
- Survey and interview responses

CONFIDENTIALITY
All organizational data will be:
- Encrypted at rest and in transit
- Anonymized in any publications
- Accessible only to the research team
- Deleted after the retention period (5 years post-study)

RISKS AND BENEFITS
Risks: Minimal risk of data breach (mitigated by encryption and access controls)
Benefits: Free access to continuous compliance tools, quantified risk metrics, industry benchmarks

VOLUNTARY PARTICIPATION
Participation is voluntary. You may withdraw at any time without penalty.

CONTACT INFORMATION
Questions: [PI Email]
IRB Concerns: [IRB Office Contact]

CONSENT
By signing below, you confirm that you have read and understood this consent form and agree to participate in this research study.

Organization: _______________________
Authorized Signatory: _______________________
Title: _______________________
Signature: _______________________
Date: _______________________`;

export function ConsentIRBManagement() {
  const [consents] = useState<ConsentRecord[]>(mockConsents);
  const [checklist] = useState<IRBChecklist[]>(irbChecklist);

  const signedCount = consents.filter(c => c.signedDate).length;
  const pendingCount = consents.filter(c => !c.signedDate).length;
  const publicationApprovedCount = consents.filter(c => c.publicationApproved).length;

  const completeItems = checklist.filter(c => c.status === 'complete').length;
  const totalItems = checklist.length;
  const complianceScore = Math.round((completeItems / totalItems) * 100);

  const getStatusBadge = (status: IRBChecklist['status']) => {
    switch (status) {
      case 'complete': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1"><CheckCircle2 className="h-3 w-3" />Complete</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 gap-1"><Clock className="h-3 w-3" />In Progress</Badge>;
      case 'pending': return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([consentTemplate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'informed-consent-template.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Consent template downloaded");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Consent & IRB Management
        </CardTitle>
        <CardDescription>
          Per PRP Section 8 - Ethical considerations and informed consent tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-emerald-500/10 rounded-lg p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-600 mb-1" />
            <div className="text-2xl font-bold text-emerald-600">{signedCount}</div>
            <div className="text-xs text-muted-foreground">Consents Signed</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-amber-600 mb-1" />
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 text-center">
            <FileText className="h-6 w-6 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold text-blue-600">{publicationApprovedCount}</div>
            <div className="text-xs text-muted-foreground">Publication OK</div>
          </div>
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <Shield className="h-6 w-6 mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold">{complianceScore}%</div>
            <div className="text-xs text-muted-foreground">IRB Compliance</div>
          </div>
        </div>

        <Tabs defaultValue="consents">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="consents">Consent Tracking</TabsTrigger>
            <TabsTrigger value="irb">IRB Checklist</TabsTrigger>
            <TabsTrigger value="template">Consent Template</TabsTrigger>
          </TabsList>

          <TabsContent value="consents">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Signed Date</TableHead>
                  <TableHead>Signatory</TableHead>
                  <TableHead>Data Use</TableHead>
                  <TableHead>Publication</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consents.map((consent) => (
                  <TableRow key={consent.organizationId}>
                    <TableCell className="font-medium">{consent.organizationName}</TableCell>
                    <TableCell>
                      {consent.signedDate ? new Date(consent.signedDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {consent.signatoryName ? (
                        <div>
                          <div className="font-medium text-sm">{consent.signatoryName}</div>
                          <div className="text-xs text-muted-foreground">{consent.signatoryTitle}</div>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {consent.dataUseApproved ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {consent.publicationApproved ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {consent.signedDate ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Active</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="irb" className="space-y-4">
            {['Documentation', 'Privacy', 'Risk', 'Approval', 'Ongoing'].map((category) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                {checklist.filter(c => c.category === category).map((item) => (
                  <div key={item.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={item.status === 'complete'} disabled />
                      <span className="text-sm">{item.item}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.notes && (
                        <span className="text-xs text-muted-foreground">{item.notes}</span>
                      )}
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 mr-1" />
                Download Template
              </Button>
            </div>
            <pre className="bg-muted/30 rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {consentTemplate}
            </pre>
          </TabsContent>
        </Tabs>

        {/* Data Security Summary */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Data Security Measures (PRP Section 8.3)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Encryption at rest (AES-256)',
              'Encryption in transit (TLS 1.3)',
              'Role-based access controls',
              'Audit logging enabled',
              'Anonymization procedures',
              'Secure deletion policy'
            ].map((measure) => (
              <div key={measure} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>{measure}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
