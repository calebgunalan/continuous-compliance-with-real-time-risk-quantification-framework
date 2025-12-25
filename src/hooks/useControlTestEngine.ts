import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ControlStatus } from '@/types/database';

interface TestResult {
  organizationControlId: string;
  controlId: string;
  controlName: string;
  status: ControlStatus;
  evidence: Record<string, unknown>;
  failureReason?: string;
  remediationRecommendation?: string;
}

interface ControlTestInput {
  organizationControlId: string;
  controlId: string;
  controlName: string;
  category: string;
}

// Simulated control test functions based on control category
const simulateControlTest = (control: ControlTestInput): TestResult => {
  // Simulate realistic test outcomes based on control categories
  const testProbabilities: Record<string, number> = {
    'Identity & Access Management': 0.85,
    'Data Protection': 0.80,
    'Network Security': 0.90,
    'Incident Response': 0.75,
    'Security Monitoring': 0.88,
    'Vulnerability Management': 0.82,
    'Asset Management': 0.78,
    'Access Control': 0.85,
    'Audit & Accountability': 0.80,
    'Configuration Management': 0.75,
  };

  const passProbability = testProbabilities[control.category] || 0.80;
  const random = Math.random();
  
  // Determine status
  let status: ControlStatus;
  if (random < passProbability) {
    status = 'pass';
  } else if (random < passProbability + 0.1) {
    status = 'warning';
  } else {
    status = 'fail';
  }

  // Generate evidence based on status
  const evidence: Record<string, unknown> = {
    testedAt: new Date().toISOString(),
    testMethod: 'automated',
    controlCategory: control.category,
    samplesChecked: Math.floor(Math.random() * 100) + 50,
    compliancePercentage: status === 'pass' ? 95 + Math.random() * 5 : 
                          status === 'warning' ? 70 + Math.random() * 20 : 
                          Math.random() * 70,
  };

  // Generate failure reasons and recommendations for non-passing tests
  const failureReasons: Record<string, string[]> = {
    'Identity & Access Management': [
      'MFA not enabled for 3 privileged accounts',
      'Password policy does not meet minimum requirements',
      'Orphaned accounts detected requiring review',
    ],
    'Data Protection': [
      'Encryption at rest not enabled for sensitive data store',
      'Data classification labels missing on 15% of assets',
      'Backup verification failed for 2 systems',
    ],
    'Network Security': [
      'Firewall rules allow overly permissive access',
      'Network segmentation incomplete for PCI scope',
      'Intrusion detection signatures outdated',
    ],
    'Incident Response': [
      'Incident response plan not tested in past 12 months',
      'Contact list contains outdated information',
      'Escalation procedures not documented',
    ],
  };

  const recommendations: Record<string, string[]> = {
    'Identity & Access Management': [
      'Enable MFA for all privileged accounts immediately',
      'Update password policy to require 14+ characters',
      'Complete quarterly access review process',
    ],
    'Data Protection': [
      'Enable encryption for all data stores containing PII',
      'Implement automated data classification tool',
      'Schedule backup verification tests',
    ],
    'Network Security': [
      'Review and restrict firewall rules to least privilege',
      'Complete network segmentation project',
      'Update IDS/IPS signatures to latest version',
    ],
    'Incident Response': [
      'Schedule tabletop exercise within 30 days',
      'Update all emergency contact information',
      'Document and approve escalation procedures',
    ],
  };

  const categoryFailures = failureReasons[control.category] || failureReasons['Identity & Access Management'];
  const categoryRecs = recommendations[control.category] || recommendations['Identity & Access Management'];

  return {
    organizationControlId: control.organizationControlId,
    controlId: control.controlId,
    controlName: control.controlName,
    status,
    evidence,
    failureReason: status !== 'pass' ? categoryFailures[Math.floor(Math.random() * categoryFailures.length)] : undefined,
    remediationRecommendation: status !== 'pass' ? categoryRecs[Math.floor(Math.random() * categoryRecs.length)] : undefined,
  };
};

export const useRunControlTest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (control: ControlTestInput): Promise<TestResult> => {
      // Simulate test execution with slight delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      const result = simulateControlTest(control);
      
      // Record result to database
      const { error: testError } = await supabase
        .from('control_test_results')
        .insert({
          organization_control_id: result.organizationControlId,
          status: result.status,
          evidence: result.evidence as never,
          failure_reason: result.failureReason || null,
          remediation_recommendation: result.remediationRecommendation || null,
        });

      if (testError) throw testError;

      // Update organization control status
      const { error: updateError } = await supabase
        .from('organization_controls')
        .update({
          current_status: result.status,
          last_tested_at: new Date().toISOString(),
        })
        .eq('id', result.organizationControlId);

      if (updateError) throw updateError;

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['organization_controls'] });
      queryClient.invalidateQueries({ queryKey: ['control_test_results'] });
      queryClient.invalidateQueries({ queryKey: ['controls_pass_rate'] });
      
      const statusMessages: Record<ControlStatus, { title: string; variant: 'default' | 'destructive' }> = {
        pass: { title: 'Control test passed', variant: 'default' },
        warning: { title: 'Control test warning', variant: 'default' },
        fail: { title: 'Control test failed', variant: 'destructive' },
        not_tested: { title: 'Control not tested', variant: 'default' },
      };
      
      toast({
        title: statusMessages[result.status].title,
        description: result.controlName,
        variant: statusMessages[result.status].variant,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Test execution failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
};

export const useRunBatchControlTests = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (controls: ControlTestInput[]): Promise<TestResult[]> => {
      const results: TestResult[] = [];
      
      for (const control of controls) {
        // Simulate test execution with slight delay
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
        
        const result = simulateControlTest(control);
        results.push(result);
        
        // Record result to database
        await supabase
          .from('control_test_results')
          .insert({
            organization_control_id: result.organizationControlId,
            status: result.status,
            evidence: result.evidence as never,
            failure_reason: result.failureReason || null,
            remediation_recommendation: result.remediationRecommendation || null,
          });

        // Update organization control status
        await supabase
          .from('organization_controls')
          .update({
            current_status: result.status,
            last_tested_at: new Date().toISOString(),
          })
          .eq('id', result.organizationControlId);
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['organization_controls'] });
      queryClient.invalidateQueries({ queryKey: ['control_test_results'] });
      queryClient.invalidateQueries({ queryKey: ['controls_pass_rate'] });
      
      const passed = results.filter(r => r.status === 'pass').length;
      const failed = results.filter(r => r.status === 'fail').length;
      const warnings = results.filter(r => r.status === 'warning').length;
      
      toast({
        title: 'Batch test complete',
        description: `${passed} passed, ${warnings} warnings, ${failed} failed out of ${results.length} controls`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Batch test failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
};
