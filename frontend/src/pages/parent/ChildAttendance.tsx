import { useState, useEffect } from 'react';
import api from '../../api';
import AttendanceMark from '../../components/AttendanceMark';

export default function ChildAttendance() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/parents/me/children').then(res => {
      const children = res.data || [];
      if (children.length > 0) {
        api.get(`/api/parents/me/child/${children[0].student_id}/attendance`).then(r => { setRecords(r.data || []); setLoading(false); });
      } else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-btn" />)}</div>;

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная / Посещаемость</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-6">Посещаемость ребёнка</h1>
      <div className="bg-bg-surface border border-border rounded-btn overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Дата</th>
            <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Статус</th>
          </tr></thead>
          <tbody>
            {records.slice(0, 50).map((r: any) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-bg-subtle">
                <td className="py-2.5 px-4 text-sm">{r.lesson_date}</td>
                <td className="py-2.5 px-4"><AttendanceMark status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
