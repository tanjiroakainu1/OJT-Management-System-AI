import bcrypt from 'bcryptjs';
import type {
  Activity,
  ActivityAction,
  Announcement,
  AppState,
  AuthUser,
  Company,
  Coordinator,
  DailyLog,
  Evaluation,
  OjtApplication,
  OjtRequirement,
  Status,
  Student,
  StudentRequirement,
  Supervisor,
  User,
  UserRole,
} from '../types';
import { createSeedState, SEED_VERSION } from './seed';
import { DATA_CHANGED_EVENT, STORAGE_KEYS } from './constants';

const STORAGE_KEY = STORAGE_KEYS.data;
const SEED_VERSION_KEY = STORAGE_KEYS.seedVersion;

function loadState(): AppState {
  const storedVersion = localStorage.getItem(SEED_VERSION_KEY);
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw || storedVersion !== String(SEED_VERSION)) {
    const seed = createSeedState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
    return seed;
  }
  return JSON.parse(raw) as AppState;
}

function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT));
  }
}

function studentUserId(state: AppState, studentId: number): number {
  return state.students.find((s) => s.id === studentId)?.user_id ?? studentId;
}

function nextId(state: AppState, key: string): number {
  const id = state.nextIds[key] ?? 1;
  state.nextIds[key] = id + 1;
  return id;
}

function now(): string {
  return new Date().toISOString();
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Internal: keep username in sync with email for legacy User shape */
function usernameFromEmail(email: string): string {
  return normalizeEmail(email);
}

function isEmailTaken(email: string, excludeUserId?: number): boolean {
  const key = normalizeEmail(email);
  return loadState().users.some(
    (u) => normalizeEmail(u.email) === key && u.id !== excludeUserId
  );
}

export function resetDatabase(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SEED_VERSION_KEY);
  loadState();
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  if (hashed.startsWith('$2y$')) {
    hashed = '$2a$' + hashed.slice(4);
  }
  try {
    return await bcrypt.compare(plain, hashed);
  } catch {
    return plain === hashed;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function logActivity(
  state: AppState,
  userId: number,
  action: ActivityAction,
  entity: string,
  entityId?: number,
  details?: string
): void {
  state.activities.unshift({
    id: nextId(state, 'activities'),
    user_id: userId,
    action,
    entity,
    entity_id: entityId ?? null,
    details: details ?? null,
    created_at: now(),
  });
}

// Auth — login with email address
export async function login(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const state = loadState();
  const key = normalizeEmail(email);
  const user = state.users.find(
    (u) => u.active !== false && normalizeEmail(u.email) === key
  );
  if (!user) return null;
  const valid = await verifyPassword(password, user.password);
  if (!valid) return null;
  logActivity(state, user.id, 'login', 'user', user.id);
  saveState(state);
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url ?? null,
  };
}

export async function registerStudent(data: {
  password: string;
  email: string;
  full_name: string;
}): Promise<{ ok: boolean; error?: string }> {
  const state = loadState();
  const email = normalizeEmail(data.email);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (isEmailTaken(email)) {
    return { ok: false, error: 'Email already registered.' };
  }
  const userId = nextId(state, 'users');
  const hashed = await hashPassword(data.password);
  state.users.push({
    id: userId,
    username: usernameFromEmail(email),
    password: hashed,
    role: 'student',
    email,
    full_name: data.full_name.trim(),
    active: true,
    created_at: now(),
  });
  const studentId = nextId(state, 'students');
  state.students.push({
    id: studentId,
    user_id: userId,
    student_id: `STU${String(userId).padStart(6, '0')}`,
    course: 'Pending',
    year: 1,
    section: 'Pending',
    contact: 'Pending',
    address: 'Pending',
  });
  logActivity(state, userId, 'create', 'user', userId, 'Student registered');
  saveState(state);
  return { ok: true };
}

export function getUserById(id: number): User | undefined {
  return loadState().users.find((u) => u.id === id);
}

export function getStudentByUserId(userId: number): Student | undefined {
  return loadState().students.find((s) => s.user_id === userId);
}

export function getStudentById(id: number): Student | undefined {
  return loadState().students.find((s) => s.id === id);
}

export function getCoordinatorByUserId(userId: number): Coordinator | undefined {
  return loadState().coordinators.find((c) => c.user_id === userId);
}

export function getSupervisorByUserId(userId: number): Supervisor | undefined {
  return loadState().supervisors.find((s) => s.user_id === userId);
}

export function getStudents(filters?: { search?: string; course?: string; year?: number }) {
  const state = loadState();
  return state.students
    .map((s) => ({
      ...s,
      user: state.users.find((u) => u.id === s.user_id),
    }))
    .filter((s) => {
      if (filters?.course && s.course !== filters.course) return false;
      if (filters?.year && s.year !== filters.year) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        if (
          !s.student_id.toLowerCase().includes(q) &&
          !s.user?.full_name.toLowerCase().includes(q) &&
          !s.user?.email.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
}

export function getApplicationById(id: number): OjtApplication | undefined {
  return loadState().ojt_applications.find((a) => a.id === id);
}

export function getApplicationRemarks(applicationId: number) {
  return loadState().application_remarks.filter((r) => r.application_id === applicationId);
}

export function getDailyLogById(id: number): DailyLog | undefined {
  return loadState().daily_logs.find((l) => l.id === id);
}

export function getSupervisorsByCompany(companyId: number): Supervisor[] {
  return loadState().supervisors.filter((s) => s.company_id === companyId);
}

export function getStudentCourses(): string[] {
  return [...new Set(loadState().students.map((s) => s.course))];
}

export function getCompanyById(id: number): Company | undefined {
  return loadState().companies.find((c) => c.id === id);
}

// Users
export function getUsers(filters?: { role?: UserRole; search?: string }): User[] {
  let users = [...loadState().users];
  if (filters?.role) users = users.filter((u) => u.role === filters.role);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    users = users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }
  return users;
}

export async function createUser(
  data: Partial<User> & { password: string; role: UserRole; email: string },
  roleData?: Record<string, unknown>
): Promise<{ id: number } | { error: string }> {
  const state = loadState();
  const email = normalizeEmail(data.email);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }
  if (isEmailTaken(email)) {
    return { error: 'Email already registered.' };
  }
  const userId = nextId(state, 'users');
  const hashed = await hashPassword(data.password);
  state.users.push({
    id: userId,
    username: usernameFromEmail(email),
    password: hashed,
    role: data.role,
    email,
    full_name: data.full_name!.trim(),
    active: true,
    created_at: now(),
  });
  if (data.role === 'student' && roleData) {
    state.students.push({
      id: nextId(state, 'students'),
      user_id: userId,
      student_id: (roleData.student_id as string) || `STU${String(userId).padStart(6, '0')}`,
      course: (roleData.course as string) || 'Pending',
      year: Number(roleData.year) || 1,
      section: (roleData.section as string) || 'A',
      contact: (roleData.contact as string) || '',
      address: (roleData.address as string) || '',
    });
  } else if (data.role === 'coordinator' && roleData) {
    state.coordinators.push({
      id: nextId(state, 'coordinators'),
      user_id: userId,
      department: (roleData.department as string) || '',
      contact: (roleData.contact as string) || '',
    });
  } else if (data.role === 'supervisor' && roleData) {
    state.supervisors.push({
      id: nextId(state, 'supervisors'),
      user_id: userId,
      company_id: Number(roleData.company_id),
      position: (roleData.position as string) || '',
      contact: (roleData.contact as string) || '',
    });
  }
  logActivity(state, userId, 'create', 'user', userId);
  saveState(state);
  return { id: userId };
}

export async function updateUser(
  id: number,
  data: Partial<User>,
  roleData?: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  const state = loadState();
  const idx = state.users.findIndex((u) => u.id === id);
  if (idx < 0) return { ok: false, error: 'User not found.' };
  if (data.email) {
    const email = normalizeEmail(data.email);
    if (isEmailTaken(email, id)) {
      return { ok: false, error: 'Email already registered.' };
    }
    data.email = email;
    data.username = usernameFromEmail(email);
  }
  if (data.password) {
    data.password = await hashPassword(data.password);
  }
  state.users[idx] = { ...state.users[idx], ...data };
  if (roleData) {
    const user = state.users[idx];
    if (user.role === 'student') {
      const sIdx = state.students.findIndex((s) => s.user_id === id);
      if (sIdx >= 0) state.students[sIdx] = { ...state.students[sIdx], ...roleData } as Student;
    } else if (user.role === 'coordinator') {
      const cIdx = state.coordinators.findIndex((c) => c.user_id === id);
      if (cIdx >= 0) state.coordinators[cIdx] = { ...state.coordinators[cIdx], ...roleData } as Coordinator;
    } else if (user.role === 'supervisor') {
      const sIdx = state.supervisors.findIndex((s) => s.user_id === id);
      if (sIdx >= 0) state.supervisors[sIdx] = { ...state.supervisors[sIdx], ...roleData } as Supervisor;
    }
  }
  saveState(state);
  return { ok: true };
}

export function deleteUser(id: number): void {
  const state = loadState();
  const student = state.students.find((s) => s.user_id === id);
  if (student) {
    state.student_requirements = state.student_requirements.filter((r) => r.student_id !== student.id);
    state.daily_logs = state.daily_logs.filter((l) => l.student_id !== student.id);
    state.evaluations = state.evaluations.filter((e) => e.student_id !== student.id);
    state.ojt_applications = state.ojt_applications.filter((a) => a.student_id !== student.id);
    state.students = state.students.filter((s) => s.id !== student.id);
  }
  state.coordinators = state.coordinators.filter((c) => c.user_id !== id);
  state.supervisors = state.supervisors.filter((s) => s.user_id !== id);
  state.users = state.users.filter((u) => u.id !== id);
  saveState(state);
}

// Companies
export function getCompanies(activeOnly = false): Company[] {
  let companies = [...loadState().companies];
  if (activeOnly) companies = companies.filter((c) => c.status === 'active');
  return companies;
}

export function createCompany(data: Omit<Company, 'id' | 'created_at'>): number {
  const state = loadState();
  const id = nextId(state, 'companies');
  state.companies.push({ ...data, id, created_at: now() });
  saveState(state);
  return id;
}

export function updateCompany(id: number, data: Partial<Company>): void {
  const state = loadState();
  const idx = state.companies.findIndex((c) => c.id === id);
  if (idx >= 0) {
    state.companies[idx] = { ...state.companies[idx], ...data };
    saveState(state);
  }
}

export function deleteCompany(id: number): boolean {
  const state = loadState();
  if (state.ojt_applications.some((a) => a.company_id === id)) return false;
  state.companies = state.companies.filter((c) => c.id !== id);
  saveState(state);
  return true;
}

// Applications
export function getApplications(filters?: {
  status?: Status | 'active' | 'completed';
  studentId?: number;
  companyId?: number;
}): OjtApplication[] {
  let apps = [...loadState().ojt_applications];
  if (filters?.studentId) apps = apps.filter((a) => a.student_id === filters.studentId);
  if (filters?.companyId) apps = apps.filter((a) => a.company_id === filters.companyId);
  if (filters?.status === 'active') {
    const t = today();
    apps = apps.filter((a) => a.status === 'approved' && a.end_date >= t);
  } else if (filters?.status === 'completed') {
    const t = today();
    apps = apps.filter((a) => a.status === 'approved' && a.end_date < t);
  } else if (filters?.status) {
    apps = apps.filter((a) => a.status === filters.status);
  }
  return apps;
}

export function createApplication(data: Omit<OjtApplication, 'id' | 'status' | 'created_at'>): number {
  const state = loadState();
  const id = nextId(state, 'ojt_applications');
  state.ojt_applications.push({
    ...data,
    id,
    status: 'pending',
    created_at: now(),
  });
  logActivity(state, studentUserId(state, data.student_id), 'create', 'application', id);
  saveState(state);
  return id;
}

export function updateApplicationStatus(
  id: number,
  status: Status,
  userId: number,
  remarks?: string
): void {
  const state = loadState();
  const idx = state.ojt_applications.findIndex((a) => a.id === id);
  if (idx < 0) return;
  state.ojt_applications[idx] = {
    ...state.ojt_applications[idx],
    status,
    approved_by: userId,
    approved_at: now(),
    remarks: remarks ?? state.ojt_applications[idx].remarks,
  };
  if (remarks) {
    state.application_remarks.push({
      id: nextId(state, 'application_remarks'),
      application_id: id,
      remarks,
      created_by: userId,
      created_at: now(),
    });
  }
  logActivity(
    state,
    userId,
    status === 'approved' ? 'approve' : 'reject',
    'application',
    id
  );
  saveState(state);
}

// Requirements
export function getOjtRequirements(): OjtRequirement[] {
  return loadState().ojt_requirements;
}

export function getOjtRequirementById(id: number): OjtRequirement | undefined {
  return loadState().ojt_requirements.find((r) => r.id === id);
}

export function createOjtRequirement(data: Omit<OjtRequirement, 'id' | 'created_at'>): number {
  const state = loadState();
  const id = nextId(state, 'ojt_requirements');
  state.ojt_requirements.push({ ...data, id, created_at: now() });
  logActivity(state, data.created_by, 'create', 'requirement_template', id, data.name);
  saveState(state);
  return id;
}

export function updateOjtRequirement(
  id: number,
  data: Partial<Pick<OjtRequirement, 'name' | 'description' | 'deadline'>>
): { ok: boolean; error?: string } {
  const state = loadState();
  const idx = state.ojt_requirements.findIndex((r) => r.id === id);
  if (idx < 0) return { ok: false, error: 'Requirement not found.' };
  state.ojt_requirements[idx] = { ...state.ojt_requirements[idx], ...data };
  saveState(state);
  return { ok: true };
}

export function deleteOjtRequirement(id: number): { ok: boolean; error?: string } {
  const state = loadState();
  const exists = state.ojt_requirements.some((r) => r.id === id);
  if (!exists) return { ok: false, error: 'Requirement not found.' };
  state.ojt_requirements = state.ojt_requirements.filter((r) => r.id !== id);
  state.student_requirements = state.student_requirements.filter(
    (sr) => sr.requirement_id !== id
  );
  saveState(state);
  return { ok: true };
}

export function getRequirementSubmissionCount(requirementId: number): number {
  return loadState().student_requirements.filter((sr) => sr.requirement_id === requirementId)
    .length;
}

export function deleteStudentRequirement(id: number): void {
  const state = loadState();
  state.student_requirements = state.student_requirements.filter((sr) => sr.id !== id);
  saveState(state);
}

export function getStudentRequirementById(id: number): StudentRequirement | undefined {
  return loadState().student_requirements.find((r) => r.id === id);
}

export function updateStudentRequirementSubmission(
  id: number,
  studentId: number,
  file_path: string,
  file_name: string
): { ok: boolean; error?: string } {
  const state = loadState();
  const idx = state.student_requirements.findIndex((r) => r.id === id);
  if (idx < 0) return { ok: false, error: 'Submission not found.' };
  const sub = state.student_requirements[idx];
  if (sub.student_id !== studentId) return { ok: false, error: 'Not allowed.' };
  if (sub.status === 'approved') {
    return { ok: false, error: 'Approved submissions cannot be edited.' };
  }
  state.student_requirements[idx] = {
    ...sub,
    file_path,
    file_name,
    status: 'pending',
    remarks: null,
    submitted_at: now(),
    reviewed_at: null,
    reviewed_by: null,
  };
  logActivity(state, studentUserId(state, studentId), 'update', 'requirement', id);
  saveState(state);
  return { ok: true };
}

export function deleteStudentRequirementSubmission(
  id: number,
  studentId: number
): { ok: boolean; error?: string } {
  const state = loadState();
  const sub = state.student_requirements.find((r) => r.id === id);
  if (!sub) return { ok: false, error: 'Submission not found.' };
  if (sub.student_id !== studentId) return { ok: false, error: 'Not allowed.' };
  if (sub.status === 'approved') {
    return { ok: false, error: 'Approved submissions cannot be deleted.' };
  }
  state.student_requirements = state.student_requirements.filter((r) => r.id !== id);
  logActivity(state, studentUserId(state, studentId), 'delete', 'requirement', id);
  saveState(state);
  return { ok: true };
}

export function getStudentRequirements(filters?: {
  studentId?: number;
  status?: Status;
}): StudentRequirement[] {
  let reqs = [...loadState().student_requirements];
  if (filters?.studentId) reqs = reqs.filter((r) => r.student_id === filters.studentId);
  if (filters?.status) reqs = reqs.filter((r) => r.status === filters.status);
  return reqs;
}

export function submitRequirement(data: {
  student_id: number;
  requirement_id: number;
  file_path: string;
  file_name: string;
}): number {
  const state = loadState();
  const id = nextId(state, 'student_requirements');
  state.student_requirements.push({
    ...data,
    id,
    status: 'pending',
    submitted_at: now(),
  });
  logActivity(state, studentUserId(state, data.student_id), 'create', 'requirement', id);
  saveState(state);
  return id;
}

export function updateStudentRequirementStatus(
  id: number,
  status: Status,
  userId: number,
  remarks?: string
): void {
  const state = loadState();
  const idx = state.student_requirements.findIndex((r) => r.id === id);
  if (idx < 0) return;
  state.student_requirements[idx] = {
    ...state.student_requirements[idx],
    status,
    remarks: remarks ?? null,
    reviewed_at: now(),
    reviewed_by: userId,
  };
  logActivity(
    state,
    userId,
    status === 'approved' ? 'approve' : 'reject',
    'requirement',
    id
  );
  saveState(state);
}

export function resubmitRequirement(
  id: number,
  file_path: string,
  file_name: string
): void {
  const state = loadState();
  const idx = state.student_requirements.findIndex((r) => r.id === id);
  if (idx < 0) return;
  state.student_requirements[idx] = {
    ...state.student_requirements[idx],
    file_path,
    file_name,
    status: 'pending',
    remarks: null,
    submitted_at: now(),
    reviewed_at: null,
    reviewed_by: null,
  };
  saveState(state);
}

// Daily logs
export function getDailyLogs(filters?: {
  studentId?: number;
  status?: Status;
  companyId?: number;
}): DailyLog[] {
  let logs = [...loadState().daily_logs];
  if (filters?.studentId) logs = logs.filter((l) => l.student_id === filters.studentId);
  if (filters?.status) logs = logs.filter((l) => l.status === filters.status);
  if (filters?.companyId) {
    const studentIds = getApplications({ companyId: filters.companyId, status: 'approved' }).map(
      (a) => a.student_id
    );
    logs = logs.filter((l) => studentIds.includes(l.student_id));
  }
  return logs;
}

export function createDailyLog(data: Omit<DailyLog, 'id' | 'status' | 'submitted_at'>): { ok: boolean; error?: string } {
  const state = loadState();
  if (
    state.daily_logs.some(
      (l) => l.student_id === data.student_id && l.log_date === data.log_date
    )
  ) {
    return { ok: false, error: 'A log for this date already exists.' };
  }
  const id = nextId(state, 'daily_logs');
  state.daily_logs.push({
    ...data,
    id,
    status: 'pending',
    submitted_at: now(),
  });
  logActivity(state, studentUserId(state, data.student_id), 'create', 'log', id);
  saveState(state);
  return { ok: true };
}

export function updateDailyLog(id: number, data: Partial<DailyLog>): { ok: boolean; error?: string } {
  const state = loadState();
  const idx = state.daily_logs.findIndex((l) => l.id === id);
  if (idx < 0) return { ok: false, error: 'Log not found.' };
  if (state.daily_logs[idx].status === 'approved') {
    return { ok: false, error: 'Cannot edit approved logs.' };
  }
  state.daily_logs[idx] = { ...state.daily_logs[idx], ...data };
  saveState(state);
  return { ok: true };
}

export function updateDailyLogStatus(
  id: number,
  status: Status,
  userId: number,
  remarks?: string
): void {
  const state = loadState();
  const idx = state.daily_logs.findIndex((l) => l.id === id);
  if (idx < 0) return;
  state.daily_logs[idx] = {
    ...state.daily_logs[idx],
    status,
    remarks: remarks ?? null,
    reviewed_at: now(),
    reviewed_by: userId,
  };
  logActivity(state, userId, status === 'approved' ? 'approve' : 'reject', 'log', id);
  saveState(state);
}

// Evaluations
export function getEvaluations(filters?: {
  studentId?: number;
  supervisorId?: number;
  companyId?: number;
}): Evaluation[] {
  let evals = [...loadState().evaluations];
  if (filters?.studentId) evals = evals.filter((e) => e.student_id === filters.studentId);
  if (filters?.supervisorId) evals = evals.filter((e) => e.supervisor_id === filters.supervisorId);
  if (filters?.companyId) {
    const supIds = loadState()
      .supervisors.filter((s) => s.company_id === filters.companyId)
      .map((s) => s.id);
    evals = evals.filter((e) => supIds.includes(e.supervisor_id));
  }
  return evals;
}

export function upsertEvaluation(data: Omit<Evaluation, 'id' | 'total_score' | 'created_at'>): number {
  const state = loadState();
  const total =
    (data.punctuality + data.work_quality + data.initiative + data.communication + data.teamwork) / 5;
  const existing = state.evaluations.findIndex(
    (e) => e.student_id === data.student_id && e.supervisor_id === data.supervisor_id
  );
  if (existing >= 0) {
    state.evaluations[existing] = {
      ...state.evaluations[existing],
      ...data,
      total_score: total,
    };
    saveState(state);
    return state.evaluations[existing].id;
  }
  const id = nextId(state, 'evaluations');
  state.evaluations.push({
    ...data,
    id,
    total_score: total,
    created_at: now(),
  });
  logActivity(state, data.supervisor_id, 'create', 'evaluation', id);
  saveState(state);
  return id;
}

// Activities & notifications
export function getActivities(limit = 20): Activity[] {
  return loadState().activities.slice(0, limit);
}

export function getNotificationCount(userId: number): number {
  const state = loadState();
  const student = state.students.find((s) => s.user_id === userId);
  if (!student) return 0;
  const check = state.user_notification_checks.find((c) => c.user_id === userId);
  const lastChecked = check?.last_checked ?? '2000-01-01';
  const appIds = state.ojt_applications.filter((a) => a.student_id === student.id).map((a) => a.id);
  const logIds = state.daily_logs.filter((l) => l.student_id === student.id).map((l) => l.id);
  const reqIds = state.student_requirements
    .filter((r) => r.student_id === student.id)
    .map((r) => r.id);
  return state.activities.filter(
    (a) =>
      ['application', 'log', 'requirement'].includes(a.entity) &&
      (appIds.includes(a.entity_id!) ||
        logIds.includes(a.entity_id!) ||
        reqIds.includes(a.entity_id!)) &&
      a.created_at > lastChecked
  ).length;
}

export function markNotificationsRead(userId: number): void {
  const state = loadState();
  const idx = state.user_notification_checks.findIndex((c) => c.user_id === userId);
  const entry = { user_id: userId, last_checked: now() };
  if (idx >= 0) state.user_notification_checks[idx] = entry;
  else state.user_notification_checks.push(entry);
  saveState(state);
}

// Announcements
export function getAnnouncements(): Announcement[] {
  return [...loadState().announcements].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getAnnouncementById(id: number): Announcement | undefined {
  return loadState().announcements.find((a) => a.id === id);
}

export type AnnouncementWithCreator = Announcement & {
  creator_name: string;
  creator_email: string;
};

export function getAnnouncementsWithCreator(): AnnouncementWithCreator[] {
  const state = loadState();
  return getAnnouncements().map((a) => {
    const creator = state.users.find((u) => u.id === a.created_by);
    return {
      ...a,
      creator_name: creator?.full_name ?? 'Unknown',
      creator_email: creator?.email ?? '—',
    };
  });
}

function syncAnnouncementRecipients(
  state: AppState,
  announcementId: number,
  targetCourse: string | null | undefined
): void {
  state.announcement_recipients = state.announcement_recipients.filter(
    (r) => r.announcement_id !== announcementId
  );
  const students = state.students.filter(
    (s) => !targetCourse || s.course === targetCourse
  );
  for (const s of students) {
    state.announcement_recipients.push({
      id: nextId(state, 'announcement_recipients'),
      announcement_id: announcementId,
      student_id: s.id,
    });
  }
}

export function createAnnouncement(data: Omit<Announcement, 'id' | 'created_at'>): number {
  const state = loadState();
  const id = nextId(state, 'announcements');
  state.announcements.push({ ...data, id, created_at: now() });
  syncAnnouncementRecipients(state, id, data.target_course);
  logActivity(state, data.created_by, 'create', 'announcement', id, data.title);
  saveState(state);
  return id;
}

export function updateAnnouncement(
  id: number,
  data: Partial<Pick<Announcement, 'title' | 'message' | 'target_course'>>
): { ok: boolean; error?: string } {
  const state = loadState();
  const idx = state.announcements.findIndex((a) => a.id === id);
  if (idx < 0) return { ok: false, error: 'Announcement not found.' };
  const previous = state.announcements[idx];
  const targetCourse =
    data.target_course !== undefined ? data.target_course : previous.target_course;
  state.announcements[idx] = {
    ...previous,
    ...data,
    target_course: targetCourse ?? null,
  };
  if (data.target_course !== undefined && data.target_course !== previous.target_course) {
    syncAnnouncementRecipients(state, id, targetCourse);
  }
  saveState(state);
  return { ok: true };
}

export function deleteAnnouncement(id: number): { ok: boolean; error?: string } {
  const state = loadState();
  if (!state.announcements.some((a) => a.id === id)) {
    return { ok: false, error: 'Announcement not found.' };
  }
  state.announcements = state.announcements.filter((a) => a.id !== id);
  state.announcement_recipients = state.announcement_recipients.filter(
    (r) => r.announcement_id !== id
  );
  saveState(state);
  return { ok: true };
}

export function getAnnouncementRecipientCount(announcementId: number): number {
  return loadState().announcement_recipients.filter((r) => r.announcement_id === announcementId)
    .length;
}

// Stats helpers
export function getAdminStats() {
  const state = loadState();
  const t = today();
  return {
    total_students: state.students.length,
    total_companies: state.companies.filter((c) => c.status === 'active').length,
    total_coordinators: state.users.filter((u) => u.role === 'coordinator').length,
    total_supervisors: state.supervisors.length,
    pending_applications: state.ojt_applications.filter((a) => a.status === 'pending').length,
    active_ojts: state.ojt_applications.filter(
      (a) => a.status === 'approved' && a.end_date >= t
    ).length,
    completed_ojts: state.ojt_applications.filter(
      (a) => a.status === 'approved' && a.end_date < t
    ).length,
  };
}

export function getCoordinatorStats() {
  const state = loadState();
  return {
    student_count: state.students.length,
    pending_apps: state.ojt_applications.filter((a) => a.status === 'pending').length,
    approved_apps: state.ojt_applications.filter((a) => a.status === 'approved').length,
    pending_requirements: state.student_requirements.filter((r) => r.status === 'pending')
      .length,
  };
}

export function getSupervisorStats(companyId: number, supervisorId: number) {
  const state = loadState();
  const t = today();
  const assigned = new Set(
    state.ojt_applications
      .filter(
        (a) =>
          a.company_id === companyId &&
          a.status === 'approved' &&
          a.start_date <= t &&
          a.end_date >= t
      )
      .map((a) => a.student_id)
  );
  const studentIds = [...assigned];
  return {
    assigned_students: assigned.size,
    pending_logs: state.daily_logs.filter(
      (l) => studentIds.includes(l.student_id) && l.status === 'pending'
    ).length,
    total_evaluations: state.evaluations.filter((e) => e.supervisor_id === supervisorId).length,
    active_ojts: state.ojt_applications.filter(
      (a) =>
        a.company_id === companyId &&
        a.status === 'approved' &&
        a.start_date <= t &&
        a.end_date >= t
    ).length,
  };
}

export function calcHours(timeIn: string, timeOut: string): string {
  const [inH, inM] = timeIn.split(':').map(Number);
  const [outH, outM] = timeOut.split(':').map(Number);
  const mins = outH * 60 + outM - (inH * 60 + inM);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

export function getFullState(): AppState {
  return loadState();
}
