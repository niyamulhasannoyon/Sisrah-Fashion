'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  UserCog, Plus, Trash2, Loader2, Shield, X, Eye, EyeOff,
  CheckCircle2, XCircle, Clock, Activity, ChevronDown, RefreshCw,
  UserCheck, UserX, KeyRound, Filter,
} from 'lucide-react';
import { ALL_RESOURCES } from '@/lib/staffPermissions';

// ─── Types ─────────────────────────────────────────────────────────────────────

type StaffRole = 'super_admin' | 'manager' | 'support';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  permissions?: string[];
  role: StaffRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  createdBy: string;
}

interface ActivityLog {
  _id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetLabel?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const ROLE_META: Record<StaffRole, { label: string; badge: string; desc: string }> = {
  super_admin: {
    label: 'Super Admin',
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
    desc: 'Full access — all modules including Staff & Settings',
  },
  manager: {
    label: 'Manager',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    desc: 'Products, Orders, Customers, Reviews — no Settings or Coupons',
  },
  support: {
    label: 'Support',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    desc: 'Orders view & status update only — read-only elsewhere',
  },
};

const TARGET_TYPE_COLORS: Record<string, string> = {
  order:    'bg-blue-50   text-blue-600   border-blue-100',
  product:  'bg-amber-50  text-amber-600  border-amber-100',
  user:     'bg-purple-50 text-purple-600 border-purple-100',
  coupon:   'bg-rose-50   text-rose-600   border-rose-100',
  staff:    'bg-slate-50  text-slate-600  border-slate-200',
  settings: 'bg-gray-50   text-gray-600   border-gray-200',
  review:   'bg-teal-50   text-teal-600   border-teal-100',
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: StaffRole }) {
  const m = ROLE_META[role];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${m.badge}`}>
      <Shield size={9} />
      {m.label}
    </span>
  );
}

function TimeAgo({ iso }: { iso?: string }) {
  if (!iso) return <span className="text-slate-400 text-xs italic">Never</span>;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  let label = mins < 1 ? 'Just now' : mins < 60 ? `${mins}m ago` : hrs < 24 ? `${hrs}h ago` : `${days}d ago`;
  return <span className="text-xs text-slate-500">{label}</span>;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function StaffManagementPage() {
  const [activeTab, setActiveTab] = useState<'team' | 'activity'>('team');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingLogs, setLoadingLogs]   = useState(false);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [logFilter, setLogFilter]       = useState<string>('');

  // Add-staff form state
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'support' as StaffRole, permissions: [] as string[] });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [formError, setFormError]       = useState('');

  // In-line role edit
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [savingRole, setSavingRole]       = useState(false);

  // Password reset modal
  const [resetModal, setResetModal]   = useState<{ staffId: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [savingPwd, setSavingPwd]     = useState(false);

  // Delete confirm
  const [deleteModal, setDeleteModal] = useState<StaffMember | null>(null);
  const [deleting, setDeleting]       = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────────

  const fetchStaff = useCallback(async () => {
    setLoadingStaff(true);
    try {
      const res = await fetch('/api/admin/staff');
      const data = await res.json();
      if (data.success) setStaff(data.staff);
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  const fetchLogs = useCallback(async (targetType = '') => {
    setLoadingLogs(true);
    try {
      const url = targetType
        ? `/api/admin/staff/activity?targetType=${targetType}&limit=150`
        : `/api/admin/staff/activity?limit=150`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setLogs(data.logs);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  useEffect(() => {
    if (activeTab === 'activity') fetchLogs(logFilter);
  }, [activeTab, logFilter, fetchLogs]);

  // ── Add staff ─────────────────────────────────────────────────────────────────

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.email || !form.password) {
      setFormError('All fields are required.'); return;
    }
    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters.'); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setFormError(data.error || 'Failed to create staff.'); return; }
      setStaff(prev => [data.staff, ...prev]);
      setDrawerOpen(false);
      setForm({ name: '', email: '', password: '', role: 'support', permissions: [] });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Role update ───────────────────────────────────────────────────────────────

  const handleRoleUpdate = async (staffId: string, newRole: StaffRole) => {
    setSavingRole(true);
    try {
      const res = await fetch(`/api/admin/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setStaff(prev => prev.map(s => s._id === staffId ? { ...s, role: newRole } : s));
      }
    } finally {
      setSavingRole(false);
      setEditingRoleId(null);
    }
  };

  // ── Toggle active ─────────────────────────────────────────────────────────────

  const handleToggleActive = async (staffId: string, current: boolean) => {
    const res = await fetch(`/api/admin/staff/${staffId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    });
    const data = await res.json();
    if (data.success) {
      setStaff(prev => prev.map(s => s._id === staffId ? { ...s, isActive: !current } : s));
    }
  };

  // ── Password reset ────────────────────────────────────────────────────────────

  const handlePasswordReset = async () => {
    if (!resetModal || !newPassword || newPassword.length < 6) return;
    setSavingPwd(true);
    try {
      const res = await fetch(`/api/admin/staff/${resetModal.staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (data.success) { setResetModal(null); setNewPassword(''); }
    } finally {
      setSavingPwd(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/staff/${deleteModal._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStaff(prev => prev.filter(s => s._id !== deleteModal._id));
        setDeleteModal(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-20">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCog size={24} className="text-[#A31F24]" />
            Staff Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Add team members, assign roles, and monitor activity.</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-[#A31F24] active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={18} />
          Add Staff
        </button>
      </div>

      {/* Role Legend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(ROLE_META) as StaffRole[]).map((role) => {
          const m = ROLE_META[role];
          const count = staff.filter(s => s.role === role).length;
          return (
            <div key={role} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-start gap-4">
              <div className={`p-2.5 rounded-lg border ${m.badge}`}>
                <Shield size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-800">{m.label}</p>
                  <span className="text-xs font-black text-slate-400">{count} member{count !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab switcher */}
      <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 w-fit">
        {(['team', 'activity'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg transition-all ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900 active:text-slate-700'
            }`}
          >
            {tab === 'team' ? '👥 Team' : '📋 Activity Log'}
          </button>
        ))}
      </div>

      {/* ── Team Tab ─────────────────────────────────────────────────────────── */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loadingStaff ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#A31F24]" size={32} />
              <p className="text-sm text-slate-500">Loading team...</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="py-20 text-center">
              <UserCog size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No staff members yet.</p>
              <p className="text-sm text-slate-400 mt-1">Click "Add Staff" to invite your first team member.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-200">
                    <th className="p-4 font-bold">Member</th>
                    <th className="p-4 font-bold">Role</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Last Login</th>
                    <th className="p-4 font-bold">Added</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.map((member) => (
                    <tr key={member._id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Avatar + Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border ${
                            member.isActive
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : 'bg-slate-50 text-slate-400 border-slate-100'
                          }`}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${member.isActive ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                              {member.name}
                            </p>
                            <p className="text-xs text-slate-400">{member.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role — inline editable */}
                      <td className="p-4">
                        {editingRoleId === member._id ? (
                          <div className="flex items-center gap-2">
                            <select
                              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#A31F24]/30"
                              defaultValue={member.role}
                              onChange={(e) => handleRoleUpdate(member._id, e.target.value as StaffRole)}
                              disabled={savingRole}
                            >
                              {(Object.keys(ROLE_META) as StaffRole[]).map((r) => (
                                <option key={r} value={r}>{ROLE_META[r].label}</option>
                              ))}
                            </select>
                            {savingRole && <Loader2 size={14} className="animate-spin text-slate-400" />}
                            <button onClick={() => setEditingRoleId(null)} className="text-slate-400 hover:text-slate-600 active:text-slate-800">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingRoleId(member._id)}
                            className="flex items-center gap-1 group/role"
                            title="Click to change role"
                          >
                            <RoleBadge role={member.role} />
                            <ChevronDown size={12} className="text-slate-300 group-hover/role:text-slate-500 transition-colors" />
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {member.isActive ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 size={14} /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-rose-500 text-xs font-bold">
                            <XCircle size={14} /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock size={13} />
                          <TimeAgo iso={member.lastLogin} />
                        </div>
                      </td>

                      {/* Added */}
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Toggle active */}
                          <button
                            onClick={() => handleToggleActive(member._id, member.isActive)}
                            title={member.isActive ? 'Deactivate' : 'Activate'}
                            className={`p-2 rounded-lg transition-colors ${
                              member.isActive
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {member.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>

                          {/* Reset password */}
                          <button
                            onClick={() => { setResetModal({ staffId: member._id, name: member.name }); setNewPassword(''); }}
                            title="Reset Password"
                            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors"
                          >
                            <KeyRound size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteModal(member)}
                            title="Delete Staff"
                            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Activity Log Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-slate-400" />
              <p className="text-sm font-bold text-slate-700">Staff Activity Log</p>
              <span className="text-xs text-slate-400 font-medium">({logs.length} entries)</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Filter by type */}
              <div className="relative">
                <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#A31F24]/20"
                >
                  <option value="">All Types</option>
                  <option value="order">Orders</option>
                  <option value="product">Products</option>
                  <option value="user">Customers</option>
                  <option value="coupon">Coupons</option>
                  <option value="staff">Staff</option>
                  <option value="settings">Settings</option>
                  <option value="review">Reviews</option>
                </select>
              </div>
              <button
                onClick={() => fetchLogs(logFilter)}
                disabled={loadingLogs}
                className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors"
              >
                <RefreshCw size={14} className={loadingLogs ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {loadingLogs ? (
            <div className="py-16 flex items-center justify-center gap-3">
              <Loader2 size={24} className="animate-spin text-[#A31F24]" />
              <p className="text-sm text-slate-500">Loading activity...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center">
              <Activity size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No activity recorded yet.</p>
              <p className="text-xs text-slate-300 mt-1">Staff actions will appear here automatically.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {logs.map((log) => (
                <div key={log._id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      {/* Staff avatar */}
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 mt-0.5">
                        {log.staffName.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-800">{log.staffName}</span>
                          <RoleBadge role={log.staffRole as StaffRole} />
                        </div>
                        <p className="text-sm text-slate-600">{log.action}</p>
                        {log.targetLabel && (
                          <p className="text-xs text-slate-400">
                            Target: <span className="font-medium text-slate-600">{log.targetLabel}</span>
                          </p>
                        )}
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(log.metadata).map(([k, v]) => (
                              <span key={k} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pl-11 sm:pl-0">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${TARGET_TYPE_COLORS[log.targetType] || 'bg-slate-50 text-slate-500'}`}>
                        {log.targetType}
                      </span>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('en-US', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Add Staff Drawer ──────────────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add Staff Member</h2>
                <p className="text-xs text-slate-500 mt-0.5">Create a new admin panel account</p>
              </div>
              <button
                onClick={() => { setDrawerOpen(false); setFormError(''); }}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddStaff} className="flex-1 overflow-y-auto p-6 space-y-5">

              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                  <XCircle size={16} />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahim Uddin"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A31F24]/20 focus:border-[#A31F24]/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="staff@example.com"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A31F24]/20 focus:border-[#A31F24]/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-11 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A31F24]/20 focus:border-[#A31F24]/50 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 active:text-slate-800"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Role</label>
                <div className="space-y-2">
                  {(Object.keys(ROLE_META) as StaffRole[]).map((role) => {
                    const m = ROLE_META[role];
                    const isSelected = form.role === role;
                    return (
                      <label
                        key={role}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#A31F24] bg-rose-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={isSelected}
                          onChange={() => setForm(f => ({ ...f, role }))}
                          className="mt-0.5 accent-[#A31F24]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">{m.label}</span>
                            <RoleBadge role={role} />
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Explicit Permissions (optional)</label>
                <p className="text-xs text-slate-400 mb-2">Leave empty to use role defaults. Select specific pages to grant only those accesses.</p>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-100 rounded-lg">
                  {ALL_RESOURCES.map((r) => (
                    <label key={r} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(r)}
                        onChange={(e) => {
                          if (e.target.checked) setForm(f => ({ ...f, permissions: [...f.permissions, r] }));
                          else setForm(f => ({ ...f, permissions: f.permissions.filter(p => p !== r) }));
                        }}
                        className="accent-[#A31F24]"
                      />
                      <span className="capitalize">{r.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={() => { setDrawerOpen(false); setFormError(''); }}
                className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                disabled={submitting}
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-[#1A1A1A] rounded-lg hover:bg-[#A31F24] active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {submitting ? 'Adding...' : 'Add Staff Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Password Reset Modal ──────────────────────────────────────────────── */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <KeyRound size={18} className="text-blue-500" />
                Reset Password
              </h3>
              <button onClick={() => setResetModal(null)} className="text-slate-400 hover:text-slate-600 active:text-slate-800">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-500">
                Set a new password for <span className="font-bold text-slate-700">{resetModal.name}</span>.
              </p>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password (min. 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button
                onClick={() => setResetModal(null)}
                className="flex-1 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordReset}
                disabled={savingPwd || newPassword.length < 6}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.97] rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingPwd ? <Loader2 size={14} className="animate-spin" /> : null}
                {savingPwd ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────────────────── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-red-600">
                <Trash2 size={18} />
                Delete Staff Member
              </h3>
              <button onClick={() => setDeleteModal(null)} className="text-slate-400 hover:text-slate-600 active:text-slate-800">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold text-slate-800">{deleteModal.name}</span>?
                Their activity logs will also be removed.
              </p>
              <p className="text-xs text-slate-400 mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.97] rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
