export type UserRole = 'admin' | 'coordinator' | 'supervisor' | 'student';

export type Status = 'pending' | 'approved' | 'rejected';
export type CompanyStatus = 'active' | 'inactive';
export type ActivityAction = 'create' | 'update' | 'delete' | 'login' | 'approve' | 'reject';

export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  email: string;
  full_name: string;
  /** Base64 data URL for profile photo */
  avatar_url?: string | null;
  active?: boolean;
  created_at: string;
}

export interface Student {
  id: number;
  user_id: number;
  student_id: string;
  course: string;
  year: number;
  section: string;
  contact: string;
  address: string;
}

export interface Coordinator {
  id: number;
  user_id: number;
  department: string;
  contact: string;
}

export interface Supervisor {
  id: number;
  user_id: number;
  company_id: number;
  position: string;
  contact: string;
}

export interface Company {
  id: number;
  name: string;
  address: string;
  contact_person: string;
  contact_number: string;
  email: string;
  status: CompanyStatus;
  created_at: string;
}

export interface OjtApplication {
  id: number;
  student_id: number;
  company_id: number;
  position: string;
  start_date: string;
  end_date: string;
  status: Status;
  approved_by?: number | null;
  approved_at?: string | null;
  remarks?: string | null;
  created_at: string;
}

export interface ApplicationRemark {
  id: number;
  application_id: number;
  remarks: string;
  created_by: number;
  created_at: string;
}

export interface OjtRequirement {
  id: number;
  name: string;
  description: string;
  deadline: string;
  created_by: number;
  created_at: string;
}

export interface StudentRequirement {
  id: number;
  student_id: number;
  requirement_id: number;
  /** Data URL (pdf/image) or legacy filename from seed data */
  file_path: string;
  /** Original uploaded filename */
  file_name?: string | null;
  status: Status;
  remarks?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
  reviewed_by?: number | null;
}

export interface DailyLog {
  id: number;
  student_id: number;
  log_date: string;
  time_in: string;
  time_out: string;
  activities: string;
  status: Status;
  remarks?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
  reviewed_by?: number | null;
}

export interface Evaluation {
  id: number;
  student_id: number;
  supervisor_id: number;
  evaluation_date: string;
  punctuality: number;
  work_quality: number;
  initiative: number;
  communication: number;
  teamwork: number;
  comments?: string | null;
  total_score: number;
  created_at: string;
}

export interface Activity {
  id: number;
  user_id: number;
  action: ActivityAction;
  entity: string;
  entity_id?: number | null;
  details?: string | null;
  created_at: string;
}

export interface UserNotificationCheck {
  user_id: number;
  last_checked: string;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  target_course?: string | null;
  created_by: number;
  created_at: string;
}

export interface AnnouncementRecipient {
  id: number;
  announcement_id: number;
  student_id: number;
  read_at?: string | null;
}

export interface AppState {
  users: User[];
  students: Student[];
  coordinators: Coordinator[];
  supervisors: Supervisor[];
  companies: Company[];
  ojt_applications: OjtApplication[];
  application_remarks: ApplicationRemark[];
  ojt_requirements: OjtRequirement[];
  student_requirements: StudentRequirement[];
  daily_logs: DailyLog[];
  evaluations: Evaluation[];
  activities: Activity[];
  user_notification_checks: UserNotificationCheck[];
  announcements: Announcement[];
  announcement_recipients: AnnouncementRecipient[];
  nextIds: Record<string, number>;
}

export interface AuthUser {
  id: number;
  role: UserRole;
  email: string;
  full_name: string;
  avatar_url?: string | null;
}
