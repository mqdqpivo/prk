import { useState, useEffect } from 'react';
import api from '../../api';
import GradeCell from '../../components/GradeCell';
import { GradeLineChart } from '../../components/Charts';

export default function ParentDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [dynamics, setDynamics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/parents/me/dashboard').then(res => { setData(res.data || []); setLoading(false); }).catch(() => setLoading(false));
    api.get('/api/analytics/grades-dynamics').then(res => setDynamics(res.data || [])).catch(() => {});
  }, []);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-btn" />)}</div>;

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-6">Панель родителя</h1>
      {data.map((child: any, idx: number) => (
        <div key={idx} className="mb-6">
          <div className="bg-bg-surface border border-border rounded-btn p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center text-lg font-semibold">
                {(child.student?.user?.last_name || '')[0]}{(child.student?.user?.first_name || '')[0]}
              </div>
              <div>
                <div className="text-base font-semibold text-text-primary">{child.student?.user?.last_name} {child.student?.user?.first_name}</div>
                <div className="text-sm text-text-secondary">{child.student?.group?.name || ''} | {child.relation || ''}</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-bg-surface border border-border rounded-btn p-4">
              <div className="text-xs text-text-secondary mb-1">Средний балл</div>
              <div className="text-2xl font-semibold">{child.avg_grade?.toFixed(2) || '—'}</div>
            </div>
            <div className="bg-bg-surface border border-border rounded-btn p-4">
              <div className="text-xs text-text-secondary mb-1">Пропусков за месяц</div>
              <div className="text-2xl font-semibold text-danger">{child.absences_month || 0}</div>
            </div>
          </div>
        </div>
      ))}
      <div className="bg-bg-surface border border-border rounded-btn p-4">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Динамика среднего балла</h2>
        <GradeLineChart data={dynamics} />
      </div>
    </div>
  );
}
