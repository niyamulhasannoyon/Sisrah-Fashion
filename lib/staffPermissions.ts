// Role-based permission map for admin panel
// Each role lists the nav keys it is allowed to access.

export type StaffRole = 'super_admin' | 'manager' | 'support';

export const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  super_admin: [
    'dashboard',
    'analytics',
    'products',
    'orders',
    'customers',
    'reviews',
    'coupons',
    'staff',
    'settings',
  ],
  manager: [
    'dashboard',
    'products',
    'orders',
    'customers',
    'reviews',
  ],
  support: [
    'dashboard',
    'orders',
  ],
};

export const ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  support: 'Support',
};

export const ROLE_COLORS: Record<StaffRole, string> = {
  super_admin: 'bg-violet-100 text-violet-700 border-violet-200',
  manager: 'bg-blue-100 text-blue-700 border-blue-200',
  support: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

/**
 * Check if a given role has access to a nav resource key.
 */
export function hasPermission(role: StaffRole | string, resource: string): boolean {
  const permissions = ROLE_PERMISSIONS[role as StaffRole];
  if (!permissions) return false;
  return permissions.includes(resource);
}
