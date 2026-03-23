import { useState, useEffect } from 'react';
import api from '../../api';
import { GradeLineChart, AttendanceBarChart, GradePieChart } from '../../components/Charts';

export default function TeacherAnalytics() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [performance, setPerformance] = useState<any[]>([]);
  const [dynamics, setDynamics] = useState<any[]>([]);

  useEffect(() => { api.get('/api/teachers/me/groups').then(r => setGroups(r.data || [])).catch(() => {}); }, []);

  useEffect(() => {
    if (selectedGroup) {
      api.get('/api/analytics/group-performance', { params: { group_id: selectedGroup } }).then(r => setPerformance(r.data || [])).catch(() => {});
      api.get('/api/analytics/grades-dynamics', { params: { group_id: selectedGroup } }).then(r => setDynamics(r.data || [])).catch(() => {});
    }
  }, [selectedGroup]);

  const uniqueGroups = [...new Map(groups.map((g: any) => [g.group_id, g.group])).values()];

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная / Аналитика</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-6">Аналитика</h1>
      <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface focus:outline-none focus:border-accent mb-6">
        <option value="">Выберите группу</option>
        {uniqueGroups.map((g: any) => <option key={g?.id} value={g?.id}>{g?.name}</option>)}
      </select>
      {selectedGroup && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-bg-surface border border-border rounded-btn p-4">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Средний балл студентов</h2>
            <AttendanceBarChart data={performance.map((p: any) => ({ name: p.name, value: p.avg_grade }))} color="#2563EB" horizontal />
          </div>
          <div className="bg-bg-surface border border-border rounded-btn p-4">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Динамика среднего балла</h2>
            <GradeLineChart data={dynamics} />
          </div>
        </div>
      )}
    </div>
  );
}
