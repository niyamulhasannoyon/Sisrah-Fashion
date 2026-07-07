import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import dbConnect from './dbConnect';
import User from '@/models/User';
import Staff from '@/models/Staff';
import { roleHasPermission } from '@/lib/staffPermissions';
import StaffActivityLog from '@/models/StaffActivityLog';

const ALLOWED_EMAILS = ['niyamulhasanbd@gmail.com', 'niyamulhasan1089@gmail.com'];

// ─── Super Admin (original owner) auth ────────────────────────────────────────

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get('loomra_token')?.value;
  if (!token) return false;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload) {
      let email = payload.email as string | undefined;

      if (!email && payload.userId) {
        await dbConnect();
        const user = await User.findById(payload.userId);
        if (user) email = user.email;
      }

      if (email && typeof email === 'string') {
        return ALLOWED_EMAILS.includes(email);
      }
    }

    return false;
  } catch {
    return false;
  }
}

// ─── Staff auth ────────────────────────────────────────────────────────────────

export interface StaffSession {
  staffId: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
}

/**
 * Returns the decoded staff session from the JWT cookie, or null if not a staff login.
 */
export async function getStaffSession(): Promise<StaffSession | null> {
  const token = (await cookies()).get('loomra_token')?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Staff tokens carry `staffId` field
    if (payload?.staffId) {
      await dbConnect();
      const staff = await Staff.findById(payload.staffId).select('-password');
      if (!staff || !staff.isActive) return null;

      return {
        staffId: String(staff._id),
        name: staff.name,
        email: staff.email,
        role: staff.role,
        permissions: (staff as any).permissions || undefined,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Returns true when the current session (admin or staff) has access to a
 * named resource key (e.g. 'orders', 'products'). Super admin bypasses checks.
 */
export async function hasAccessTo(resource: string): Promise<boolean> {
  if (await isAdmin()) return true;

  const session = await getStaffSession();
  if (!session) return false;

  // If staff member has an explicit permissions array, it overrides role
  if (session.permissions && Array.isArray(session.permissions)) {
    return session.permissions.includes(resource);
  }

  // Fallback to role-based permissions
  return roleHasPermission(session.role, resource);
}

/**
 * Returns true when the request comes from either:
 *  - the original Super Admin (allowedEmails), OR
 *  - an active staff member with the given role(s).
 * Pass no roles to allow ANY authenticated staff or admin.
 */
export async function isStaffOrAdmin(allowedRoles?: string[]): Promise<boolean> {
  if (await isAdmin()) return true;

  const session = await getStaffSession();
  if (!session) return false;

  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(session.role);
}

// ─── Activity logger ───────────────────────────────────────────────────────────

interface LogActivityOptions {
  staffId: string;
  staffName: string;
  staffRole: string;
  action: string;
  targetType: 'order' | 'product' | 'user' | 'coupon' | 'staff' | 'settings' | 'review';
  targetId?: string;
  targetLabel?: string;
  metadata?: Record<string, any>;
}

/**
 * Write a staff activity log entry. Call this inside API routes after
 * a significant write action (status change, edit, delete, create).
 * Safe to fire-and-forget — errors are swallowed to not block responses.
 */
export async function logStaffActivity(opts: LogActivityOptions): Promise<void> {
  try {
    await dbConnect();
    await StaffActivityLog.create({
      staffId: opts.staffId,
      staffName: opts.staffName,
      staffRole: opts.staffRole,
      action: opts.action,
      targetType: opts.targetType,
      targetId: opts.targetId,
      targetLabel: opts.targetLabel,
      metadata: opts.metadata,
    });
  } catch (err) {
    console.error('[StaffActivityLog] Failed to write log:', err);
  }
}
