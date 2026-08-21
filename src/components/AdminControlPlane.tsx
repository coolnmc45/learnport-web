import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import type { AccountStatus, AdminUser, UserRole } from '@/types';

const roles: UserRole[] = ['learner', 'assessor', 'trainer', 'iqa', 'eqa', 'admin'];
const statuses: Array<{ value: AccountStatus; label: string }> = [
  { value: 'pending', label: 'Pending approval' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'deactivated', label: 'Deactivated' },
];
const auditActions = [
  { value: '', label: 'All actions' },
  { value: 'user.approved', label: 'Approvals' },
  { value: 'user.access_updated', label: 'Access updates' },
  { value: 'user.permission_granted', label: 'Privilege grants' },
  { value: 'user.permission_revoked', label: 'Privilege revokes' },
];

type AuditRange = 'all' | '24h' | '7d' | '30d';

function statusLabel(status: AccountStatus | undefined) {
  return statuses.find((item) => item.value === status)?.label ?? 'Pending approval';
}

export function AdminControlPlane() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [range, setRange] = useState<AuditRange>('30d');
  const [role, setRole] = useState<UserRole>('learner');
  const [status, setStatus] = useState<AccountStatus>('pending');
  const [centreId, setCentreId] = useState('');
  const [programme, setProgramme] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const usersQuery = trpc.admin.users.list.useQuery(undefined, { retry: false });
  const auditInput = useMemo(() => {
    const durations: Record<AuditRange, number | undefined> = { all: undefined, '24h': 86_400_000, '7d': 604_800_000, '30d': 2_592_000_000 };
    const duration = durations[range];
    return {
      search: search.trim() || undefined,
      action: action || undefined,
      from: duration === undefined ? undefined : new Date(Date.now() - duration),
      limit: 200,
    };
  }, [action, range, search]);
  const auditQuery = trpc.admin.audit.useQuery(auditInput, { retry: false });
  const users = (usersQuery.data ?? []) as AdminUser[];
  const selectedUser = users.find((user) => user.id === selectedId) ?? users[0];

  useEffect(() => {
    if (!selectedUser) return;
    setSelectedId(selectedUser.id);
    setRole(selectedUser.role);
    setStatus(selectedUser.accountStatus ?? 'pending');
    setCentreId(selectedUser.centreId === undefined ? '' : String(selectedUser.centreId));
    setProgramme(selectedUser.programme ?? '');
  }, [selectedUser?.id]);

  const refresh = async () => {
    await Promise.all([usersQuery.refetch(), auditQuery.refetch()]);
  };
  const updateMutation = trpc.admin.users.update.useMutation({
    onSuccess: async () => { setNotice('Access changes saved and recorded.'); await refresh(); },
    onError: (error: Error) => setNotice(error.message),
  });
  const approveMutation = trpc.admin.users.approve.useMutation({
    onSuccess: async () => { setNotice('User approved. Access is now active.'); await refresh(); },
    onError: (error: Error) => setNotice(error.message),
  });

  const saveAccess = () => {
    if (!selectedUser) return;
    const parsedCentre = centreId.trim() ? Number(centreId) : null;
    if (parsedCentre !== null && (!Number.isInteger(parsedCentre) || parsedCentre <= 0)) {
      setNotice('Centre ID must be a positive number or blank.');
      return;
    }
    updateMutation.mutate({ userId: selectedUser.id, role, accountStatus: status, centreId: parsedCentre, programme: programme.trim() || null });
  };

  return <div className="admin-control-plane">
    <div className="page-heading"><div><div className="eyebrow">Administrator workspace</div><h2>Access control</h2><p>Approve identities, assign operational access, and review every change in one place.</p></div><button className="button-secondary" onClick={() => void refresh()}><RefreshCw size={16} /> Refresh data</button></div>
    {notice && <div className="notice" role="status" style={{ marginBottom: 18 }}>{notice}</div>}
    {usersQuery.error && <div className="notice warning-notice" style={{ marginBottom: 18 }}>The administrator API could not load this directory. Confirm that your account is an active administrator and retry.</div>}
    <div className="admin-workspace-grid">
      <section className="surface-card admin-directory-card"><div className="card-header"><div><h3>User directory</h3><p>{users.length} synchronised identities</p></div><ShieldCheck size={18} color="#0e7c86" /></div><div className="list-stack">{users.map((user) => <button type="button" className={`admin-user-row ${selectedUser?.id === user.id ? 'admin-user-row-active' : ''}`} key={user.id} onClick={() => setSelectedId(user.id)}><span className="profile-avatar">{(user.name ?? 'U').slice(0, 1).toUpperCase()}</span><span className="admin-user-copy"><strong>{user.name ?? 'Unnamed user'}</strong><small>{user.email ?? user.openId ?? 'No email provided'}</small></span><span className={`status-badge ${user.accountStatus === 'active' ? 'status-success' : user.accountStatus === 'pending' ? 'status-warning' : 'status-danger'}`}>{statusLabel(user.accountStatus)}</span></button>)}{!usersQuery.isLoading && users.length === 0 && <div className="empty-state compact"><div><strong>No users found</strong><p>New OAuth identities will appear here after they sign in.</p></div></div>}</div></section>
      <section className="surface-card"><div className="card-header"><div><h3>User access</h3><p>Role and scope changes take effect on the next authenticated request.</p></div></div>{selectedUser ? <><div className="admin-selected-user"><strong>{selectedUser.name ?? 'Unnamed user'}</strong><span>{selectedUser.email ?? selectedUser.openId}</span></div>{(selectedUser.accountStatus === 'pending' || selectedUser.accountStatus === 'suspended') && <button className="button-primary admin-approve-button" disabled={approveMutation.isPending} onClick={() => approveMutation.mutate({ userId: selectedUser.id })}><CheckCircle2 size={16} /> {approveMutation.isPending ? 'Approving…' : 'Approve user'}</button>}<label className="field-label" htmlFor="admin-role">Role</label><select id="admin-role" className="field-control" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>{roles.map((item) => <option value={item} key={item}>{item.toUpperCase()}</option>)}</select><label className="field-label" htmlFor="admin-status">Account status</label><select id="admin-status" className="field-control" value={status} onChange={(event) => setStatus(event.target.value as AccountStatus)}>{statuses.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select><div className="field-grid"><div><label className="field-label" htmlFor="admin-centre">Centre ID</label><input id="admin-centre" className="field-control" value={centreId} onChange={(event) => setCentreId(event.target.value)} inputMode="numeric" /></div><div><label className="field-label" htmlFor="admin-programme">Programme</label><input id="admin-programme" className="field-control" value={programme} onChange={(event) => setProgramme(event.target.value)} /></div></div><button className="button-primary" onClick={saveAccess} disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Saving…' : 'Save access changes'}</button></> : <div className="empty-state compact"><div><strong>Select a user</strong><p>Choose an identity from the directory to manage access.</p></div></div>}</section>
    </div>
    <section className="surface-card audit-workspace-card"><div className="card-header"><div><h3>Access audit log</h3><p>Search by action, actor ID, or target ID. Filters run against persisted audit records.</p></div><Search size={18} color="#0e7c86" /></div><div className="audit-filter-row"><label className="sr-only" htmlFor="audit-search">Search audit log</label><input id="audit-search" className="field-control" placeholder="Search action or user ID" value={search} onChange={(event) => setSearch(event.target.value)} /><select className="field-control" aria-label="Filter audit action" value={action} onChange={(event) => setAction(event.target.value)}>{auditActions.map((item) => <option value={item.value} key={item.label}>{item.label}</option>)}</select><select className="field-control" aria-label="Filter audit date range" value={range} onChange={(event) => setRange(event.target.value as AuditRange)}><option value="all">All time</option><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></select></div>{auditQuery.error && <div className="notice warning-notice">Audit records are unavailable. Retry when the service is reachable.</div>}<div className="audit-log-list">{(auditQuery.data ?? []).map((log: any) => <div className="audit-log-row" key={log.id}><div><strong>{log.action}</strong><small>Actor {log.actorId} · Target {log.targetUserId ?? '—'}</small></div><time dateTime={String(log.createdAt)}>{new Date(log.createdAt).toLocaleString()}</time></div>)}{!auditQuery.isLoading && (auditQuery.data ?? []).length === 0 && <div className="empty-state compact"><div><strong>No matching audit events</strong><p>Try a wider date range or a different search term.</p></div></div>}</div></section>
  </div>;
}
