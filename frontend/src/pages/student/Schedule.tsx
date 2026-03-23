import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api';
import ScheduleGrid from '../../components/ScheduleGrid';

export default function StudentSchedule() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentDay = new Date().getDay() || 7;

  useEffect(() => {
    api.get('/api/schedule').then(res => { setSlots(res.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-btn" />)}</div>;

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная / Расписание</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-6">Расписание</h1>
      <div className="bg-bg-surface border border-border rounded-btn p-4">
        <ScheduleGrid slots={slots} currentDay={currentDay} />
      </div>
    </div>
  );
}
