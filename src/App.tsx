import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/admin/Dashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageCompanies from './pages/admin/ManageCompanies';
import ManageUsers from './pages/admin/ManageUsers';
import AdminApplications from './pages/admin/Applications';
import AdminReports from './pages/admin/Reports';
import UserForm from './pages/admin/UserForm';
import CompanyForm from './pages/admin/CompanyForm';
import ViewStudent from './pages/admin/ViewStudent';
import ViewApplication from './pages/admin/ViewApplication';
import ViewUser from './pages/admin/ViewUser';
import ViewCompany from './pages/admin/ViewCompany';
import CoordinatorDashboard from './pages/coordinator/Dashboard';
import CoordinatorManageStudents from './pages/coordinator/ManageStudents';
import CoordinatorApplications from './pages/coordinator/Applications';
import CoordinatorRequirements from './pages/coordinator/Requirements';
import RequirementForm from './pages/coordinator/RequirementForm';
import CoordinatorAnnouncements from './pages/coordinator/Announcements';
import AnnouncementForm from './pages/coordinator/AnnouncementForm';
import CoordinatorEvaluations from './pages/coordinator/Evaluations';
import CoordinatorEditStudent from './pages/coordinator/EditStudent';
import CoordinatorViewStudent from './pages/coordinator/ViewStudent';
import CoordinatorViewApplication from './pages/coordinator/ViewApplication';
import StudentDashboard from './pages/student/Dashboard';
import ApplyOjt from './pages/student/ApplyOjt';
import StudentDailyLogs from './pages/student/DailyLogs';
import LogForm from './pages/student/LogForm';
import StudentRequirements from './pages/student/Requirements';
import StudentTimeline from './pages/student/Timeline';
import ViewLog from './pages/student/ViewLog';
import SupervisorDashboard from './pages/supervisor/Dashboard';
import AssignedStudents from './pages/supervisor/AssignedStudents';
import PendingLogs from './pages/supervisor/PendingLogs';
import EvaluateStudent from './pages/supervisor/EvaluateStudent';
import SupervisorEvaluations from './pages/supervisor/Evaluations';
import AttendanceReport from './pages/supervisor/AttendanceReport';
import SupervisorViewLog from './pages/supervisor/ViewLog';
import SupervisorViewStudent from './pages/supervisor/ViewStudent';
import StudentLogs from './pages/supervisor/StudentLogs';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="admin/students" element={<ProtectedRoute roles={['admin']}><ManageStudents /></ProtectedRoute>} />
        <Route path="admin/students/:id" element={<ProtectedRoute roles={['admin']}><ViewStudent /></ProtectedRoute>} />
        <Route path="admin/companies" element={<ProtectedRoute roles={['admin']}><ManageCompanies /></ProtectedRoute>} />
        <Route path="admin/companies/new" element={<ProtectedRoute roles={['admin']}><CompanyForm /></ProtectedRoute>} />
        <Route path="admin/companies/:id" element={<ProtectedRoute roles={['admin']}><ViewCompany /></ProtectedRoute>} />
        <Route path="admin/companies/:id/edit" element={<ProtectedRoute roles={['admin']}><CompanyForm /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>} />
        <Route path="admin/users/new" element={<ProtectedRoute roles={['admin']}><UserForm /></ProtectedRoute>} />
        <Route path="admin/users/:id" element={<ProtectedRoute roles={['admin']}><ViewUser /></ProtectedRoute>} />
        <Route path="admin/users/:id/edit" element={<ProtectedRoute roles={['admin']}><UserForm /></ProtectedRoute>} />
        <Route path="admin/applications" element={<ProtectedRoute roles={['admin']}><AdminApplications /></ProtectedRoute>} />
        <Route path="admin/applications/:id" element={<ProtectedRoute roles={['admin']}><ViewApplication /></ProtectedRoute>} />
        <Route path="admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />

        <Route path="coordinator" element={<ProtectedRoute roles={['coordinator', 'admin']}><CoordinatorDashboard /></ProtectedRoute>} />
        <Route path="coordinator/students" element={<ProtectedRoute roles={['coordinator', 'admin']}><CoordinatorManageStudents /></ProtectedRoute>} />
        <Route path="coordinator/students/:id" element={<ProtectedRoute roles={['coordinator', 'admin']}><CoordinatorViewStudent /></ProtectedRoute>} />
        <Route path="coordinator/students/:id/edit" element={<ProtectedRoute roles={['coordinator', 'admin']}><CoordinatorEditStudent /></ProtectedRoute>} />
        <Route path="coordinator/applications" element={<ProtectedRoute roles={['coordinator', 'admin']}><CoordinatorApplications /></ProtectedRoute>} />
        <Route path="coordinator/applications/:id" element={<ProtectedRoute roles={['coordinator', 'admin']}><CoordinatorViewApplication /></ProtectedRoute>} />
        <Route path="coordinator/requirements" element={<ProtectedRoute roles={['coordinator', 'admin']}><CoordinatorRequirements /></ProtectedRoute>} />
        <Route path="coordinator/requirements/new" element={<ProtectedRoute roles={['coordinator', 'admin']}><RequirementForm /></ProtectedRoute>} />
        <Route path="coordinator/requirements/:id/edit" element={<ProtectedRoute roles={['coordinator', 'admin']}><RequirementForm /></ProtectedRoute>} />
        <Route path="coordinator/announcements" element={<ProtectedRoute roles={['coordinator', 'admin']}><CoordinatorAnnouncements /></ProtectedRoute>} />
        <Route path="coordinator/announcements/new" element={<ProtectedRoute roles={['coordinator', 'admin']}><AnnouncementForm /></ProtectedRoute>} />
        <Route path="coordinator/announcements/:id/edit" element={<ProtectedRoute roles={['coordinator', 'admin']}><AnnouncementForm /></ProtectedRoute>} />
        <Route path="coordinator/evaluations" element={<ProtectedRoute roles={['coordinator', 'admin']}><CoordinatorEvaluations /></ProtectedRoute>} />
        <Route path="coordinator/reports" element={<ProtectedRoute roles={['coordinator', 'admin']}><AdminReports /></ProtectedRoute>} />

        <Route path="student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="student/apply" element={<ProtectedRoute roles={['student']}><ApplyOjt /></ProtectedRoute>} />
        <Route path="student/logs" element={<ProtectedRoute roles={['student']}><StudentDailyLogs /></ProtectedRoute>} />
        <Route path="student/logs/new" element={<ProtectedRoute roles={['student']}><LogForm /></ProtectedRoute>} />
        <Route path="student/logs/:id" element={<ProtectedRoute roles={['student']}><ViewLog /></ProtectedRoute>} />
        <Route path="student/logs/:id/edit" element={<ProtectedRoute roles={['student']}><LogForm /></ProtectedRoute>} />
        <Route path="student/requirements" element={<ProtectedRoute roles={['student']}><StudentRequirements /></ProtectedRoute>} />
        <Route path="student/timeline" element={<ProtectedRoute roles={['student']}><StudentTimeline /></ProtectedRoute>} />

        <Route path="supervisor" element={<ProtectedRoute roles={['supervisor']}><SupervisorDashboard /></ProtectedRoute>} />
        <Route path="supervisor/students" element={<ProtectedRoute roles={['supervisor']}><AssignedStudents /></ProtectedRoute>} />
        <Route path="supervisor/students/:id" element={<ProtectedRoute roles={['supervisor']}><SupervisorViewStudent /></ProtectedRoute>} />
        <Route path="supervisor/students/:id/logs" element={<ProtectedRoute roles={['supervisor']}><StudentLogs /></ProtectedRoute>} />
        <Route path="supervisor/logs/pending" element={<ProtectedRoute roles={['supervisor']}><PendingLogs /></ProtectedRoute>} />
        <Route path="supervisor/logs/:id" element={<ProtectedRoute roles={['supervisor']}><SupervisorViewLog /></ProtectedRoute>} />
        <Route path="supervisor/evaluations" element={<ProtectedRoute roles={['supervisor']}><SupervisorEvaluations /></ProtectedRoute>} />
        <Route path="supervisor/evaluate" element={<ProtectedRoute roles={['supervisor']}><EvaluateStudent /></ProtectedRoute>} />
        <Route path="supervisor/evaluate/:studentId" element={<ProtectedRoute roles={['supervisor']}><EvaluateStudent /></ProtectedRoute>} />
        <Route path="supervisor/attendance" element={<ProtectedRoute roles={['supervisor']}><AttendanceReport /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
