import { useState, useEffect } from 'react';
import { Inbox } from 'lucide-react';
import api from '../../api';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/assignments').then(res => { setAssignments(res.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const statusLabel = (s: string) => {
    const m: Record<string, string> = { pending: 'Ожидает', submitted: 'Сдано', checked: 'Проверено', late: 'Просрочено' };
    return m[s] || s;
  };

  if (loading) return <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-btn" />)}</div>;

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная / Задания</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-6">Задания</h1>
      {assignments.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-text-secondary">
          <Inbox size={32} className="mb-2" />
          <span className="text-sm">Нет данных для отображения</span>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border rounded-btn overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Название</th>
              <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Предмет</th>
              <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Дедлайн</th>
              <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Макс. балл</th>
            </tr></thead>
            <tbody>
              {assignments.map((a: any) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-bg-subtle">
                  <td className="py-2.5 px-4 text-sm font-medium text-text-primary">{a.title}</td>
                  <td className="py-2.5 px-4 text-sm text-text-secondary">{a.tsg?.subject?.name || '—'}</td>
                  <td className="py-2.5 px-4 text-sm text-text-secondary">{a.due_date ? new Date(a.due_date).toLocaleDateString('ru-RU') : '—'}</td>
                  <td className="py-2.5 px-4 text-sm">{a.max_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
