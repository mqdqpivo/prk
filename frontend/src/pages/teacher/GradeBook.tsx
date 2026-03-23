import { useState, useEffect } from 'react';
import api from '../../api';
import GradeCell from '../../components/GradeCell';

export default function TeacherGradeBook() {
  const [groups, setGroups] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/api/teachers/me/groups').then(r => { setGroups(r.data || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  useEffect(() => {
    if (selectedGroup && selectedSubject) {
      api.get('/api/teachers/me/gradebook', { params: { group_id: selectedGroup, subject_id: selectedSubject } }).then(r => setGrades(r.data || [])).catch(() => {});
    }
  }, [selectedGroup, selectedSubject]);

  const uniqueGroups = [...new Map(groups.map((g: any) => [g.group_id, g.group])).values()];
  const filteredSubjects = groups.filter((g: any) => String(g.group_id) === selectedGroup).map((g: any) => g.subject);

  if (loading) return <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-btn" />)}</div>;

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная / Журнал оценок</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-6">Журнал оценок</h1>
      <div className="flex gap-3 mb-4">
        <select value={selectedGroup} onChange={e => { setSelectedGroup(e.target.value); setSelectedSubject(''); }} className="px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface focus:outline-none focus:border-accent">
          <option value="">Выберите группу</option>
          {uniqueGroups.map((g: any) => <option key={g?.id} value={g?.id}>{g?.name}</option>)}
        </select>
        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface focus:outline-none focus:border-accent">
          <option value="">Выберите предмет</option>
          {filteredSubjects.map((s: any) => <option key={s?.id} value={s?.id}>{s?.name}</option>)}
        </select>
      </div>
      {grades.length > 0 && (
        <div className="bg-bg-surface border border-border rounded-btn overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Студент</th>
              <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Дата</th>
              <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Тип</th>
              <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Оценка</th>
              <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Комментарий</th>
            </tr></thead>
            <tbody>
              {grades.map((g: any) => (
                <tr key={g.id} className="border-b border-border last:border-0 hover:bg-bg-subtle">
                  <td className="py-2.5 px-4 text-sm">{g.student?.user?.last_name} {g.student?.user?.first_name}</td>
                  <td className="py-2.5 px-4 text-sm">{g.grade_date}</td>
                  <td className="py-2.5 px-4 text-sm text-text-secondary">{g.grade_type}</td>
                  <td className="py-2.5 px-4"><GradeCell value={g.value} /></td>
                  <td className="py-2.5 px-4 text-sm text-text-secondary">{g.comment || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
