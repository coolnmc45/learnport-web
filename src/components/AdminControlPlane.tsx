import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw, Search, ShieldCheck, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import type { AccountStatus, AdminUser, UserRole } from '@/types';
import { sortRows, toggleSort, type SortDirection } from '@/lib/table-utils';
import { DEMO_AUDIT_LOGS, DEMO_USERS } from '@/lib/demo-data';

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
type UserSortKey = 'name' | 'role' | 'status' | 'lastSignedIn';

function statusLabel(status: AccountStatus | undefined) {
  return statuses.find((item) => item.value === status)?.label ?? 'Pending approval';
}

function statusTone(status: AccountStatus | undefined) {
  return status === 'active' ? 'status-success' : status === 'pending' ? 'status-warning' : 'status-danger';
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return <ArrowUpDown size={13} aria-hidden="true" />;
  return direction === 'asc' ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />;
}

export function AdminControlPlane() {
  const { isDemo } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<UserRole | ''>('');
  const [userStatusFilter, setUserStatusFilter] = useState<AccountStatus | ''>('');
  const [userSortKey, setUserSortKey] = useState<UserSortKey>('name');
  const [userSortDirection, setUserSortDirection] = useState<SortDirection>('asc');
  const [auditSearch, setAuditSearch] = useState('');
  const [action, setAction] = useState('');
  const [range, setRange] = useState<AuditRange>('30d');
  const [auditSortDirection, setAuditSortDirection] = useState<SortDirection>('desc');
  const [role, setRole] = useState<UserRole>('learner');
  const [status, setStatus] = useState<AccountStatus>('pending');
  const [centreId, setCentreId] = useState('');
  const [programme, setProgramme] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const usersQuery = trpc.admin.users.list.useQuery(undefined, { retry: false, enabled: !isDemo });
  const auditInput = useMemo(() => {
    const durations: Record<AuditRange, number | undefined> = { all: undefined, '24h': 86_400_000, '7d': 604_800_000, '30d': 2_592_000_000 };
    const duration = durations[range];
    return {
      search: auditSearch.trim() || undefined,
      action: action || undefined,
      from: duration === undefined ? undefined : new Date(Date.now() - duration),
      limit: 200,
    };
  }, [action, auditSearch, range]);
  const auditQuery = trpc.admin.audit.useQuery(auditInput, { retry: false, enabled: !isDemo });
  const users = (isDemo ? DEMO_USERS : (usersQuery.data ?? [])) as AdminUser[];
  const selectedUser = users.find((user) => user.id === selectedId) ?? users[0];

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    const filtered = users.filter((user) => {
      const searchable = `${user.name ?? ''} ${user.email ?? ''} ${user.openId ?? ''} ${user.programme ?? ''}`.toLowerCase();
      return (!query || searchable.includes(query)) && (!userRoleFilter || user.role === userRoleFilter) && (!userStatusFilter || user.accountStatus === userStatusFilter);
    });
    const selectors: Record<UserSortKey, (user: AdminUser) => string | number | null | undefined> = {
      name: (user) => user.name,
      role: (user) => user.role,
      status: (user) => statusLabel(user.accountStatus),
      lastSignedIn: (user) => user.lastSignedIn ? String(user.lastSignedIn) : null,
    };
    return sortRows(filtered, selectors[userSortKey], userSortDirection);
  }, [userRoleFilter, userSearch, userSortDirection, userSortKey, userStatusFilter, users]);

  const auditLogs = isDemo ? DEMO_AUDIT_LOGS : (auditQuery.data ?? []);
  const sortedAuditLogs = useMemo(() => sortRows(auditLogs, (log: any) => String(log.createdAt), auditSortDirection), [auditLogs, auditSortDirection]);

  useEffect(() => {
    if (!selectedUser) return;
    setSelectedId(selectedUser.id);
    setRole(selectedUser.role);
    setStatus(selectedUser.accountStatus ?? 'pending');
    setCentreId(selectedUser.centreId === undefined ? '' : String(selectedUser.centreId));
    setProgramme(selectedUser.programme ?? '');
  }, [selectedUser?.id]);

  const refresh = async () => {
    if (isDemo) { setNotice('Demo directory refreshed. Connected accounts use live database records.'); return; }
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
    if (isDemo) { setNotice(`Demo access change prepared for ${selectedUser.name}. Connected accounts save this change to the database and audit log.`); return; }
    const parsedCentre = centreId.trim() ? Number(centreId) : null;
    if (parsedCentre !== null && (!Number.isInteger(parsedCentre) || parsedCentre <= 0)) {
      setNotice('Centre ID must be a positive number or blank.');
      return;
    }
    updateMutation.mutate({ userId: selectedUser.id, role, accountStatus: status, centreId: parsedCentre, programme: programme.trim() || null });
  };

  const updateUserSort = (key: UserSortKey) => {
    setUserSortDirection((direction) => toggleSort(userSortKey, key, direction));
    setUserSortKey(key);
  };

  const selectUser = (id: number) => setSelectedId(id);
  const approveUser = (id: number) => {
    if (isDemo) { setNotice('Demo user approved. Connected accounts record approvals in the server audit log.'); return; }
    approveMutation.mutate({ userId: id });
  };

  return <div className="admin-control-plane">
    <div className="page-heading"><div><div className="eyebrow">Administrator workspace</div><h2>Access control</h2><p>Approve identities, assign operational access, and review every change in one place.</p></div><button className="button-secondary" onClick={() => void refresh()}><RefreshCw size={16} /> Refresh data</button></div>
    {isDemo && <div className="notice demo-mode-notice" role="status" style={{ marginBottom: 18 }}>Demo administrator workspace: the directory and audit log are prepared sample records. Access edits and approvals are simulated locally.</div>}
    {notice && <div className="notice" role="status" style={{ marginBottom: 18 }}>{notice}</div>}
    {usersQuery.error && <div className="notice warning-notice" style={{ marginBottom: 18 }}>The administrator API could not load this directory. Confirm that your account is an active administrator and retry.</div>}
    <div className="admin-workspace-grid">
      <section className="surface-card admin-directory-card">
        <div className="card-header"><div><h3>User directory</h3><p>{filteredUsers.length} of {users.length} synchronised identities</p></div><ShieldCheck size={18} color="#0e7c86" /></div>
        <div className="table-toolbar">
          <label className="table-search"><Search size={15} /><span className="sr-only">Search users</span><input className="field-control" placeholder="Search name, email or programme" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} /></label>
          <select className="field-control" aria-label="Filter users by role" value={userRoleFilter} onChange={(event) => setUserRoleFilter(event.target.value as UserRole | '')}><option value="">All roles</option>{roles.map((item) => <option value={item} key={item}>{item.toUpperCase()}</option>)}</select>
          <select className="field-control" aria-label="Filter users by account status" value={userStatusFilter} onChange={(event) => setUserStatusFilter(event.target.value as AccountStatus | '')}><option value="">All statuses</option>{statuses.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select>
        </div>
        <div className="table-wrap admin-table-wrap">
          <table className="data-table admin-data-table"><thead><tr>
            <th><button className="table-sort-button" onClick={() => updateUserSort('name')}>Identity <SortIcon active={userSortKey === 'name'} direction={userSortDirection} /></button></th>
            <th><button className="table-sort-button" onClick={() => updateUserSort('role')}>Role <SortIcon active={userSortKey === 'role'} direction={userSortDirection} /></button></th>
            <th><button className="table-sort-button" onClick={() => updateUserSort('status')}>Status <SortIcon active={userSortKey === 'status'} direction={userSortDirection} /></button></th>
            <th><button className="table-sort-button" onClick={() => updateUserSort('lastSignedIn')}>Last active <SortIcon active={userSortKey === 'lastSignedIn'} direction={userSortDirection} /></button></th>
          </tr></thead><tbody>
            {filteredUsers.map((user) => <tr key={user.id} className={selectedUser?.id === user.id ? 'admin-table-row-active' : ''} onClick={() => selectUser(user.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectUser(user.id); } }} tabIndex={0} aria-selected={selectedUser?.id === user.id}>
              <td><div className="admin-table-user"><span className="profile-avatar">{(user.name ?? 'U').slice(0, 1).toUpperCase()}</span><span><strong>{user.name ?? 'Unnamed user'}</strong><small>{user.email ?? user.openId ?? 'No email provided'}</small></span></div></td>
              <td>{user.role.toUpperCase()}</td><td><span className={`status-badge ${statusTone(user.accountStatus)}`}>{statusLabel(user.accountStatus)}</span></td><td>{user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString() : 'Never'}</td>
            </tr>)}
          </tbody></table>
        </div>
        {!usersQuery.isLoading && filteredUsers.length === 0 && <div className="empty-state compact"><div><strong>No matching users</strong><p>Try a different search term or filter.</p></div></div>}
      </section>
      <section className="surface-card"><div className="card-header"><div><h3>User access</h3><p>Role and scope changes take effect on the next authenticated request.</p></div></div>{selectedUser ? <><div className="admin-selected-user"><strong>{selectedUser.name ?? 'Unnamed user'}</strong><span>{selectedUser.email ?? selectedUser.openId}</span></div>{(selectedUser.accountStatus === 'pending' || selectedUser.accountStatus === 'suspended') && <button className="button-primary admin-approve-button" disabled={approveMutation.isPending} onClick={() => approveUser(selectedUser.id)}><CheckCircle2 size={16} /> {approveMutation.isPending ? 'Approving…' : 'Approve user'}</button>}<label className="field-label" htmlFor="admin-role">Role</label><select id="admin-role" className="field-control" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>{roles.map((item) => <option value={item} key={item}>{item.toUpperCase()}</option>)}</select><label className="field-label" htmlFor="admin-status">Account status</label><select id="admin-status" className="field-control" value={status} onChange={(event) => setStatus(event.target.value as AccountStatus)}>{statuses.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select><div className="field-grid"><div><label className="field-label" htmlFor="admin-centre">Centre ID</label><input id="admin-centre" className="field-control" value={centreId} onChange={(event) => setCentreId(event.target.value)} inputMode="numeric" /></div><div><label className="field-label" htmlFor="admin-programme">Programme</label><input id="admin-programme" className="field-control" value={programme} onChange={(event) => setProgramme(event.target.value)} /></div></div><button className="button-primary" onClick={saveAccess} disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Saving…' : 'Save access changes'}</button></> : <div className="empty-state compact"><div><strong>Select a user</strong><p>Choose an identity from the directory to manage access.</p></div></div>}</section>
    </div>
    <section className="surface-card audit-workspace-card"><div className="card-header"><div><h3>Access audit log</h3><p>Search by action, actor ID, or target ID. Filters run against {isDemo ? 'prepared demo records' : 'persisted audit records'}.</p></div><Search size={18} color="#0e7c86" /></div><div className="audit-filter-row"><label className="sr-only" htmlFor="audit-search">Search audit log</label><input id="audit-search" className="field-control" placeholder="Search action or user ID" value={auditSearch} onChange={(event) => setAuditSearch(event.target.value)} /><select className="field-control" aria-label="Filter audit action" value={action} onChange={(event) => setAction(event.target.value)}>{auditActions.map((item) => <option value={item.value} key={item.label}>{item.label}</option>)}</select><select className="field-control" aria-label="Filter audit date range" value={range} onChange={(event) => setRange(event.target.value as AuditRange)}><option value="all">All time</option><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></select></div>{auditQuery.error && <div className="notice warning-notice">Audit records are unavailable. Retry when the service is reachable.</div>}<div className="table-wrap audit-table-wrap"><table className="data-table"><thead><tr><th>Action</th><th>Actor</th><th>Target</th><th><button className="table-sort-button" onClick={() => setAuditSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc')}>Date <SortIcon active direction={auditSortDirection} /></button></th></tr></thead><tbody>{sortedAuditLogs.map((log: any) => <tr key={log.id}><td><strong>{log.action}</strong></td><td>{log.actorId}</td><td>{log.targetUserId ?? '—'}</td><td><time dateTime={String(log.createdAt)}>{new Date(log.createdAt).toLocaleString()}</time></td></tr>)}</tbody></table></div>{!auditQuery.isLoading && sortedAuditLogs.length === 0 && <div className="empty-state compact"><div><strong>No matching audit events</strong><p>Try a wider date range or a different search term.</p></div></div>}</section>
  </div>;
}
