import { useState, useEffect } from 'react';
import api from '../../api';
import GradeCell from '../../components/GradeCell';

export default function ChildGrades() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/parents/me/children').then(res => {
      const children = res.data || [];
      if (children.length > 0) {
        api.get(`/api/parents/me/child/${children[0].student_id}/grades`).then(r => { setGrades(r.data || []); setLoading(false); });
      } else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-btn" />)}</div>;

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная / Успеваемость</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-6">Успеваемость ребёнка</h1>
      <div className="bg-bg-surface border border-border rounded-btn overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Дата</th>
            <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Предмет</th>
            <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Оценка</th>
            <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Комментарий</th>
          </tr></thead>
          <tbody>
            {grades.map((g: any) => (
              <tr key={g.id} className="border-b border-border last:border-0 hover:bg-bg-subtle">
                <td className="py-2.5 px-4 text-sm">{g.grade_date}</td>
                <td className="py-2.5 px-4 text-sm">{g.subject?.name || '—'}</td>
                <td className="py-2.5 px-4"><GradeCell value={g.value} /></td>
                <td className="py-2.5 px-4 text-sm text-text-secondary">{g.comment || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
