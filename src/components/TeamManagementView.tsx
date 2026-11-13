import React, { useState, useEffect } from 'react';
import {
  Shield,
  UserPlus,
  KeyRound,
  CheckCircle2,
  Clock,
  Edit3,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  ActivityLogEntry,
  AppUser,
  ErpRole,
  UserPermissions,
} from '../types';
import { PlatformApi } from '../services/platformApi';

interface TeamManagementViewProps {
  currentUser: AppUser;
  onUsersSynced?: (users: AppUser[]) => void;
}

const DEFAULT_ROLE_PERMS: Record<ErpRole, UserPermissions> = {
  SUPER_ADMIN: {
    manageDailyRates: true,
    manageProducts: true,
    manageWebsiteCms: true,
    manageEnquiries: true,
    manageQuotationsOrders: true,
    manageWhatsApp: true,
    viewAllWhatsAppChats: true,
    manageTeamUsers: true,
    publishPublicRates: true,
    viewReports: true,
  },
  ADMIN: {
    manageDailyRates: true,
    manageProducts: true,
    manageWebsiteCms: true,
    manageEnquiries: true,
    manageQuotationsOrders: true,
    manageWhatsApp: true,
    viewAllWhatsAppChats: true,
    manageTeamUsers: false,
    publishPublicRates: true,
    viewReports: true,
  },
  SALES: {
    manageDailyRates: false,
    manageProducts: false,
    manageWebsiteCms: false,
    manageEnquiries: true,
    manageQuotationsOrders: true,
    manageWhatsApp: true,
    viewAllWhatsAppChats: false,
    manageTeamUsers: false,
    publishPublicRates: false,
    viewReports: false,
  },
};

const PERMISSION_LABELS: Array<{ key: keyof UserPermissions; label: string }> = [
  { key: 'manageDailyRates', label: 'Daily Rate Management' },
  { key: 'publishPublicRates', label: 'Publish Live Rates' },
  { key: 'manageProducts', label: 'Products & Gauge Master' },
  { key: 'manageWebsiteCms', label: 'Edit Website CMS' },
  { key: 'manageEnquiries', label: 'Sales Enquiries & CRM' },
  { key: 'manageQuotationsOrders', label: 'Quotations & Orders' },
  { key: 'manageWhatsApp', label: 'WhatsApp System Access' },
  { key: 'viewAllWhatsAppChats', label: 'View All Team Chats' },
  { key: 'manageTeamUsers', label: 'Team & Role Management' },
  { key: 'viewReports', label: 'Reports & Analytics' },
];

export const TeamManagementView: React.FC<TeamManagementViewProps> = ({
  currentUser,
  onUsersSynced,
}) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [resetTarget, setResetTarget] = useState<AppUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const [createForm, setCreateForm] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    rbacRole: 'SALES' as ErpRole,
    permissions: { ...DEFAULT_ROLE_PERMS.SALES },
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await PlatformApi.fetchTeamUsers();
      setUsers(res.users);
      setLogs(res.activityLogs);
      onUsersSynced?.(res.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch team accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await PlatformApi.createTeamUser(createForm);
      setBanner(`Created account for ${res.user.name} (${res.user.rbacRole})`);
      setShowCreateModal(false);
      setCreateForm({
        username: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        rbacRole: 'SALES',
        permissions: { ...DEFAULT_ROLE_PERMS.SALES },
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create user');
    }
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError(null);
    try {
      await PlatformApi.updateTeamUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        status: editingUser.status,
        rbacRole: editingUser.rbacRole || 'SALES',
        permissions: editingUser.permissions,
      });
      setBanner(`Updated permissions & profile for ${editingUser.name}`);
      setEditingUser(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update user');
    }
  };

  const handleToggleActive = async (u: AppUser) => {
    try {
      const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
      await PlatformApi.updateTeamUser(u.id, { status: nextStatus });
      setBanner(`${u.name} marked ${nextStatus}`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle status');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    try {
      await PlatformApi.resetTeamUserPassword(resetTarget.id, newPasswordInput);
      setBanner(`Password reset for ${resetTarget.name}`);
      setResetTarget(null);
      setNewPasswordInput('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-800 text-[11px] font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>RBAC Security &amp; Team Access</span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 mt-1">
            Team &amp; Role Management
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Manage Super Admin, Admin, and Sales accounts, module permissions, status, password resets, and audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Create Team Account</span>
          </button>
        </div>
      </div>

      {banner && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{banner}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900">
            Active &amp; Registered Team Accounts ({users.length})
          </h2>
          <span className="text-xs text-slate-500">
            Signed in as: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.rbacRole || currentUser.role})
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading team directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Name &amp; Username</th>
                  <th className="py-3 px-4">RBAC Role</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Module Permissions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const role = u.rbacRole || 'SALES';
                  const activePermsCount = Object.values(u.permissions || {}).filter(Boolean).length;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">@{u.username || u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            role === 'SUPER_ADMIN'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : role === 'ADMIN'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        <div>{u.email}</div>
                        <div className="font-mono text-[11px]">{u.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">{activePermsCount}</span> / 10 enabled
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          disabled={u.id === currentUser.id}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer disabled:opacity-50 ${
                            u.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                        >
                          {u.status}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingUser({
                              ...u,
                              permissions: {
                                ...DEFAULT_ROLE_PERMS[role],
                                ...(u.permissions || {}),
                              },
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Permissions</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResetTarget(u);
                            setNewPasswordInput('');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Reset Pwd</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Activity Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-700" />
          <h2 className="text-sm font-extrabold text-slate-900">
            Security &amp; Operations Activity Logs
          </h2>
        </div>
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {logs.slice(0, 25).map((log) => (
            <div key={log.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-slate-900">{log.actorName}</span>{' '}
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                  {log.actorRole}
                </span>{' '}
                <span className="font-semibold text-blue-800 ml-1">{log.action}</span>
                <p className="text-slate-600 mt-0.5">{log.details}</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {new Date(log.timestamp).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Team Member */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-display text-base font-extrabold text-slate-900">
                Create ERP User Account
              </h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-slate-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={createForm.rbacRole}
                    onChange={(e) => {
                      const nextRole = e.target.value as ErpRole;
                      setCreateForm({
                        ...createForm,
                        rbacRole: nextRole,
                        permissions: { ...DEFAULT_ROLE_PERMS[nextRole] },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white outline-none"
                  >
                    <option value="SALES">SALES TEAM</option>
                    <option value="ADMIN">ADMIN</option>
                    {currentUser.rbacRole === 'SUPER_ADMIN' && (
                      <option value="SUPER_ADMIN">SUPER ADMIN</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 mb-2">Role Permissions</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {PERMISSION_LABELS.map((p) => (
                    <label key={p.key} className="inline-flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createForm.permissions[p.key]}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            permissions: { ...createForm.permissions, [p.key]: e.target.checked },
                          })
                        }
                        className="rounded border-slate-300 text-blue-700"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-red-700 text-white text-xs font-bold cursor-pointer">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Permissions */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-display text-base font-extrabold text-slate-900">
                Edit Role &amp; Permissions — {editingUser.name}
              </h3>
              <button type="button" onClick={() => setEditingUser(null)} className="p-1.5 rounded-lg hover:bg-slate-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RBAC Role</label>
                  <select
                    value={editingUser.rbacRole || 'SALES'}
                    onChange={(e) => {
                      const nextRole = e.target.value as ErpRole;
                      setEditingUser({
                        ...editingUser,
                        rbacRole: nextRole,
                        permissions: { ...DEFAULT_ROLE_PERMS[nextRole] },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="SALES">SALES</option>
                    <option value="ADMIN">ADMIN</option>
                    {currentUser.rbacRole === 'SUPER_ADMIN' && (
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs pt-2 border-t border-slate-100">
                {PERMISSION_LABELS.map((p) => (
                  <label key={p.key} className="inline-flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingUser.permissions?.[p.key])}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          permissions: {
                            ...(editingUser.permissions || DEFAULT_ROLE_PERMS.SALES),
                            [p.key]: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-slate-300 text-blue-700"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold cursor-pointer">
                  Save Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-display text-sm font-extrabold text-slate-900">
                Reset Password — {resetTarget.name}
              </h3>
              <button type="button" onClick={() => setResetTarget(null)} className="p-1 rounded-lg hover:bg-slate-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleResetPasswordSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setResetTarget(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-red-700 text-white text-xs font-bold cursor-pointer">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
