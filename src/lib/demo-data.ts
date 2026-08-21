import type { AdminAuditLog, AdminUser, AccountStatus, Marking, Submission, TrainingSession, Unit, User, UserRole } from '@/types';

export type DemoVariant = 'learner' | 'student';

const active = 'active' as const;

export const DEMO_USERS: AdminUser[] = [
  { id: 101, name: 'Alex Johnson', email: 'alex.johnson@demo.learnport.local', role: 'learner', accountStatus: active, openId: 'demo-learner-alex', centreId: 12, programme: 'Level 3 Health & Social Care', explicitPermissions: [], defaultPermissions: ['portfolio.read', 'submissions.create'], lastSignedIn: '2026-08-21T08:40:00Z' },
  { id: 102, name: 'Maya Patel', email: 'maya.patel@demo.learnport.local', role: 'learner', accountStatus: active, openId: 'demo-student-maya', centreId: 12, programme: 'Level 3 Health & Social Care', explicitPermissions: [], defaultPermissions: ['portfolio.read', 'submissions.create'], lastSignedIn: '2026-08-21T08:25:00Z' },
  { id: 103, name: 'Sarah Mitchell', email: 'sarah.mitchell@demo.learnport.local', role: 'assessor', accountStatus: active, openId: 'demo-assessor-sarah', centreId: 12, programme: 'Level 3 Health & Social Care', explicitPermissions: [], defaultPermissions: ['marking.read', 'marking.create'], lastSignedIn: '2026-08-21T08:15:00Z' },
  { id: 104, name: 'David Clarke', email: 'david.clarke@demo.learnport.local', role: 'trainer', accountStatus: active, openId: 'demo-trainer-david', centreId: 12, programme: 'Level 3 Health & Social Care', explicitPermissions: [], defaultPermissions: ['sessions.read', 'materials.create'], lastSignedIn: '2026-08-21T07:55:00Z' },
  { id: 105, name: 'Emma Thompson', email: 'emma.thompson@demo.learnport.local', role: 'iqa', accountStatus: active, openId: 'demo-iqa-emma', centreId: 12, programme: 'Quality assurance', explicitPermissions: [], defaultPermissions: ['sampling.read'], lastSignedIn: '2026-08-20T16:30:00Z' },
  { id: 106, name: 'James Wilson', email: 'james.wilson@demo.learnport.local', role: 'eqa', accountStatus: active, openId: 'demo-eqa-james', centreId: 12, programme: 'External quality assurance', explicitPermissions: [], defaultPermissions: ['compliance.read', 'sampling.read'], lastSignedIn: '2026-08-20T15:45:00Z' },
  { id: 107, name: 'Priya Nair', email: 'priya.nair@demo.learnport.local', role: 'admin', accountStatus: active, openId: 'demo-admin-priya', centreId: 12, programme: 'Centre administration', explicitPermissions: [], defaultPermissions: ['admin.users', 'admin.audit'], lastSignedIn: '2026-08-21T08:55:00Z' },
];

export function demoUserFor(role: UserRole, variant: DemoVariant = 'learner'): User {
  const id = role === 'learner' && variant === 'student' ? 102 : DEMO_USERS.find((user) => user.role === role)?.id;
  const user = DEMO_USERS.find((candidate) => candidate.id === id) ?? DEMO_USERS[0];
  return { id: user.id, name: user.name, email: user.email, role: user.role, accountStatus: 'active', openId: user.openId, centreId: user.centreId, programme: user.programme };
}

export const DEMO_UNITS: Unit[] = [
  { id: 201, code: 'HSC 024', title: 'Principles of Safeguarding and Protection', criteria: [{ id: 2101, unitId: 201, code: '1.1', description: 'Define the different types of abuse' }, { id: 2102, unitId: 201, code: '1.2', description: 'Identify signs and symptoms associated with each type of abuse' }, { id: 2103, unitId: 201, code: '2.1', description: 'Explain the actions to take if abuse is suspected' }] },
  { id: 202, code: 'HSC 025', title: 'The Role of the Health and Social Care Worker', criteria: [{ id: 2201, unitId: 202, code: '1.1', description: 'Explain how a working relationship differs from a personal relationship' }, { id: 2202, unitId: 202, code: '1.2', description: 'Describe working relationships in care settings' }] },
  { id: 203, code: 'HSC 026', title: 'Implement Person-Centred Approaches', criteria: [{ id: 2301, unitId: 203, code: '1.1', description: 'Define person-centred values' }, { id: 2302, unitId: 203, code: '1.2', description: 'Explain how person-centred values shape practice' }] },
  { id: 204, code: 'HSC 028', title: 'Handle Information in Care Settings', criteria: [{ id: 2401, unitId: 204, code: '1.1', description: 'Identify legislation for recording, storing and sharing information' }, { id: 2402, unitId: 204, code: '2.1', description: 'Describe secure manual and electronic information storage' }] },
];

export const DEMO_SUBMISSIONS: Submission[] = [
  { id: 301, learnerId: 101, unitId: 201, criterionId: 2101, title: 'Types of Abuse – Reflective Account', description: 'A reflective account with workplace examples and legislation references.', fileUrl: 'https://example.com/demo/reflective-account.pdf', status: 'passed', createdAt: new Date('2026-08-10T09:30:00Z'), submittedAt: new Date('2026-08-10T09:30:00Z') },
  { id: 302, learnerId: 101, unitId: 202, criterionId: 2201, title: 'Working Relationships in Care – Assignment', description: 'Comparison of professional and personal relationships.', fileUrl: 'https://example.com/demo/working-relationships.pdf', status: 'submitted', createdAt: new Date('2026-08-18T11:00:00Z'), submittedAt: new Date('2026-08-18T11:00:00Z') },
  { id: 303, learnerId: 101, unitId: 203, criterionId: 2301, title: 'Person-Centred Values – Case Study', description: 'Case study from a supported living placement.', fileUrl: 'https://example.com/demo/person-centred.pdf', status: 'referred', createdAt: new Date('2026-08-14T13:20:00Z'), submittedAt: new Date('2026-08-14T13:20:00Z') },
  { id: 304, learnerId: 102, unitId: 201, criterionId: 2102, title: 'Safeguarding Signs and Symptoms – Workbook', description: 'Workbook evidence for safeguarding indicators.', fileUrl: 'https://example.com/demo/safeguarding-workbook.pdf', status: 'submitted', createdAt: new Date('2026-08-19T10:10:00Z'), submittedAt: new Date('2026-08-19T10:10:00Z') },
  { id: 305, learnerId: 101, unitId: 204, criterionId: 2401, title: 'Information Governance – Draft Notes', description: 'Draft notes awaiting final submission.', status: 'draft', createdAt: new Date('2026-08-20T15:00:00Z') },
];

export const DEMO_PORTFOLIO_UNITS = [
  { learnerId: 101, unitId: 201, status: 'passed' },
  { learnerId: 101, unitId: 202, status: 'in-progress' },
  { learnerId: 101, unitId: 203, status: 'referred' },
  { learnerId: 101, unitId: 204, status: 'not-started' },
  { learnerId: 102, unitId: 201, status: 'in-progress' },
  { learnerId: 102, unitId: 202, status: 'in-progress' },
  { learnerId: 102, unitId: 203, status: 'not-started' },
  { learnerId: 102, unitId: 204, status: 'not-started' },
] as const;

export const DEMO_MARKINGS: Marking[] = [
  { id: 401, submissionId: 301, assessorId: 103, grade: 'pass', overallFeedback: 'Clear definitions and strong workplace examples. Good use of safeguarding guidance.', flaggedForIqa: true, markedAt: new Date('2026-08-12T14:00:00Z') },
  { id: 402, submissionId: 303, assessorId: 103, grade: 'refer', overallFeedback: 'Please expand how person-centred values changed the care plan in practice.', flaggedForIqa: false, markedAt: new Date('2026-08-16T09:15:00Z') },
];

export const DEMO_SESSIONS: TrainingSession[] = [
  { id: 501, title: 'Safeguarding Awareness Workshop', description: 'Interactive workshop covering reporting procedures, case studies and Q&A.', trainerId: 104, startDate: new Date('2026-08-25T10:00:00Z'), status: 'scheduled' },
  { id: 502, title: 'Person-Centred Approaches – Online Session', description: 'Live session exploring person-centred values with practical activities.', trainerId: 104, startDate: new Date('2026-08-28T14:00:00Z'), status: 'scheduled' },
  { id: 503, title: 'Information Governance in Care', description: 'Completed session on secure information handling.', trainerId: 104, startDate: new Date('2026-08-12T09:00:00Z'), status: 'completed' },
];

export const DEMO_IQA_SAMPLES = [
  { id: 601, submissionId: 301, assessorId: 103, flaggedForIqa: true, markedAt: new Date('2026-08-12T14:00:00Z') },
  { id: 602, submissionId: 303, assessorId: 103, flaggedForIqa: true, markedAt: new Date('2026-08-16T09:15:00Z') },
];

export const DEMO_COMPLIANCE = [
  { id: 701, centreId: 12, recordType: 'Assessment sampling plan', status: 'compliant', reviewDate: new Date('2026-08-18T09:00:00Z') },
  { id: 702, centreId: 12, recordType: 'Staff standardisation record', status: 'needs-improvement', reviewDate: new Date('2026-08-15T09:00:00Z') },
  { id: 703, centreId: 12, recordType: 'Learner evidence audit', status: 'compliant', reviewDate: new Date('2026-08-11T09:00:00Z') },
  { id: 704, centreId: 12, recordType: 'Assessment action tracker', status: 'non-compliant', reviewDate: new Date('2026-08-09T09:00:00Z') },
];

export const DEMO_NOTIFICATIONS = [
  { id: 801, userId: 101, title: 'Feedback received', message: 'Sarah Mitchell marked your safeguarding reflective account as Pass.', read: false, createdAt: new Date('2026-08-12T14:05:00Z') },
  { id: 802, userId: 101, title: 'Action required', message: 'Your person-centred case study has been referred with feedback to review.', read: false, createdAt: new Date('2026-08-16T09:20:00Z') },
  { id: 803, userId: 102, title: 'Submission received', message: 'Your safeguarding workbook is now in the assessor queue.', read: false, createdAt: new Date('2026-08-19T10:15:00Z') },
  { id: 804, userId: 104, title: 'Session reminder', message: 'Safeguarding Awareness Workshop starts on 25 Aug at 10:00.', read: true, createdAt: new Date('2026-08-20T08:00:00Z') },
];

export const DEMO_AUDIT_LOGS: AdminAuditLog[] = [
  { id: 901, actorId: 107, targetUserId: 102, action: 'user.approved', metadata: { source: 'demo' }, createdAt: new Date('2026-08-21T08:55:00Z') },
  { id: 902, actorId: 107, targetUserId: 104, action: 'user.access_updated', metadata: { role: 'trainer' }, createdAt: new Date('2026-08-20T16:12:00Z') },
  { id: 903, actorId: 107, targetUserId: 103, action: 'user.permission_granted', metadata: { permission: 'marking.create' }, createdAt: new Date('2026-08-19T11:45:00Z') },
  { id: 904, actorId: 105, targetUserId: 101, action: 'quality.sampled', metadata: { outcome: 'sampled' }, createdAt: new Date('2026-08-18T13:30:00Z') },
  { id: 905, actorId: 106, targetUserId: 104, action: 'compliance.reviewed', metadata: { outcome: 'follow-up' }, createdAt: new Date('2026-08-17T10:10:00Z') },
  { id: 906, actorId: 104, targetUserId: 101, action: 'training.feedback_added', metadata: { sessionId: 503 }, createdAt: new Date('2026-08-16T15:20:00Z') },
];

export function demoPortfolioFor(learnerId: number) {
  const rows = DEMO_PORTFOLIO_UNITS.filter((row) => row.learnerId === learnerId).map((row) => ({ ...row, unitId: row.unitId }));
  return { portfolioUnits: rows, submissions: DEMO_SUBMISSIONS.filter((submission) => submission.learnerId === learnerId) };
}

export function demoCriteriaFor(unitId: number) {
  return DEMO_UNITS.find((unit) => unit.id === unitId)?.criteria ?? [];
}

export function demoPendingMarking() {
  return DEMO_SUBMISSIONS.filter((submission) => submission.status === 'submitted');
}

export function demoMarkingsFor(assessorId: number) {
  return DEMO_MARKINGS.filter((marking) => marking.assessorId === assessorId);
}

export function demoSessionsFor(trainerId: number) {
  return DEMO_SESSIONS.filter((session) => session.trainerId === trainerId);
}

export function demoSamples() {
  return DEMO_IQA_SAMPLES;
}

export function demoComplianceFor(centreId?: number) {
  return DEMO_COMPLIANCE.filter((record) => !centreId || record.centreId === centreId);
}

export function demoNotificationsFor(userId: number) {
  return DEMO_NOTIFICATIONS.filter((notification) => notification.userId === userId);
}

export function demoAdminStatus(status: AccountStatus = 'active') {
  return DEMO_USERS.map((user) => ({ ...user, accountStatus: status === 'active' ? user.accountStatus : status }));
}
