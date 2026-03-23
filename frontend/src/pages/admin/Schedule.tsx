import { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Trash2 } from 'lucide-react';

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

export default function AdminSchedule() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/groups')
      .then((r) => setGroups(r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;
    setLoading(true);
    api.get('/api/schedule', { params: { group_id: selectedGroup } })
      .then((r) => setSchedule(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedGroup]);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить запись расписания?')) return;
    try {
      await api.delete(`/api/schedule/${id}`);
      setSchedule((prev) => prev.filter((s: any) => s.id !== id));
    } catch {
      alert('Ошибка удаления');
    }
  };

  const grouped = DAYS.map((day, idx) => ({
    day,
    entries: schedule.filter((s: any) => s.day_of_week === idx + 1),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">Расписание</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-btn text-sm hover:bg-accent/90 transition-colors">
          <Plus size={16} /> Добавить занятие
        </button>
      </div>

      <select
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
        className="mb-4 px-3 py-2 bg-bg-surface border border-border rounded-btn text-sm text-text-primary focus:outline-none focus:border-accent"
      >
        <option value="">Выберите группу</option>
        {groups.map((g: any) => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>

      {!selectedGroup ? (
        <div className="text-center text-text-secondary py-12">Выберите группу для просмотра расписания</div>
      ) : loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-bg-surface border border-border rounded-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ day, entries }) => (
            entries.length > 0 && (
              <div key={day} className="bg-bg-surface border border-border rounded-card overflow-hidden">
                <div className="px-4 py-2 bg-bg-subtle border-b border-border">
                  <h3 className="text-sm font-semibold text-text-primary">{day}</h3>
                </div>
                <div className="divide-y divide-border">
                  {entries.map((e: any) => (
                    <div key={e.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-text-secondary whitespace-nowrap">
                          {e.start_time?.slice(0, 5)} – {e.end_time?.slice(0, 5)}
                        </span>
                        <div>
                          <div className="text-sm text-text-primary font-medium">{e.tsg?.subject?.name || '—'}</div>
                          <div className="text-xs text-text-secondary">
                            {e.tsg?.teacher?.user?.last_name} {e.tsg?.teacher?.user?.first_name?.[0]}. · ауд. {e.room}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-1.5 rounded-btn hover:bg-bg-subtle text-text-secondary hover:text-danger transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
