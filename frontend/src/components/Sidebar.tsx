import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Calendar, ClipboardCheck, FileText,
  MessageSquare, Users, Settings, Bell, ChevronLeft, Menu,
  GraduationCap, BarChart3, Megaphone, UserCog, Building2
} from 'lucide-react';
import { UserData } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

interface SidebarProps {
  user: UserData;
  onLogout: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const studentNav: NavItem[] = [
  { label: 'Главная', path: '/student', icon: <LayoutDashboard size={16} /> },
  { label: 'Оценки', path: '/student/grades', icon: <BookOpen size={16} /> },
  { label: 'Расписание', path: '/student/schedule', icon: <Calendar size={16} /> },
  { label: 'Посещаемость', path: '/student/attendance', icon: <ClipboardCheck size={16} /> },
  { label: 'Задания', path: '/student/assignments', icon: <FileText size={16} /> },
];

const parentNav: NavItem[] = [
  { label: 'Главная', path: '/parent', icon: <LayoutDashboard size={16} /> },
  { label: 'Успеваемость', path: '/parent/grades', icon: <BookOpen size={16} /> },
  { label: 'Посещаемость', path: '/parent/attendance', icon: <ClipboardCheck size={16} /> },
  { label: 'Объявления', path: '/parent/announcements', icon: <Megaphone size={16} /> },
];

const teacherNav: NavItem[] = [
  { label: 'Главная', path: '/teacher', icon: <LayoutDashboard size={16} /> },
  { label: 'Журнал оценок', path: '/teacher/gradebook', icon: <BookOpen size={16} /> },
  { label: 'Расписание', path: '/teacher/schedule', icon: <Calendar size={16} /> },
  { label: 'Задания', path: '/teacher/assignments', icon: <FileText size={16} /> },
  { label: 'Посещаемость', path: '/teacher/attendance', icon: <ClipboardCheck size={16} /> },
  { label: 'Аналитика', path: '/teacher/analytics', icon: <BarChart3 size={16} /> },
];

const adminNav: NavItem[] = [
  { label: 'Главная', path: '/admin', icon: <LayoutDashboard size={16} /> },
  { label: 'Пользователи', path: '/admin/users', icon: <Users size={16} /> },
  { label: 'Группы', path: '/admin/groups', icon: <Building2 size={16} /> },
  { label: 'Предметы', path: '/admin/subjects', icon: <BookOpen size={16} /> },
  { label: 'Расписание', path: '/admin/schedule', icon: <Calendar size={16} /> },
  { label: 'Объявления', path: '/admin/announcements', icon: <Megaphone size={16} /> },
];

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'student': return studentNav;
    case 'parent': return parentNav;
    case 'teacher': return teacherNav;
    case 'admin':
    case 'dean': return adminNav;
    default: return [];
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'student': return 'Студент';
    case 'parent': return 'Родитель';
    case 'teacher': return 'Преподаватель';
    case 'admin': return 'Администратор';
    case 'dean': return 'Деканат';
    default: return role;
  }
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = getNavItems(user.role);

  const initials = `${(user.last_name || '')[0] || ''}${(user.first_name || '')[0] || ''}`;

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-bg-surface border border-border rounded-btn p-2"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-[240px] bg-bg-surface border-r border-border z-50 flex flex-col transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-accent" />
            <div>
              <div className="text-sm font-semibold text-text-primary">ИМСИТ</div>
              <div className="text-[11px] text-text-secondary">Электронный дневник</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-btn text-sm transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-text-secondary hover:bg-bg-subtle hover:text-text-primary'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary truncate">
                {user.last_name} {user.first_name}
              </div>
              <div className="text-[11px] text-text-secondary">{getRoleLabel(user.role)}</div>
            </div>
            <NotificationBell />
          </div>
          <button
            onClick={onLogout}
            className="w-full mt-2 text-xs text-text-secondary hover:text-danger transition-colors text-left px-1"
          >
            Выйти
          </button>
        </div>
      </aside>
    </>
  );
}
