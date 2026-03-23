import { useState, useEffect } from 'react';
import { BookOpen, Calendar, FileText, MessageSquare } from 'lucide-react';
import api from '../../api';
import GradeCell from '../../components/GradeCell';
import { useAuth } from '../../hooks/useAuth';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, meRes] = await Promise.all([
          api.get('/api/students/me/dashboard').catch(() => ({ data: {} })),
          api.get('/api/auth/me').catch(() => ({ data: null })),
        ]);
        setStats(dashRes.data);

        const studentsRes = await api.get('/api/students', { params: { search: meRes.data?.last_name } }).catch(() => ({ data: [] }));
        const myStudent = (studentsRes.data || []).find((s: any) => s.user_id === meRes.data?.id);

        if (myStudent) {
          const [schedRes, gradesRes] = await Promise.all([
            api.get('/api/schedule', { params: { group_id: myStudent.group_id } }).catch(() => ({ data: [] })),
            api.get(`/api/students/${myStudent.id}/grades`).catch(() => ({ data: [] })),
          ]);
          const today = new Date().getDay() || 7;
          setSchedule(
            (schedRes.data || [])
              .filter((s: any) => s.day_of_week === today)
              .sort((a: any, b: any) => a.lesson_number - b.lesson_number)
              .slice(0, 8)
          );
          setGrades((gradesRes.data || []).slice(0, 5));
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-btn" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 skeleton h-64 rounded-btn" />
          <div className="lg:col-span-2 skeleton h-64 rounded-btn" />
        </div>
      </div>
    );
  }

  const statTiles = [
    { label: 'Средний балл', value: stats?.avg_grade?.toFixed(2) || '—', icon: <BookOpen size={16} /> },
    { label: 'Пропусков за месяц', value: stats?.absences_month ?? 0, icon: <Calendar size={16} /> },
    { label: 'Заданий к сдаче', value: stats?.assignments_due ?? 0, icon: <FileText size={16} /> },
    { label: 'Новых сообщений', value: stats?.new_messages ?? 0, icon: <MessageSquare size={16} /> },
  ];

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-6">Панель студента</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statTiles.map((tile, idx) => (
          <div key={idx} className="bg-bg-surface border border-border rounded-btn p-4">
            <div className="flex items-center gap-2 text-text-secondary mb-2">
              {tile.icon}
              <span className="text-xs">{tile.label}</span>
            </div>
            <div className="text-2xl font-semibold text-text-primary">{tile.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-bg-surface border border-border rounded-btn p-4">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Расписание на сегодня</h2>
          {schedule.length === 0 ? (
            <div className="text-sm text-text-secondary py-4">Сегодня нет занятий</div>
          ) : (
            <div className="space-y-0">
              {schedule.map((slot: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-8 text-center">
                    <div className="text-sm font-medium text-text-primary">{slot.lesson_number}</div>
                  </div>
                  <div className="text-xs text-text-secondary w-24">
                    {slot.start_time?.slice(0, 5)}–{slot.end_time?.slice(0, 5)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary">{slot.tsg?.subject?.name || '—'}</div>
                    <div className="text-xs text-text-secondary">
                      {slot.tsg?.teacher?.user?.last_name} {slot.tsg?.teacher?.user?.first_name?.[0]}.
                      {slot.room && ` | ауд. ${slot.room}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-bg-surface border border-border rounded-btn p-4">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Последние оценки</h2>
            {grades.length === 0 ? (
              <div className="text-sm text-text-secondary py-4">Нет оценок</div>
            ) : (
              <div className="space-y-0">
                {grades.map((g: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <div className="text-sm text-text-primary">{g.subject?.name || '—'}</div>
                      <div className="text-[11px] text-text-secondary">{g.grade_date}</div>
                    </div>
                    <GradeCell value={g.value} small />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
