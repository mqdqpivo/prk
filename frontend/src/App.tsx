import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';

import StudentDashboard from './pages/student/Dashboard';
import StudentGrades from './pages/student/Grades';
import StudentSchedule from './pages/student/Schedule';
import StudentAttendance from './pages/student/Attendance';
import StudentAssignments from './pages/student/Assignments';

import ParentDashboard from './pages/parent/Dashboard';
import ChildGrades from './pages/parent/ChildGrades';
import ChildAttendance from './pages/parent/ChildAttendance';
import ParentAnnouncements from './pages/parent/Announcements';

import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherGradeBook from './pages/teacher/GradeBook';
import TeacherSchedule from './pages/teacher/Schedule';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherAttendanceSheet from './pages/teacher/AttendanceSheet';
import TeacherAnalytics from './pages/teacher/Analytics';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminGroups from './pages/admin/Groups';
import AdminSubjects from './pages/admin/Subjects';
import AdminSchedule from './pages/admin/Schedule';
import AdminAnnouncements from './pages/admin/Announcements';

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}

function Layout() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar user={user} onLogout={logout} />
      <main className="lg:ml-[240px] p-6 pt-16 lg:pt-6">
        <Routes>
          {/* Студент */}
          <Route path="/student" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/grades" element={<PrivateRoute roles={['student']}><StudentGrades /></PrivateRoute>} />
          <Route path="/student/schedule" element={<PrivateRoute roles={['student']}><StudentSchedule /></PrivateRoute>} />
          <Route path="/student/attendance" element={<PrivateRoute roles={['student']}><StudentAttendance /></PrivateRoute>} />
          <Route path="/student/assignments" element={<PrivateRoute roles={['student']}><StudentAssignments /></PrivateRoute>} />

          {/* Родитель */}
          <Route path="/parent" element={<PrivateRoute roles={['parent']}><ParentDashboard /></PrivateRoute>} />
          <Route path="/parent/grades" element={<PrivateRoute roles={['parent']}><ChildGrades /></PrivateRoute>} />
          <Route path="/parent/attendance" element={<PrivateRoute roles={['parent']}><ChildAttendance /></PrivateRoute>} />
          <Route path="/parent/announcements" element={<PrivateRoute roles={['parent']}><ParentAnnouncements /></PrivateRoute>} />

          {/* Преподаватель */}
          <Route path="/teacher" element={<PrivateRoute roles={['teacher']}><TeacherDashboard /></PrivateRoute>} />
          <Route path="/teacher/gradebook" element={<PrivateRoute roles={['teacher']}><TeacherGradeBook /></PrivateRoute>} />
          <Route path="/teacher/schedule" element={<PrivateRoute roles={['teacher']}><TeacherSchedule /></PrivateRoute>} />
          <Route path="/teacher/assignments" element={<PrivateRoute roles={['teacher']}><TeacherAssignments /></PrivateRoute>} />
          <Route path="/teacher/attendance" element={<PrivateRoute roles={['teacher']}><TeacherAttendanceSheet /></PrivateRoute>} />
          <Route path="/teacher/analytics" element={<PrivateRoute roles={['teacher']}><TeacherAnalytics /></PrivateRoute>} />

          {/* Администратор / Деканат */}
          <Route path="/admin" element={<PrivateRoute roles={['admin', 'dean']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['admin', 'dean']}><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/groups" element={<PrivateRoute roles={['admin', 'dean']}><AdminGroups /></PrivateRoute>} />
          <Route path="/admin/subjects" element={<PrivateRoute roles={['admin', 'dean']}><AdminSubjects /></PrivateRoute>} />
          <Route path="/admin/schedule" element={<PrivateRoute roles={['admin', 'dean']}><AdminSchedule /></PrivateRoute>} />
          <Route path="/admin/announcements" element={<PrivateRoute roles={['admin', 'dean']}><AdminAnnouncements /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const { user, isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated && user
              ? <Navigate to={`/${user.role === 'dean' ? 'admin' : user.role}`} replace />
              : <Login />
          }
        />
        <Route
          path="/*"
          element={
            isAuthenticated
              ? <Layout />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
