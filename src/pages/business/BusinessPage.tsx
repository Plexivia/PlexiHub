import React, { useState, useEffect } from 'react';
import { useTenantStore } from '../../stores/tenantStore';
import { useAuthStore } from '../../stores/authStore';
import { useRole } from '../../hooks/useRole';
import { businessService } from '../../services/business.service';
import { BusinessProfile, SecuritySettings, User, AuditLogEntry, TenantConfig } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar } from '../../components/ui/avatar';
import { LoadingState } from '../../components/ui/states';
import { Dialog, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '../../components/ui/dialog';
import { formatDate, formatDateTime, formatRelativeTime } from '../../lib/utils';
import {
  Briefcase,
  Shield,
  Users,
  Palette,
  FileText,
  Save,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  Edit2,
  Key,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export function BusinessPage() {
  const { tenant, updateTenant } = useTenantStore();
  const currentUser = useAuthStore((s) => s.user);
  const { isAdmin, can } = useRole();

  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [security, setSecurity] = useState<SecuritySettings | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Invite member dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Owner' | 'Admin' | 'Manager'>('Manager');
  const [inviteDept, setInviteDept] = useState('Operations');

  // Branding state
  const [brandName, setBrandName] = useState(tenant.name);
  const [brandDomain, setBrandDomain] = useState(tenant.domain);
  const [primaryColor, setPrimaryColor] = useState(tenant.primaryColor || '#0284c7');
  const [secondaryColor, setSecondaryColor] = useState(tenant.secondaryColor || '#0f172a');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [p, s, m, a] = await Promise.all([
        businessService.getProfile(),
        businessService.getSecuritySettings(),
        businessService.getMembers(),
        businessService.getAuditLogs(30),
      ]);
      setProfile(p);
      setSecurity(s);
      setMembers(m);
      setAuditLogs(a);
      setLoading(false);
    }
    load();
  }, []);

  const triggerSaveNotification = (msg: string) => {
    setSavedSuccess(msg);
    setTimeout(() => setSavedSuccess(null), 3500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const updated = await businessService.updateProfile(profile);
    setProfile(updated);
    triggerSaveNotification('Organization profile updated successfully');
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await businessService.updateBranding({
      name: brandName,
      domain: brandDomain,
      primaryColor,
      secondaryColor,
    });
    updateTenant({
      name: brandName,
      domain: brandDomain,
      primaryColor,
      secondaryColor,
    });
    triggerSaveNotification('White-label branding updated dynamically');
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!security) return;
    const updated = await businessService.updateSecuritySettings(security);
    setSecurity(updated);
    triggerSaveNotification('Security and access policies updated');
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newMember = await businessService.inviteMember({
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      department: inviteDept,
    });

    setMembers((prev) => [...prev, newMember]);
    setInviteName('');
    setInviteEmail('');
    setInviteOpen(false);
    triggerSaveNotification(`Invitation sent to ${newMember.email}`);
  };

  const handleRemoveMember = async (id: string) => {
    if (id === currentUser?.id) {
      alert('You cannot deactivate your own administrative account.');
      return;
    }
    if (confirm('Are you sure you want to deactivate this team member?')) {
      await businessService.removeMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      triggerSaveNotification('Team member access revoked');
    }
  };

  if (loading || !profile || !security) {
    return <LoadingState message="Loading business configuration..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            My Business & Operations Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            White-label identity, corporate security settings, and team access permissions.
          </p>
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
            <Lock className="h-3.5 w-3.5" />
            <span>Read-Only Mode: Admin role required to modify settings</span>
          </div>
        )}
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 animate-in fade-in-0">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{savedSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full max-w-3xl h-9 p-1 bg-gray-100 border border-gray-200 rounded">
          <TabsTrigger value="profile" className="gap-1.5 text-xs rounded">
            <Briefcase className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-1.5 text-xs rounded">
            <Palette className="h-3.5 w-3.5" /> White-Label
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs rounded">
            <Shield className="h-3.5 w-3.5" /> Security
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs rounded">
            <Users className="h-3.5 w-3.5" /> Team ({members.length})
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 text-xs rounded">
            <FileText className="h-3.5 w-3.5" /> Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Organization Profile */}
        <TabsContent value="profile" className="mt-4">
          <form onSubmit={handleSaveProfile}>
            <Card className="rounded-lg border border-gray-200 bg-white shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-gray-900">Company & Organization Details</CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Primary corporate profile and operational contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1.5">
                      Organization Name
                    </label>
                    <Input
                      disabled={!isAdmin}
                      value={profile.companyName}
                      onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                      className="text-xs bg-white border-gray-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1.5">
                      Primary Operations Domain
                    </label>
                    <Input
                      disabled={!isAdmin}
                      value={profile.primaryDomain}
                      onChange={(e) => setProfile({ ...profile, primaryDomain: e.target.value })}
                      className="text-xs font-mono bg-white border-gray-200 rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1.5">
                      Support Escalation Email
                    </label>
                    <Input
                      disabled={!isAdmin}
                      value={profile.supportEmail}
                      onChange={(e) => setProfile({ ...profile, supportEmail: e.target.value })}
                      className="text-xs bg-white border-gray-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1.5">
                      Operations Timezone
                    </label>
                    <Select
                      disabled={!isAdmin}
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      className="text-xs bg-white border-gray-200 rounded"
                    >
                      <option value="America/New_York">America/New_York (EST / EDT)</option>
                      <option value="America/Chicago">America/Chicago (CST / CDT)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST / PDT)</option>
                      <option value="Europe/London">Europe/London (GMT / BST)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
              {isAdmin && (
                <CardFooter className="border-t border-gray-100 bg-gray-50/50 p-4">
                  <Button type="submit" size="sm" className="gap-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="h-3.5 w-3.5" /> Save Profile
                  </Button>
                </CardFooter>
              )}
            </Card>
          </form>
        </TabsContent>

        {/* Tab 2: White-Label Branding */}
        <TabsContent value="branding" className="mt-4">
          <form onSubmit={handleSaveBranding}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">White-Label Customization</CardTitle>
                <CardDescription className="text-xs">
                  Customize colors, brand name, and portal domain with instantaneous live reflection.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Portal Display Name
                    </label>
                    <Input
                      disabled={!isAdmin}
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Portal Domain
                    </label>
                    <Input
                      disabled={!isAdmin}
                      value={brandDomain}
                      onChange={(e) => setBrandDomain(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Primary Brand Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        disabled={!isAdmin}
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-9 w-12 rounded cursor-pointer border border-slate-200 p-0.5"
                      />
                      <Input
                        disabled={!isAdmin}
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="text-xs font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Secondary Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        disabled={!isAdmin}
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="h-9 w-12 rounded cursor-pointer border border-slate-200 p-0.5"
                      />
                      <Input
                        disabled={!isAdmin}
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="text-xs font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Live UI Preview
                  </span>
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {brandName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{brandName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{brandDomain}</p>
                    </div>
                    <button
                      type="button"
                      className="ml-auto px-2.5 py-1 rounded text-white text-[11px] font-semibold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Accent Button
                    </button>
                  </div>
                </div>
              </CardContent>
              {isAdmin && (
                <CardFooter className="border-t border-slate-100 bg-slate-50/50 p-4">
                  <Button type="submit" size="sm" className="gap-1.5">
                    <Save className="h-3.5 w-3.5" /> Apply Branding Changes
                  </Button>
                </CardFooter>
              )}
            </Card>
          </form>
        </TabsContent>

        {/* Tab 3: Security & Access */}
        <TabsContent value="security" className="mt-4">
          <form onSubmit={handleSaveSecurity}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Authentication & Security Policies</CardTitle>
                <CardDescription className="text-xs">
                  Configure corporate multi-factor authentication, session limits, and SAML Single Sign-On.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                    <div>
                      <p className="font-bold text-slate-900">Enforce Two-Factor Authentication (2FA)</p>
                      <p className="text-slate-500 text-[11px]">Require all personnel to pass TOTP challenge on login</p>
                    </div>
                    <input
                      type="checkbox"
                      disabled={!isAdmin}
                      checked={security.twoFactorEnforced}
                      onChange={(e) => setSecurity({ ...security, twoFactorEnforced: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                    <div>
                      <p className="font-bold text-slate-900">Enterprise SSO / SAML 2.0</p>
                      <p className="text-slate-500 text-[11px]">Federate identity with Okta, Azure AD, or Google Workspace</p>
                    </div>
                    <Badge variant={security.ssoEnabled ? 'success' : 'secondary'} className="text-[10px]">
                      {security.ssoEnabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Session Inactivity Timeout
                    </label>
                    <Select
                      disabled={!isAdmin}
                      value={security.sessionTimeoutMinutes}
                      onChange={(e) => setSecurity({ ...security, sessionTimeoutMinutes: Number(e.target.value) })}
                      className="text-xs"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={240}>4 hours</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Password Rotation Interval
                    </label>
                    <Select
                      disabled={!isAdmin}
                      value={security.passwordExpirationDays}
                      onChange={(e) => setSecurity({ ...security, passwordExpirationDays: Number(e.target.value) })}
                      className="text-xs"
                    >
                      <option value={30}>Every 30 days</option>
                      <option value={60}>Every 60 days</option>
                      <option value={90}>Every 90 days</option>
                      <option value={180}>Every 180 days</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
              {isAdmin && (
                <CardFooter className="border-t border-slate-100 bg-slate-50/50 p-4">
                  <Button type="submit" size="sm" className="gap-1.5">
                    <Save className="h-3.5 w-3.5" /> Save Security Policies
                  </Button>
                </CardFooter>
              )}
            </Card>
          </form>
        </TabsContent>

        {/* Tab 4: Team Members & Roles */}
        <TabsContent value="team" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold">Team Members & Access Roles</CardTitle>
                <CardDescription className="text-xs">
                  Manage user roles (Owner, Admin, Manager) and platform access.
                </CardDescription>
              </div>
              {isAdmin && (
                <Button size="xs" onClick={() => setInviteOpen(true)} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Invite Member
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4">User</th>
                      <th className="py-2.5 px-4">Department</th>
                      <th className="py-2.5 px-4">Role</th>
                      <th className="py-2.5 px-4">2FA Status</th>
                      <th className="py-2.5 px-4">Last Active</th>
                      {isAdmin && <th className="py-2.5 px-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar src={m.avatarUrl} name={m.name} size="xs" />
                            <div>
                              <p className="font-bold text-slate-900">{m.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{m.department || 'Operations'}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              m.role === 'Owner'
                                ? 'warning'
                                : m.role === 'Admin'
                                ? 'destructive'
                                : 'info'
                            }
                            className="text-[10px]"
                          >
                            {m.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" /> Enforced
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-400">
                          {m.lastLoginAt ? formatRelativeTime(m.lastLoginAt) : 'Recent'}
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4 text-right">
                            {m.id !== currentUser?.id && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(m.id)}
                                className="p-1 rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                title="Revoke access"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Audit Log */}
        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Operations & Security Audit Log</CardTitle>
              <CardDescription className="text-xs">
                Tamper-evident record of administrative events, deployments, role modifications, and status transitions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-4">Actor</th>
                      <th className="py-2.5 px-4">Event Type</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-4 text-[11px] text-slate-500 font-mono whitespace-nowrap">
                          {formatDateTime(log.timestamp)}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{log.user.name}</td>
                        <td className="py-2.5 px-4">
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{log.details}</td>
                        <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400">{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Member Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogClose onClose={() => setInviteOpen(false)} />
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInviteMember} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <Input
              required
              placeholder="e.g. Jordan Miller"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <Input
              type="email"
              required
              placeholder="e.g. jordan.miller@apexops.io"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role</label>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="text-xs"
              >
                <option value="Owner">Owner (Full Business Authority & White-Label)</option>
                <option value="Admin">Admin (Operations & Team Access Management)</option>
                <option value="Manager">Manager (Store Operations, Issues & Support)</option>
              </Select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <Input
                value={inviteDept}
                onChange={(e) => setInviteDept(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
