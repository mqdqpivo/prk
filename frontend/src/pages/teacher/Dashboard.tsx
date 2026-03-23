import { useState, useEffect } from 'react';
import api from '../../api';

export default function TeacherDashboard() {
  const [groups, setGroups] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/teachers/me/groups').catch(() => ({ data: [] })),
      api.get('/api/teachers/me/schedule').catch(() => ({ data: [] })),
    ]).then(([g, s]) => { setGroups(g.data || []); setSchedule(s.data || []); setLoading(false); });
  }, []);

  const today = new Date().getDay() || 7;
  const todaySlots = schedule.filter((s: any) => s.day_of_week === today).sort((a: any, b: any) => a.lesson_number - b.lesson_number);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-btn" />)}</div>;

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-6">Панель преподавателя</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-bg-surface border border-border rounded-btn p-4">
          <div className="text-xs text-text-secondary mb-1">Пар сегодня</div>
          <div className="text-2xl font-semibold">{todaySlots.length}</div>
        </div>
        <div className="bg-bg-surface border border-border rounded-btn p-4">
          <div className="text-xs text-text-secondary mb-1">Моих групп</div>
          <div className="text-2xl font-semibold">{new Set(groups.map((g: any) => g.group_id)).size}</div>
        </div>
        <div className="bg-bg-surface border border-border rounded-btn p-4">
          <div className="text-xs text-text-secondary mb-1">Предметов</div>
          <div className="text-2xl font-semibold">{new Set(groups.map((g: any) => g.subject_id)).size}</div>
        </div>
      </div>
      <div className="bg-bg-surface border border-border rounded-btn p-4 mb-6">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Расписание на сегодня</h2>
        {todaySlots.length === 0 ? <div className="text-sm text-text-secondary">Сегодня нет занятий</div> : (
          <div className="space-y-0">
            {todaySlots.map((slot: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="w-8 text-center text-sm font-medium">{slot.lesson_number}</div>
                <div className="text-xs text-text-secondary w-24">{slot.start_time?.slice(0, 5)}–{slot.end_time?.slice(0, 5)}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{slot.tsg?.subject?.name || '—'}</div>
                  <div className="text-xs text-text-secondary">{slot.tsg?.group?.name || ''}{slot.room ? ` | ауд. ${slot.room}` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-bg-surface border border-border rounded-btn p-4">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Мои группы</h2>
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="text-left text-xs text-text-secondary font-medium py-2 px-3">Группа</th>
            <th className="text-left text-xs text-text-secondary font-medium py-2 px-3">Предмет</th>
          </tr></thead>
          <tbody>
            {groups.map((g: any) => (
              <tr key={g.id} className="border-b border-border last:border-0">
                <td className="py-2 px-3 text-sm">{g.group?.name || '—'}</td>
                <td className="py-2 px-3 text-sm">{g.subject?.name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
