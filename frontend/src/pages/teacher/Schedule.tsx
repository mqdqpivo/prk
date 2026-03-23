import { useState, useEffect } from 'react';
import api from '../../api';
import ScheduleGrid from '../../components/ScheduleGrid';

export default function TeacherSchedule() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/teachers/me/schedule').then(res => { setSlots(res.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton h-64 rounded-btn" />;

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная / Расписание</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-6">Моё расписание</h1>
      <div className="bg-bg-surface border border-border rounded-btn p-4">
        <ScheduleGrid slots={slots} currentDay={new Date().getDay() || 7} />
      </div>
    </div>
  );
}
