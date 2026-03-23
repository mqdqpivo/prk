import { useState, useEffect } from 'react';
import api from '../../api';
import AttendanceMark from '../../components/AttendanceMark';

export default function StudentAttendance() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/attendance').then(res => { setRecords(res.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const total = records.length;
  const present = records.filter((r: any) => r.status === 'present').length;
  const absent = records.filter((r: any) => r.status === 'absent').length;
  const excused = records.filter((r: any) => r.status === 'excused').length;
  const pct = total ? Math.round((present / total) * 100) : 0;

  if (loading) return <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-btn" />)}</div>;

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная / Посещаемость</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-6">Посещаемость</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-bg-surface border border-border rounded-btn p-4">
          <div className="text-xs text-text-secondary mb-1">Посещаемость</div>
          <div className="text-2xl font-semibold text-text-primary">{pct}%</div>
        </div>
        <div className="bg-bg-surface border border-border rounded-btn p-4">
          <div className="text-xs text-text-secondary mb-1">Пропусков</div>
          <div className="text-2xl font-semibold text-danger">{absent}</div>
        </div>
        <div className="bg-bg-surface border border-border rounded-btn p-4">
          <div className="text-xs text-text-secondary mb-1">Уважительных</div>
          <div className="text-2xl font-semibold text-accent">{excused}</div>
        </div>
      </div>
      <div className="bg-bg-surface border border-border rounded-btn overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Дата</th>
            <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Предмет</th>
            <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Пара</th>
            <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Статус</th>
          </tr></thead>
          <tbody>
            {records.slice(0, 50).map((r: any) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-bg-subtle">
                <td className="py-2.5 px-4 text-sm">{r.lesson_date}</td>
                <td className="py-2.5 px-4 text-sm">{r.schedule_slot?.tsg?.subject?.name || '—'}</td>
                <td className="py-2.5 px-4 text-sm">{r.schedule_slot?.lesson_number || '—'}</td>
                <td className="py-2.5 px-4"><AttendanceMark status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
