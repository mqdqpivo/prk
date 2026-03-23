import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api';
import GradeCell from '../../components/GradeCell';
import { GradeLineChart } from '../../components/Charts';

export default function StudentGrades() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [dynamics, setDynamics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const activeSubject = searchParams.get('subject_id') || '';

  useEffect(() => {
    api.get('/api/subjects').then(res => setSubjects(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (activeSubject) params.subject_id = activeSubject;
    Promise.all([
      api.get('/api/grades', { params }).catch(() => ({ data: [] })),
      api.get('/api/analytics/grades-dynamics', { params }).catch(() => ({ data: [] })),
    ]).then(([gradesRes, dynRes]) => {
      setGrades(gradesRes.data || []);
      setDynamics(dynRes.data || []);
      setLoading(false);
    });
  }, [activeSubject]);

  const gradeTypeLabel = (t: string) => {
    const map: Record<string, string> = { current: 'Текущая', midterm: 'Промежуточная', exam: 'Экзамен', assignment: 'Задание', attendance_bonus: 'Бонус' };
    return map[t] || t;
  };

  const avg = grades.length ? (grades.reduce((s: number, g: any) => s + (g.value || 0), 0) / grades.length) : null;

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная / Оценки</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-6">Оценки</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setSearchParams({})} className={`px-3 py-1.5 text-sm rounded-btn border transition-colors ${!activeSubject ? 'bg-accent text-white border-accent' : 'border-border text-text-secondary hover:bg-bg-subtle'}`}>Все</button>
        {subjects.slice(0, 10).map((s: any) => (
          <button key={s.id} onClick={() => setSearchParams({ subject_id: s.id })} className={`px-3 py-1.5 text-sm rounded-btn border transition-colors ${activeSubject === String(s.id) ? 'bg-accent text-white border-accent' : 'border-border text-text-secondary hover:bg-bg-subtle'}`}>{s.short_name || s.name}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-10 rounded-btn" />)}</div>
      ) : (
        <>
          <div className="bg-bg-surface border border-border rounded-btn overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Дата</th>
                  <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Предмет</th>
                  <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Тип</th>
                  <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Оценка</th>
                  <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g: any) => (
                  <tr key={g.id} className="border-b border-border last:border-0 hover:bg-bg-subtle">
                    <td className="py-2.5 px-4 text-sm">{g.grade_date}</td>
                    <td className="py-2.5 px-4 text-sm">{g.subject?.name || '—'}</td>
                    <td className="py-2.5 px-4 text-sm text-text-secondary">{gradeTypeLabel(g.grade_type)}</td>
                    <td className="py-2.5 px-4"><GradeCell value={g.value} /></td>
                    <td className="py-2.5 px-4 text-sm text-text-secondary">{g.comment || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {avg !== null && (
              <div className="border-t border-border px-4 py-2.5 flex items-center gap-2 bg-bg-subtle">
                <span className="text-sm text-text-secondary">Средний балл:</span>
                <GradeCell value={Math.round(avg * 100) / 100} />
              </div>
            )}
          </div>

          <div className="bg-bg-surface border border-border rounded-btn p-4">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Динамика среднего балла</h2>
            <GradeLineChart data={dynamics} />
          </div>
        </>
      )}
    </div>
  );
}
