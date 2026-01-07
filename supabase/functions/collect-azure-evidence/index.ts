import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AzureCredentials {
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

interface EvidenceResult {
  source: string;
  evidenceType: string;
  data: Record<string, unknown>;
  collectedAt: string;
  status: 'success' | 'error';
  error?: string;
}

async function collectEntraIDEvidence(credentials: AzureCredentials): Promise<EvidenceResult> {
  console.log('Collecting Entra ID (Azure AD) evidence');
  
  // Simulated Entra ID data
  const simulatedEntraID = {
    tenantInfo: {
      displayName: 'Contoso Corporation',
      verifiedDomains: ['contoso.com', 'contoso.onmicrosoft.com'],
    },
    users: {
      totalUsers: 312,
      guestUsers: 28,
      memberUsers: 284,
      usersWithMFA: 298,
      mfaCoverage: 0.955,
    },
    conditionalAccess: {
      totalPolicies: 12,
      enabledPolicies: 10,
      policies: [
        { name: 'Require MFA for admins', state: 'enabled', targets: 'All administrators' },
        { name: 'Block legacy auth', state: 'enabled', targets: 'All users' },
        { name: 'Require compliant device', state: 'enabled', targets: 'All users' },
      ],
    },
    privilegedRoles: {
      globalAdmins: 3,
      securityAdmins: 5,
      userAdmins: 8,
      roleActivationsLast30d: 45,
    },
  };

  return {
    source: 'azure-entra-id',
    evidenceType: 'identity_management',
    data: simulatedEntraID,
    collectedAt: new Date().toISOString(),
    status: 'success',
  };
}

async function collectActivityLogsEvidence(credentials: AzureCredentials): Promise<EvidenceResult> {
  console.log('Collecting Azure Activity Logs evidence');
  
  // Simulated Activity Logs
  const simulatedLogs = {
    timeRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
    summary: {
      totalEvents: 15420,
      administrativeEvents: 234,
      securityEvents: 89,
      alertEvents: 12,
    },
    criticalEvents: [
      { operation: 'Delete resource group', caller: 'admin@contoso.com', timestamp: new Date().toISOString() },
      { operation: 'Modify NSG rule', caller: 'security@contoso.com', timestamp: new Date().toISOString() },
    ],
    diagnosticSettings: {
      logsRetentionDays: 90,
      sentToLogAnalytics: true,
      sentToStorageAccount: true,
      sentToEventHub: false,
    },
  };

  return {
    source: 'azure-activity-logs',
    evidenceType: 'audit_logging',
    data: simulatedLogs,
    collectedAt: new Date().toISOString(),
    status: 'success',
  };
}

async function collectNetworkSecurityEvidence(credentials: AzureCredentials): Promise<EvidenceResult> {
  console.log('Collecting Azure Network Security evidence');
  
  // Simulated NSG data
  const simulatedNSGs = {
    totalNSGs: 18,
    networkSecurityGroups: [
      {
        name: 'web-tier-nsg',
        resourceGroup: 'production-rg',
        inboundRules: [
          { name: 'Allow-HTTPS', priority: 100, access: 'Allow', protocol: 'TCP', destinationPort: '443', source: 'Internet' },
          { name: 'Allow-HTTP', priority: 110, access: 'Allow', protocol: 'TCP', destinationPort: '80', source: 'Internet' },
        ],
        associatedSubnets: 2,
      },
      {
        name: 'db-tier-nsg',
        resourceGroup: 'production-rg',
        inboundRules: [
          { name: 'Allow-SQL', priority: 100, access: 'Allow', protocol: 'TCP', destinationPort: '1433', source: 'VirtualNetwork' },
        ],
        associatedSubnets: 1,
      },
    ],
    riskyRules: [
      { nsgName: 'legacy-nsg', rule: 'Allow-RDP-Any', issue: 'RDP open to any source', severity: 'high' },
    ],
    flowLogsEnabled: 15,
    flowLogsDisabled: 3,
  };

  return {
    source: 'azure-nsg',
    evidenceType: 'network_security',
    data: simulatedNSGs,
    collectedAt: new Date().toISOString(),
    status: 'success',
  };
}

async function collectPolicyComplianceEvidence(credentials: AzureCredentials): Promise<EvidenceResult> {
  console.log('Collecting Azure Policy compliance evidence');
  
  // Simulated Azure Policy compliance
  const simulatedCompliance = {
    overallCompliance: 0.87,
    totalResources: 456,
    compliantResources: 397,
    nonCompliantResources: 59,
    policyAssignments: [
      { name: 'Require encryption at rest', compliance: 0.95, scope: 'Subscription' },
      { name: 'Require HTTPS on storage', compliance: 1.0, scope: 'Subscription' },
      { name: 'Require tags on resources', compliance: 0.72, scope: 'Subscription' },
      { name: 'Allowed locations', compliance: 1.0, scope: 'Subscription' },
    ],
    initiatives: [
      { name: 'CIS Microsoft Azure Foundations', compliance: 0.82, controlsPassed: 145, controlsFailed: 32 },
      { name: 'Azure Security Benchmark', compliance: 0.89, controlsPassed: 178, controlsFailed: 22 },
    ],
  };

  return {
    source: 'azure-policy',
    evidenceType: 'policy_compliance',
    data: simulatedCompliance,
    collectedAt: new Date().toISOString(),
    status: 'success',
  };
}

async function collectSecurityCenterEvidence(credentials: AzureCredentials): Promise<EvidenceResult> {
  console.log('Collecting Azure Security Center evidence');
  
  // Simulated Security Center / Defender data
  const simulatedSecurityCenter = {
    secureScore: {
      current: 72,
      max: 100,
      percentageScore: 0.72,
    },
    recommendations: {
      total: 45,
      high: 8,
      medium: 22,
      low: 15,
      topRecommendations: [
        { title: 'Enable MFA for accounts with owner permissions', severity: 'High', status: 'Active' },
        { title: 'Enable encryption for storage accounts', severity: 'High', status: 'Active' },
        { title: 'Enable DDoS protection', severity: 'Medium', status: 'Active' },
      ],
    },
    alerts: {
      total: 12,
      high: 2,
      medium: 6,
      low: 4,
    },
    defenderCoverage: {
      servers: true,
      appService: true,
      sqlDatabases: true,
      storage: true,
      containers: false,
      keyVaults: true,
    },
  };

  return {
    source: 'azure-security-center',
    evidenceType: 'security_posture',
    data: simulatedSecurityCenter,
    collectedAt: new Date().toISOString(),
    status: 'success',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { organizationId, credentials, evidenceTypes } = await req.json();

    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    console.log(`Starting Azure evidence collection for organization: ${organizationId}`);

    const typesToCollect = evidenceTypes || ['entra-id', 'activity-logs', 'nsg', 'policy', 'security-center'];
    const results: EvidenceResult[] = [];

    // Use demo credentials if none provided
    const azureCredentials: AzureCredentials = credentials || {
      tenantId: 'demo-tenant',
      clientId: 'demo-client',
      clientSecret: 'demo-secret',
    };

    // Collect evidence in parallel
    const collectionPromises: Promise<EvidenceResult>[] = [];

    if (typesToCollect.includes('entra-id')) {
      collectionPromises.push(collectEntraIDEvidence(azureCredentials));
    }
    if (typesToCollect.includes('activity-logs')) {
      collectionPromises.push(collectActivityLogsEvidence(azureCredentials));
    }
    if (typesToCollect.includes('nsg')) {
      collectionPromises.push(collectNetworkSecurityEvidence(azureCredentials));
    }
    if (typesToCollect.includes('policy')) {
      collectionPromises.push(collectPolicyComplianceEvidence(azureCredentials));
    }
    if (typesToCollect.includes('security-center')) {
      collectionPromises.push(collectSecurityCenterEvidence(azureCredentials));
    }

    const collectedEvidence = await Promise.all(collectionPromises);
    results.push(...collectedEvidence);

    // Update evidence source timestamp
    await supabaseClient
      .from('evidence_sources')
      .update({ last_collection_at: new Date().toISOString() })
      .eq('organization_id', organizationId)
      .eq('source_type', 'azure');

    console.log(`Successfully collected ${results.length} Azure evidence items`);

    return new Response(
      JSON.stringify({
        success: true,
        organizationId,
        evidenceCount: results.length,
        evidence: results,
        collectedAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error('Error collecting Azure evidence:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
