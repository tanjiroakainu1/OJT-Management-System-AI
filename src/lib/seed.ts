import type { AppState } from '../types';

/** Bump when default accounts or seed data change (forces localStorage refresh). */
export const SEED_VERSION = 4;

const HASH_ADMIN = '$2a$10$hZ4BkgQFcVL.9574mnNb3.4Bo6AjLqg5yFfSI3I8ySpcriqf/dyeO';
const HASH_COORDINATOR = '$2a$10$LnV7S1gnwy1Ki7e94kMqbOeK6c3TKh7UfrnrQt22uZM.nBY8EQlni';
const HASH_STUDENT = '$2a$10$hcZr7jvdmQiLHKpcCnzlGeFvQ8Yk3YHyAVr7Ryl6l16AjmlleI/aS';
const HASH_SUPERVISOR = '$2a$10$7F5OZWdFWb7yEWSLglnpOOkh6LjxV48suZ4ClEL9422m2vXyNXiPS';

export const DEMO_ACCOUNTS = [
  { email: 'admin@gmail.com', password: 'admin123', role: 'admin' as const },
  { email: 'coordinator@gmail.com', password: 'coordinator123', role: 'coordinator' as const },
  { email: 'student@gmail.com', password: 'student123', role: 'student' as const },
  { email: 'supervisor@gmail.com', password: 'supervisor123', role: 'supervisor' as const },
];

export function createSeedState(): AppState {
  const now = new Date().toISOString();
  const today = new Date().toISOString().split('T')[0];

  return {
    nextIds: {
      users: 6,
      students: 3,
      coordinators: 3,
      supervisors: 3,
      companies: 4,
      ojt_applications: 4,
      application_remarks: 3,
      ojt_requirements: 4,
      student_requirements: 5,
      daily_logs: 10,
      evaluations: 3,
      activities: 10,
      announcements: 2,
      announcement_recipients: 5,
    },
    users: [
      {
        id: 1,
        username: 'admin@gmail.com',
        password: HASH_ADMIN,
        role: 'admin',
        email: 'admin@gmail.com',
        full_name: 'System Administrator',
        active: true,
        created_at: now,
      },
      {
        id: 2,
        username: 'coordinator@gmail.com',
        password: HASH_COORDINATOR,
        role: 'coordinator',
        email: 'coordinator@gmail.com',
        full_name: 'Maria Santos',
        active: true,
        created_at: now,
      },
      {
        id: 3,
        username: 'supervisor@gmail.com',
        password: HASH_SUPERVISOR,
        role: 'supervisor',
        email: 'supervisor@gmail.com',
        full_name: 'John Reyes',
        active: true,
        created_at: now,
      },
      {
        id: 4,
        username: 'student@gmail.com',
        password: HASH_STUDENT,
        role: 'student',
        email: 'student@gmail.com',
        full_name: 'Ana Dela Cruz',
        active: true,
        created_at: now,
      },
    ],
    students: [
      {
        id: 1,
        user_id: 4,
        student_id: 'STU000004',
        course: 'BSIT',
        year: 4,
        section: 'A',
        contact: '09171234567',
        address: 'Butuan City',
      },
    ],
    coordinators: [
      { id: 1, user_id: 2, department: 'College of Engineering', contact: '09171112222' },
    ],
    supervisors: [
      { id: 1, user_id: 3, company_id: 1, position: 'IT Manager', contact: '09173334444' },
    ],
    companies: [
      {
        id: 1,
        name: 'TechCorp Solutions',
        address: 'Butuan City, Agusan del Norte',
        contact_person: 'Jane Doe',
        contact_number: '0851234567',
        email: 'info@techcorp.com',
        status: 'active',
        created_at: now,
      },
      {
        id: 2,
        name: 'Digital Innovations Inc',
        address: 'Cagayan de Oro City',
        contact_person: 'Mark Lee',
        contact_number: '0882345678',
        email: 'hr@digitalinnovations.com',
        status: 'active',
        created_at: now,
      },
      {
        id: 3,
        name: 'AgriTech Philippines',
        address: 'Bayugan City',
        contact_person: 'Rosa Mendoza',
        contact_number: '0853456789',
        email: 'contact@agritech.ph',
        status: 'inactive',
        created_at: now,
      },
    ],
    ojt_applications: [
      {
        id: 1,
        student_id: 1,
        company_id: 1,
        position: 'Software Developer Intern',
        start_date: '2025-01-15',
        end_date: '2026-12-31',
        status: 'approved',
        approved_by: 2,
        approved_at: now,
        created_at: now,
      },
    ],
    application_remarks: [],
    ojt_requirements: [
      {
        id: 1,
        name: 'Resume',
        description: 'Updated resume with OJT experience section',
        deadline: '2026-06-30',
        created_by: 2,
        created_at: now,
      },
      {
        id: 2,
        name: 'Parent Consent Form',
        description: 'Signed parent/guardian consent form',
        deadline: '2026-06-30',
        created_by: 2,
        created_at: now,
      },
      {
        id: 3,
        name: 'Medical Certificate',
        description: 'Valid medical certificate from licensed physician',
        deadline: '2026-07-15',
        created_by: 2,
        created_at: now,
      },
    ],
    student_requirements: [
      {
        id: 1,
        student_id: 1,
        requirement_id: 1,
        file_path: 'resume_ana.pdf',
        file_name: 'resume_ana.pdf',
        status: 'approved',
        submitted_at: now,
        reviewed_at: now,
        reviewed_by: 2,
      },
      {
        id: 2,
        student_id: 1,
        requirement_id: 2,
        file_path: 'consent_ana.pdf',
        file_name: 'consent_ana.pdf',
        status: 'pending',
        submitted_at: now,
      },
    ],
    daily_logs: [
      {
        id: 1,
        student_id: 1,
        log_date: today,
        time_in: '08:00',
        time_out: '17:00',
        activities: 'Developed API endpoints and attended team standup.',
        status: 'pending',
        submitted_at: now,
      },
      {
        id: 2,
        student_id: 1,
        log_date: '2025-05-20',
        time_in: '08:30',
        time_out: '17:30',
        activities: 'Code review and documentation updates.',
        status: 'approved',
        submitted_at: now,
        reviewed_at: now,
        reviewed_by: 3,
      },
    ],
    evaluations: [
      {
        id: 1,
        student_id: 1,
        supervisor_id: 1,
        evaluation_date: today,
        punctuality: 5,
        work_quality: 4,
        initiative: 4,
        communication: 5,
        teamwork: 4,
        comments: 'Excellent performance overall.',
        total_score: 4.4,
        created_at: now,
      },
    ],
    activities: [
      {
        id: 1,
        user_id: 1,
        action: 'login',
        entity: 'user',
        entity_id: 1,
        details: 'Admin logged in',
        created_at: now,
      },
      {
        id: 2,
        user_id: 2,
        action: 'approve',
        entity: 'application',
        entity_id: 1,
        details: 'Application approved',
        created_at: now,
      },
    ],
    user_notification_checks: [],
    announcements: [
      {
        id: 1,
        title: 'OJT Orientation',
        message: 'All students must attend the OJT orientation on June 1.',
        target_course: null,
        created_by: 2,
        created_at: now,
      },
    ],
    announcement_recipients: [],
  };
}
