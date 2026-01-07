/**
 * Evidence Normalization Layer
 * Transforms vendor-specific evidence data into unified schemas for compliance testing
 */

// Common normalized schemas for different evidence types
export interface NormalizedUser {
  id: string;
  email: string;
  displayName: string;
  status: 'active' | 'inactive' | 'suspended' | 'staged';
  userType: 'employee' | 'contractor' | 'vendor' | 'service_account' | 'guest';
  mfaEnabled: boolean;
  mfaMethods: string[];
  privilegedAccess: boolean;
  groups: string[];
  lastLogin: string | null;
  createdAt: string;
  source: string;
}

export interface NormalizedSecurityRule {
  id: string;
  name: string;
  direction: 'inbound' | 'outbound';
  action: 'allow' | 'deny';
  protocol: string;
  sourceAddress: string;
  destinationAddress: string;
  sourcePort: string;
  destinationPort: string;
  priority: number;
  isRisky: boolean;
  riskReason?: string;
  source: string;
}

export interface NormalizedAuditEvent {
  id: string;
  timestamp: string;
  eventType: string;
  actor: string;
  actorType: 'user' | 'service' | 'system';
  action: string;
  resource: string;
  outcome: 'success' | 'failure';
  details: Record<string, unknown>;
  source: string;
}

export interface NormalizedComplianceState {
  controlId: string;
  controlName: string;
  framework: string;
  status: 'compliant' | 'non_compliant' | 'not_applicable' | 'unknown';
  evidence: string[];
  lastAssessed: string;
  source: string;
}

export interface NormalizedEncryptionState {
  resourceId: string;
  resourceType: string;
  resourceName: string;
  encryptionEnabled: boolean;
  encryptionType: string | null;
  keyManagement: 'platform' | 'customer' | 'none';
  source: string;
}

// Normalization functions for AWS evidence
export function normalizeAWSIAMUsers(awsData: Record<string, unknown>): NormalizedUser[] {
  const mfaDevices = awsData.mfaDevices as Record<string, unknown> || {};
  const mfaCoverage = (mfaDevices.mfaCoverage as number) || 0;
  
  // In production, this would map actual user data
  // Here we create representative normalized data from aggregate stats
  return [{
    id: 'aws-iam-aggregate',
    email: 'aggregate@aws.local',
    displayName: 'AWS IAM Users (Aggregate)',
    status: 'active',
    userType: 'employee',
    mfaEnabled: mfaCoverage > 0.9,
    mfaMethods: ['virtual_mfa'],
    privilegedAccess: false,
    groups: [],
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    source: 'aws-iam',
  }];
}

export function normalizeAWSSecurityGroups(awsData: Record<string, unknown>): NormalizedSecurityRule[] {
  const groups = (awsData.groups as Array<Record<string, unknown>>) || [];
  const rules: NormalizedSecurityRule[] = [];

  groups.forEach((group, groupIndex) => {
    const inboundRules = (group.inboundRules as Array<Record<string, unknown>>) || [];
    
    inboundRules.forEach((rule, ruleIndex) => {
      const source = rule.source as string;
      const isRisky = source === '0.0.0.0/0' && 
        ([22, 3389].includes(rule.fromPort as number));

      rules.push({
        id: `aws-sg-${groupIndex}-${ruleIndex}`,
        name: `${group.groupName}-inbound-${ruleIndex}`,
        direction: 'inbound',
        action: 'allow',
        protocol: rule.protocol as string,
        sourceAddress: source,
        destinationAddress: '*',
        sourcePort: '*',
        destinationPort: `${rule.fromPort}-${rule.toPort}`,
        priority: ruleIndex,
        isRisky,
        riskReason: isRisky ? 'Sensitive port open to internet' : undefined,
        source: 'aws-security-groups',
      });
    });
  });

  return rules;
}

// Normalization functions for Okta evidence
export function normalizeOktaUsers(oktaData: Record<string, unknown>): NormalizedUser[] {
  // In production, map actual user array
  const mfaData = oktaData as Record<string, unknown>;
  const usersWithoutMFA = (mfaData.usersWithoutMFA as Array<Record<string, unknown>>) || [];

  return usersWithoutMFA.map((user, index) => ({
    id: user.id as string || `okta-user-${index}`,
    email: user.email as string,
    displayName: user.email as string,
    status: (user.status as string)?.toLowerCase() as 'active' | 'staged' || 'active',
    userType: 'employee',
    mfaEnabled: false,
    mfaMethods: [],
    privilegedAccess: false,
    groups: [],
    lastLogin: null,
    createdAt: new Date(Date.now() - (user.createdDaysAgo as number || 0) * 24 * 60 * 60 * 1000).toISOString(),
    source: 'okta-mfa',
  }));
}

export function normalizeOktaGroups(oktaData: Record<string, unknown>): { name: string; memberCount: number; isPrivileged: boolean }[] {
  const groups = (oktaData.groups as Array<Record<string, unknown>>) || [];
  const privilegedGroups = (oktaData.privilegedGroups as Array<Record<string, unknown>>) || [];
  const privilegedNames = privilegedGroups.map(g => g.name as string);

  return groups.map(group => ({
    name: group.name as string,
    memberCount: group.memberCount as number,
    isPrivileged: privilegedNames.includes(group.name as string),
  }));
}

// Normalization functions for Azure evidence
export function normalizeAzureUsers(azureData: Record<string, unknown>): NormalizedUser[] {
  const users = azureData.users as Record<string, unknown> || {};
  
  return [{
    id: 'azure-entra-aggregate',
    email: 'aggregate@azure.local',
    displayName: 'Azure Entra ID Users (Aggregate)',
    status: 'active',
    userType: 'employee',
    mfaEnabled: (users.mfaCoverage as number) > 0.9,
    mfaMethods: ['authenticator'],
    privilegedAccess: false,
    groups: [],
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    source: 'azure-entra-id',
  }];
}

export function normalizeAzureNSGRules(azureData: Record<string, unknown>): NormalizedSecurityRule[] {
  const nsgs = (azureData.networkSecurityGroups as Array<Record<string, unknown>>) || [];
  const rules: NormalizedSecurityRule[] = [];

  nsgs.forEach((nsg, nsgIndex) => {
    const inboundRules = (nsg.inboundRules as Array<Record<string, unknown>>) || [];
    
    inboundRules.forEach((rule, ruleIndex) => {
      const source = rule.source as string;
      const destPort = rule.destinationPort as string;
      const isRisky = source === 'Internet' && ['22', '3389'].includes(destPort);

      rules.push({
        id: `azure-nsg-${nsgIndex}-${ruleIndex}`,
        name: rule.name as string,
        direction: 'inbound',
        action: (rule.access as string).toLowerCase() as 'allow' | 'deny',
        protocol: rule.protocol as string,
        sourceAddress: source,
        destinationAddress: '*',
        sourcePort: '*',
        destinationPort: destPort,
        priority: rule.priority as number,
        isRisky,
        riskReason: isRisky ? 'Sensitive port open to internet' : undefined,
        source: 'azure-nsg',
      });
    });
  });

  return rules;
}

// Unified evidence aggregation
export interface AggregatedEvidence {
  users: NormalizedUser[];
  securityRules: NormalizedSecurityRule[];
  auditEvents: NormalizedAuditEvent[];
  complianceStates: NormalizedComplianceState[];
  encryptionStates: NormalizedEncryptionState[];
  collectionTimestamp: string;
  sources: string[];
}

export function aggregateEvidence(
  awsEvidence?: Record<string, unknown>[],
  oktaEvidence?: Record<string, unknown>[],
  azureEvidence?: Record<string, unknown>[]
): AggregatedEvidence {
  const aggregated: AggregatedEvidence = {
    users: [],
    securityRules: [],
    auditEvents: [],
    complianceStates: [],
    encryptionStates: [],
    collectionTimestamp: new Date().toISOString(),
    sources: [],
  };

  // Process AWS evidence
  if (awsEvidence) {
    aggregated.sources.push('aws');
    awsEvidence.forEach(evidence => {
      if (evidence.source === 'aws-iam') {
        aggregated.users.push(...normalizeAWSIAMUsers(evidence.data as Record<string, unknown>));
      }
      if (evidence.source === 'aws-security-groups') {
        aggregated.securityRules.push(...normalizeAWSSecurityGroups(evidence.data as Record<string, unknown>));
      }
    });
  }

  // Process Okta evidence
  if (oktaEvidence) {
    aggregated.sources.push('okta');
    oktaEvidence.forEach(evidence => {
      if (evidence.source === 'okta-mfa') {
        aggregated.users.push(...normalizeOktaUsers(evidence.data as Record<string, unknown>));
      }
    });
  }

  // Process Azure evidence
  if (azureEvidence) {
    aggregated.sources.push('azure');
    azureEvidence.forEach(evidence => {
      if (evidence.source === 'azure-entra-id') {
        aggregated.users.push(...normalizeAzureUsers(evidence.data as Record<string, unknown>));
      }
      if (evidence.source === 'azure-nsg') {
        aggregated.securityRules.push(...normalizeAzureNSGRules(evidence.data as Record<string, unknown>));
      }
    });
  }

  return aggregated;
}

// Control test helpers using normalized evidence
export function testMFACompliance(users: NormalizedUser[]): {
  passed: boolean;
  passRate: number;
  failingUsers: NormalizedUser[];
} {
  const privilegedUsers = users.filter(u => u.privilegedAccess || u.userType === 'employee');
  const usersWithMFA = privilegedUsers.filter(u => u.mfaEnabled);
  const failingUsers = privilegedUsers.filter(u => !u.mfaEnabled && u.status === 'active');

  return {
    passed: failingUsers.length === 0,
    passRate: privilegedUsers.length > 0 ? usersWithMFA.length / privilegedUsers.length : 1,
    failingUsers,
  };
}

export function testNetworkSecurityCompliance(rules: NormalizedSecurityRule[]): {
  passed: boolean;
  riskyRuleCount: number;
  riskyRules: NormalizedSecurityRule[];
} {
  const riskyRules = rules.filter(r => r.isRisky);

  return {
    passed: riskyRules.length === 0,
    riskyRuleCount: riskyRules.length,
    riskyRules,
  };
}
