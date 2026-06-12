export type TenantGroupId =
  | "tenant-production"
  | "tenant-security"
  | "tenant-platform";

export type RoleId =
  | "cluster-admin"
  | "security-operations"
  | "developer"
  | "auditor";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  roleId: RoleId;
  groupId: TenantGroupId;
  initials: string;
  status: "active" | "inactive";
};

export type ManagedRole = {
  id: RoleId;
  name: string;
  description: string;
};

export type TenantGroup = {
  id: TenantGroupId;
  name: string;
  description: string;
};

export const TENANT_GROUPS: TenantGroup[] = [
  {
    id: "tenant-production",
    name: "Production Fleet",
    description: "Clusters and workloads for customer-facing production environments.",
  },
  {
    id: "tenant-security",
    name: "Security Operations",
    description: "SecOps analysts monitoring posture and compliance across the fleet.",
  },
  {
    id: "tenant-platform",
    name: "Platform Engineering",
    description: "Platform team managing shared infrastructure and cluster lifecycle.",
  },
];

export const MANAGED_ROLES: ManagedRole[] = [
  {
    id: "cluster-admin",
    name: "Cluster Admin",
    description: "Full administrative access to clusters, deployments, and workspace settings.",
  },
  {
    id: "security-operations",
    name: "Security Operations",
    description: "Security-focused access to governance, security, and observability add-ons.",
  },
  {
    id: "developer",
    name: "Developer",
    description: "Deploy and manage applications without cluster administration privileges.",
  },
  {
    id: "auditor",
    name: "Auditor",
    description: "Read-only access for compliance reviews and audit trails.",
  },
];

export const MANAGED_USERS: ManagedUser[] = [
  {
    id: "adi",
    name: "Adi Cluster Admin",
    email: "adi.clusteradmin@example.com",
    roleId: "cluster-admin",
    groupId: "tenant-platform",
    initials: "AC",
    status: "active",
  },
  {
    id: "sara",
    name: "Sara SecOps",
    email: "sara.secops@example.com",
    roleId: "security-operations",
    groupId: "tenant-security",
    initials: "SS",
    status: "active",
  },
  {
    id: "marcus",
    name: "Marcus Chen",
    email: "marcus.chen@example.com",
    roleId: "cluster-admin",
    groupId: "tenant-production",
    initials: "MC",
    status: "active",
  },
  {
    id: "elena",
    name: "Elena Ortiz",
    email: "elena.ortiz@example.com",
    roleId: "developer",
    groupId: "tenant-production",
    initials: "EO",
    status: "active",
  },
  {
    id: "james",
    name: "James Park",
    email: "james.park@example.com",
    roleId: "security-operations",
    groupId: "tenant-security",
    initials: "JP",
    status: "active",
  },
  {
    id: "priya",
    name: "Priya Nair",
    email: "priya.nair@example.com",
    roleId: "auditor",
    groupId: "tenant-platform",
    initials: "PN",
    status: "active",
  },
  {
    id: "taylor",
    name: "Taylor Brooks",
    email: "taylor.brooks@example.com",
    roleId: "developer",
    groupId: "tenant-platform",
    initials: "TB",
    status: "inactive",
  },
];

export function getManagedUser(userId: string): ManagedUser | undefined {
  return MANAGED_USERS.find((user) => user.id === userId);
}

export function getGroupIdForUser(userId: string): TenantGroupId | undefined {
  return getManagedUser(userId)?.groupId;
}

export function getRoleName(roleId: RoleId): string {
  return MANAGED_ROLES.find((role) => role.id === roleId)?.name ?? roleId;
}

export function getGroupName(groupId: TenantGroupId): string {
  return TENANT_GROUPS.find((group) => group.id === groupId)?.name ?? groupId;
}

export function getTenantGroup(
  groupId: string,
): TenantGroup | undefined {
  return TENANT_GROUPS.find((group) => group.id === groupId);
}

export function getUsersForGroup(groupId: TenantGroupId): ManagedUser[] {
  return MANAGED_USERS.filter((user) => user.groupId === groupId);
}
