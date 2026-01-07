import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OktaCredentials {
  domain: string;
  apiToken: string;
}

interface EvidenceResult {
  source: string;
  evidenceType: string;
  data: Record<string, unknown>;
  collectedAt: string;
  status: 'success' | 'error';
  error?: string;
}

async function collectUserEvidence(credentials: OktaCredentials): Promise<EvidenceResult> {
  console.log('Collecting Okta user evidence');
  
  // Simulated Okta user data
  const simulatedUsers = {
    totalUsers: 245,
    activeUsers: 238,
    suspendedUsers: 5,
    deactivatedUsers: 2,
    usersByType: {
      employees: 180,
      contractors: 45,
      vendors: 15,
      serviceAccounts: 5,
    },
    recentActivity: {
      loginsLast24h: 156,
      failedLoginsLast24h: 12,
      passwordResetsLast7d: 8,
    },
  };

  return {
    source: 'okta-users',
    evidenceType: 'identity_management',
    data: simulatedUsers,
    collectedAt: new Date().toISOString(),
    status: 'success',
  };
}

async function collectMFAEvidence(credentials: OktaCredentials): Promise<EvidenceResult> {
  console.log('Collecting Okta MFA evidence');
  
  // Simulated MFA enrollment data
  const simulatedMFA = {
    totalUsers: 245,
    mfaEnrolled: 241,
    mfaCoverage: 0.984,
    factorTypes: {
      oktaVerifyPush: 180,
      oktaVerifyTotp: 45,
      sms: 12,
      email: 4,
      securityKey: 28,
      yubikey: 15,
    },
    usersWithoutMFA: [
      { id: 'user1', email: 'new.employee@company.com', status: 'STAGED', createdDaysAgo: 1 },
      { id: 'user2', email: 'contractor@external.com', status: 'ACTIVE', createdDaysAgo: 3 },
    ],
    mfaPolicies: {
      requireMFAForAll: true,
      allowRememberDevice: true,
      rememberDeviceDays: 30,
      requireMFAForAdmins: true,
    },
  };

  return {
    source: 'okta-mfa',
    evidenceType: 'authentication_security',
    data: simulatedMFA,
    collectedAt: new Date().toISOString(),
    status: 'success',
  };
}

async function collectGroupEvidence(credentials: OktaCredentials): Promise<EvidenceResult> {
  console.log('Collecting Okta group evidence');
  
  // Simulated group membership data
  const simulatedGroups = {
    totalGroups: 42,
    groups: [
      { name: 'Administrators', memberCount: 5, type: 'OKTA_GROUP' },
      { name: 'IT-Support', memberCount: 12, type: 'OKTA_GROUP' },
      { name: 'Finance', memberCount: 28, type: 'OKTA_GROUP' },
      { name: 'Engineering', memberCount: 65, type: 'OKTA_GROUP' },
      { name: 'Everyone', memberCount: 245, type: 'BUILT_IN' },
    ],
    privilegedGroups: [
      { name: 'Administrators', memberCount: 5, lastReviewDate: '2024-11-15' },
      { name: 'IT-Support', memberCount: 12, lastReviewDate: '2024-10-20' },
    ],
    groupsWithExternalUsers: 3,
  };

  return {
    source: 'okta-groups',
    evidenceType: 'access_control',
    data: simulatedGroups,
    collectedAt: new Date().toISOString(),
    status: 'success',
  };
}

async function collectApplicationEvidence(credentials: OktaCredentials): Promise<EvidenceResult> {
  console.log('Collecting Okta application evidence');
  
  // Simulated application assignments
  const simulatedApps = {
    totalApplications: 35,
    applications: [
      { name: 'Salesforce', assignedUsers: 85, ssoEnabled: true, provisioningEnabled: true },
      { name: 'Slack', assignedUsers: 240, ssoEnabled: true, provisioningEnabled: true },
      { name: 'AWS Console', assignedUsers: 25, ssoEnabled: true, provisioningEnabled: false },
      { name: 'GitHub', assignedUsers: 65, ssoEnabled: true, provisioningEnabled: true },
      { name: 'Jira', assignedUsers: 120, ssoEnabled: true, provisioningEnabled: true },
    ],
    appsWithoutSSO: 2,
    appsWithoutProvisioning: 8,
    orphanedAppAccounts: 15,
  };

  return {
    source: 'okta-applications',
    evidenceType: 'application_access',
    data: simulatedApps,
    collectedAt: new Date().toISOString(),
    status: 'success',
  };
}

async function collectAuthenticationLogs(credentials: OktaCredentials): Promise<EvidenceResult> {
  console.log('Collecting Okta authentication logs');
  
  // Simulated authentication events
  const simulatedLogs = {
    timeRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
    summary: {
      totalEvents: 1245,
      successfulLogins: 1180,
      failedLogins: 52,
      mfaChallenges: 890,
      mfaSuccesses: 875,
      suspiciousActivities: 13,
    },
    topFailureReasons: [
      { reason: 'INVALID_CREDENTIALS', count: 35 },
      { reason: 'MFA_FAILED', count: 12 },
      { reason: 'LOCKED_OUT', count: 5 },
    ],
    geographicAnomalies: [
      { userId: 'user123', homeCountry: 'US', loginCountry: 'RU', timestamp: new Date().toISOString() },
    ],
  };

  return {
    source: 'okta-auth-logs',
    evidenceType: 'authentication_monitoring',
    data: simulatedLogs,
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

    console.log(`Starting Okta evidence collection for organization: ${organizationId}`);

    const typesToCollect = evidenceTypes || ['users', 'mfa', 'groups', 'applications', 'auth-logs'];
    const results: EvidenceResult[] = [];

    // Use demo credentials if none provided
    const oktaCredentials: OktaCredentials = credentials || {
      domain: 'demo.okta.com',
      apiToken: 'demo-token',
    };

    // Collect evidence in parallel
    const collectionPromises: Promise<EvidenceResult>[] = [];

    if (typesToCollect.includes('users')) {
      collectionPromises.push(collectUserEvidence(oktaCredentials));
    }
    if (typesToCollect.includes('mfa')) {
      collectionPromises.push(collectMFAEvidence(oktaCredentials));
    }
    if (typesToCollect.includes('groups')) {
      collectionPromises.push(collectGroupEvidence(oktaCredentials));
    }
    if (typesToCollect.includes('applications')) {
      collectionPromises.push(collectApplicationEvidence(oktaCredentials));
    }
    if (typesToCollect.includes('auth-logs')) {
      collectionPromises.push(collectAuthenticationLogs(oktaCredentials));
    }

    const collectedEvidence = await Promise.all(collectionPromises);
    results.push(...collectedEvidence);

    // Update evidence source timestamp
    await supabaseClient
      .from('evidence_sources')
      .update({ last_collection_at: new Date().toISOString() })
      .eq('organization_id', organizationId)
      .eq('source_type', 'okta');

    console.log(`Successfully collected ${results.length} Okta evidence items`);

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
    console.error('Error collecting Okta evidence:', error);
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
