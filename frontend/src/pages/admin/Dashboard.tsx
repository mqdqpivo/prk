import { useState, useEffect } from 'react';
import api from '../../api';
import { Users, BookOpen, GraduationCap, Layers } from 'lucide-react';

interface Stats {
  users_total: number;
  students: number;
  teachers: number;
  groups: number;
  subjects: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/users', { params: { size: 1 } }).catch(() => ({ data: { total: 0 } })),
      api.get('/api/users', { params: { role: 'student', size: 1 } }).catch(() => ({ data: { total: 0 } })),
      api.get('/api/users', { params: { role: 'teacher', size: 1 } }).catch(() => ({ data: { total: 0 } })),
      api.get('/api/groups').catch(() => ({ data: [] })),
      api.get('/api/subjects').catch(() => ({ data: [] })),
    ]).then(([usersRes, studRes, teachRes, groupsRes, subjRes]) => {
      setStats({
        users_total: usersRes.data.total || 0,
        students: studRes.data.total || 0,
        teachers: teachRes.data.total || 0,
        groups: (groupsRes.data || []).length,
        subjects: (subjRes.data || []).length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Пользователей', value: stats.users_total, icon: <Users size={20} />, color: 'text-accent' },
        { label: 'Студентов', value: stats.students, icon: <GraduationCap size={20} />, color: 'text-success' },
        { label: 'Преподавателей', value: stats.teachers, icon: <Users size={20} />, color: 'text-warning' },
        { label: 'Групп', value: stats.groups, icon: <Layers size={20} />, color: 'text-info' },
        { label: 'Предметов', value: stats.subjects, icon: <BookOpen size={20} />, color: 'text-danger' },
      ]
    : [];

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-6">Панель администратора</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-bg-surface border border-border rounded-card p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-bg-surface border border-border rounded-card p-4 flex items-center gap-4">
              <div className={`p-2 rounded-btn bg-bg-subtle ${c.color}`}>{c.icon}</div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{c.value}</div>
                <div className="text-sm text-text-secondary">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
