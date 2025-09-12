export type Role = 'admin' | 'provider' | 'auditor' | 'patient' | 'system';

type Permission = `${string}:${'READ'|'WRITE'|'READ_WRITE'}` | '*:*';

const rolePermissions: Record<Role, Permission[]> = {
  admin: ['FINTECH:READ_WRITE', 'COMPLIANCE_API:READ_WRITE', 'COMPLIANCE_STATUS:READ'],
  provider: ['FINTECH:READ_WRITE', 'COMPLIANCE_STATUS:READ'],
  auditor: ['COMPLIANCE_STATUS:READ', 'COMPLIANCE_API:READ_WRITE'],
  patient: [],
  system: ['*:*'],
};

export function hasAccess(role: Role, resource: string, action: 'READ'|'WRITE'|'READ_WRITE') {
  const req: Permission = `${resource}:${action}` as Permission;
  const perms = rolePermissions[role] || [];
  if (perms.includes('*:*' as Permission)) return true;
  if (perms.includes(req)) return true;
  if (action === 'READ_WRITE') {
    return perms.includes(`${resource}:READ` as Permission) && perms.includes(`${resource}:WRITE` as Permission);
  }
  return false;
}
