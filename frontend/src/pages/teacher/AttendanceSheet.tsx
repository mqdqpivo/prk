import { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';
import api from '../../api';
import AttendanceMark from '../../components/AttendanceMark';

const STATUSES = [
  { value: 'present', label: 'Присутствует' },
  { value: 'absent', label: 'Отсутствует' },
  { value: 'late', label: 'Опоздал' },
  { value: 'excused', label: 'Уважительная' },
];

export default function TeacherAttendanceSheet() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<Record<number, string>>({});
  const [slots, setSlots] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/teachers/me/groups').then(r => {
      setGroups(r.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      api.get('/api/teachers/me/schedule').then(r => {
        const mySlots = (r.data || []).filter((s: any) =>
          String(s.tsg?.group?.id) === selectedGroup
        );
        setSlots(mySlots);
      }).catch(() => {});

      api.get('/api/students', { params: { group_id: selectedGroup } }).then(r => {
        setStudents(r.data || []);
        const initial: Record<number, string> = {};
        (r.data || []).forEach((s: any) => { initial[s.id] = 'present'; });
        setRecords(initial);
      }).catch(() => {});
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedSlot && selectedDate) {
      api.get(`/api/teachers/me/attendance/${selectedSlot}/${selectedDate}`).then(r => {
        const existing = r.data || [];
        if (existing.length > 0) {
          const map: Record<number, string> = {};
          existing.forEach((a: any) => { map[a.student_id] = a.status; });
          setRecords(prev => ({ ...prev, ...map }));
        }
      }).catch(() => {});
    }
  }, [selectedSlot, selectedDate]);

  const handleSave = async () => {
    if (!selectedSlot || !selectedDate) return;
    setSaving(true);
    setSaved(false);
    try {
      await api.post('/api/teachers/me/attendance', {
        schedule_slot_id: Number(selectedSlot),
        lesson_date: selectedDate,
        records: Object.entries(records).map(([studentId, status]) => ({
          student_id: Number(studentId),
          schedule_slot_id: Number(selectedSlot),
          lesson_date: selectedDate,
          status,
        })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const uniqueGroups = [...new Map(groups.map((g: any) => [g.group_id, g.group])).values()];

  if (loading) return <div className="skeleton h-64 rounded-btn" />;

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная / Посещаемость</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-6">Посещаемость</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={selectedGroup} onChange={e => { setSelectedGroup(e.target.value); setSelectedSlot(''); }} className="px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface focus:outline-none focus:border-accent">
          <option value="">Группа</option>
          {uniqueGroups.map((g: any) => <option key={g?.id} value={g?.id}>{g?.name}</option>)}
        </select>
        <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} className="px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface focus:outline-none focus:border-accent">
          <option value="">Занятие</option>
          {slots.map((s: any) => (
            <option key={s.id} value={s.id}>
              {['Пн','Вт','Ср','Чт','Пт','Сб'][s.day_of_week - 1]} пара {s.lesson_number} — {s.tsg?.subject?.name || ''}
            </option>
          ))}
        </select>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface focus:outline-none focus:border-accent" />
      </div>

      {students.length > 0 && selectedSlot && (
        <>
          <div className="bg-bg-surface border border-border rounded-btn overflow-hidden mb-4">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4 w-8">#</th>
                <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Студент</th>
                <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Статус</th>
              </tr></thead>
              <tbody>
                {students.map((s: any, idx: number) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-bg-subtle">
                    <td className="py-2.5 px-4 text-sm text-text-secondary">{idx + 1}</td>
                    <td className="py-2.5 px-4 text-sm">{s.user?.last_name} {s.user?.first_name} {s.user?.middle_name || ''}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex gap-1">
                        {STATUSES.map(st => (
                          <button
                            key={st.value}
                            onClick={() => setRecords(prev => ({ ...prev, [s.id]: st.value }))}
                            className={`px-2 py-1 text-xs rounded-btn border transition-colors ${records[s.id] === st.value ? 'bg-accent text-white border-accent' : 'border-border text-text-secondary hover:bg-bg-subtle'}`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-btn text-sm hover:bg-accent/90 transition-colors disabled:opacity-50">
            {saved ? <><Check size={16} /> Сохранено</> : <><Save size={16} /> {saving ? 'Сохранение...' : 'Сохранить'}</>}
          </button>
        </>
      )}

      {(!selectedGroup || !selectedSlot) && students.length === 0 && (
        <div className="bg-bg-surface border border-border rounded-btn p-8 text-center text-sm text-text-secondary">
          Выберите группу, занятие и дату для отметки посещаемости
        </div>
      )}
    </div>
  );
}
