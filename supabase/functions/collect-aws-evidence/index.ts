import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

interface EvidenceResult {
  source: string;
  evidenceType: string;
  data: Record<string, unknown>;
  collectedAt: string;
  status: 'success' | 'error';
  error?: string;
}

// Simulate AWS API calls - in production, use actual AWS SDK
async function collectCloudTrailEvidence(credentials: AWSCredentials): Promise<EvidenceResult> {
  console.log('Collecting CloudTrail evidence for region:', credentials.region);
  
  // Simulated CloudTrail events structure
  const simulatedEvents = {
    trailStatus: {
      isLogging: true,
      latestDeliveryTime: new Date().toISOString(),
      startLoggingTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    recentEvents: [
      { eventName: 'ConsoleLogin', eventTime: new Date().toISOString(), userIdentity: { type: 'IAMUser' } },
      { eventName: 'CreateUser', eventTime: new Date().toISOString(), userIdentity: { type: 'Root' } },
    ],
    multiRegionEnabled: true,
    logFileValidationEnabled: true,
  };

  return {
    source: 'aws-cloudtrail',
    evidenceType: 'audit_logging',
    data: simulatedEvents,
    collectedAt: new Date().toISOString(),
    status: 'success',
  };
}

async function collectIAMEvidence(credentials: AWSCredentials): Promise<EvidenceResult> {
  console.log('Collecting IAM evidence');
  
  // Simulated IAM configuration
  const simulatedIAM = {
    passwordPolicy: {
      minimumPasswordLength: 14,
      requireSymbols: true,
      requireNumbers: true,
      requireUppercaseCharacters: true,
      requireLowercaseCharacters: true,
      maxPasswordAge: 90,
      passwordReusePrevention: 24,
    },
    mfaDevices: {
      totalUsers: 45,
      usersWithMFA: 42,
      mfaCoverage: 0.933,
    },
    accessKeys: {
      totalKeys: 28,
      keysOlderThan90Days: 3,
      keysNeverUsed: 1,
    },
    rootAccountMFA: true,
    rootAccountAccessKeys: false,
  };

  return {
    source: 'aws-iam',
    evidenceType: 'identity_access_management',
    data: simulatedIAM,
    collectedAt: new Date().toISOString(),
    status: 'success',
  };
}

async function collectSecurityGroupEvidence(credentials: AWSCredentials): Promise<EvidenceResult> {
  console.log('Collecting Security Group evidence');
  
  // Simulated Security Group rules
  const simulatedSecurityGroups = {
    totalGroups: 15,
    groups: [
      {
        groupId: 'sg-12345abc',
        groupName: 'web-servers',
        inboundRules: [
          { protocol: 'tcp', fromPort: 443, toPort: 443, source: '0.0.0.0/0' },
          { protocol: 'tcp', fromPort: 80, toPort: 80, source: '0.0.0.0/0' },
        ],
        outboundRules: [
          { protocol: '-1', fromPort: 0, toPort: 65535, destination: '0.0.0.0/0' },
        ],
      },
      {
        groupId: 'sg-67890def',
        groupName: 'database-servers',
        inboundRules: [
          { protocol: 'tcp', fromPort: 5432, toPort: 5432, source: '10.0.0.0/8' },
        ],
        outboundRules: [],
      },
    ],
    riskyRules: [
      { groupId: 'sg-risky123', issue: 'SSH open to 0.0.0.0/0', severity: 'high' },
    ],
  };

  return {
    source: 'aws-security-groups',
    evidenceType: 'network_security',
    data: simulatedSecurityGroups,
    collectedAt: new Date().toISOString(),
    status: 'success',
  };
}

async function collectS3Evidence(credentials: AWSCredentials): Promise<EvidenceResult> {
  console.log('Collecting S3 bucket evidence');
  
  // Simulated S3 bucket configurations
  const simulatedS3 = {
    totalBuckets: 12,
    buckets: [
      {
        name: 'company-logs',
        encryption: 'AES256',
        publicAccess: false,
        versioning: true,
        logging: true,
      },
      {
        name: 'company-backups',
        encryption: 'aws:kms',
        publicAccess: false,
        versioning: true,
        logging: true,
      },
    ],
    publicBuckets: 0,
    unencryptedBuckets: 0,
    bucketsWithoutVersioning: 2,
  };

  return {
    source: 'aws-s3',
    evidenceType: 'data_protection',
    data: simulatedS3,
    collectedAt: new Date().toISOString(),
    status: 'success',
  };
}

serve(async (req) => {
  // Handle CORS preflight
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

    console.log(`Starting AWS evidence collection for organization: ${organizationId}`);
    console.log(`Evidence types requested: ${evidenceTypes?.join(', ') || 'all'}`);

    const typesToCollect = evidenceTypes || ['cloudtrail', 'iam', 'security-groups', 's3'];
    const results: EvidenceResult[] = [];

    // Use demo credentials if none provided
    const awsCredentials: AWSCredentials = credentials || {
      accessKeyId: 'demo-access-key',
      secretAccessKey: 'demo-secret-key',
      region: 'us-east-1',
    };

    // Collect evidence in parallel
    const collectionPromises: Promise<EvidenceResult>[] = [];

    if (typesToCollect.includes('cloudtrail')) {
      collectionPromises.push(collectCloudTrailEvidence(awsCredentials));
    }
    if (typesToCollect.includes('iam')) {
      collectionPromises.push(collectIAMEvidence(awsCredentials));
    }
    if (typesToCollect.includes('security-groups')) {
      collectionPromises.push(collectSecurityGroupEvidence(awsCredentials));
    }
    if (typesToCollect.includes('s3')) {
      collectionPromises.push(collectS3Evidence(awsCredentials));
    }

    const collectedEvidence = await Promise.all(collectionPromises);
    results.push(...collectedEvidence);

    // Update evidence source last collection timestamp
    await supabaseClient
      .from('evidence_sources')
      .update({ last_collection_at: new Date().toISOString() })
      .eq('organization_id', organizationId)
      .eq('source_type', 'aws');

    console.log(`Successfully collected ${results.length} evidence items`);

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
    console.error('Error collecting AWS evidence:', error);
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
