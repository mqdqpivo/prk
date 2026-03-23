import { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Trash2, X } from 'lucide-react';

const emptyForm = { tsg_id: '', title: '', description: '', due_date: '', max_score: '100' };

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [tsgs, setTsgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/api/assignments').then(res => setAssignments(res.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get('/api/teachers/me/groups').then(r => setTsgs(r.data || [])).catch(() => {});
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить задание?')) return;
    try { await api.delete(`/api/assignments/${id}`); load(); } catch { alert('Ошибка'); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/api/assignments', {
        tsg_id: parseInt(form.tsg_id),
        title: form.title,
        description: form.description,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        max_score: parseInt(form.max_score) || 100,
      });
      setModal(false); setForm(emptyForm); load();
    } catch (e: any) { alert(e.response?.data?.detail || 'Ошибка создания'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-bg-surface border border-border rounded-btn animate-pulse" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-text-secondary mb-1">Главная / Задания</div>
          <h1 className="text-[22px] font-semibold text-text-primary">Задания</h1>
        </div>
        <button onClick={() => { setForm(emptyForm); setModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-btn text-sm hover:bg-accent/90 transition-colors">
          <Plus size={16} /> Новое задание
        </button>
      </div>
      <div className="bg-bg-surface border border-border rounded-btn overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-bg-subtle">
            <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Название</th>
            <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Предмет</th>
            <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Группа</th>
            <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-4">Дедлайн</th>
            <th className="text-right text-xs text-text-secondary font-medium py-2.5 px-4">Действия</th>
          </tr></thead>
          <tbody>
            {assignments.map((a: any) => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-bg-subtle/50">
                <td className="py-2.5 px-4 text-sm font-medium text-text-primary">{a.title}</td>
                <td className="py-2.5 px-4 text-sm text-text-secondary">{a.tsg?.subject?.name || '—'}</td>
                <td className="py-2.5 px-4 text-sm text-text-secondary">{a.tsg?.group?.name || '—'}</td>
                <td className="py-2.5 px-4 text-sm text-text-secondary">{a.due_date ? new Date(a.due_date).toLocaleDateString('ru-RU') : '—'}</td>
                <td className="py-2.5 px-4 text-right">
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-btn hover:bg-bg-subtle text-text-secondary hover:text-danger transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-text-secondary">Заданий пока нет</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-bg-surface border border-border rounded-card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Новое задание</h2>
              <button onClick={() => setModal(false)} className="text-text-secondary hover:text-text-primary"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <select value={form.tsg_id} onChange={e => setForm({...form, tsg_id: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent">
                <option value="">Выберите группу и предмет</option>
                {tsgs.map((t: any) => <option key={t.id} value={t.id}>{t.subject?.name || t.subject_id} — {t.group?.name || t.group_id}</option>)}
              </select>
              <input placeholder="Название задания" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent" />
              <textarea placeholder="Описание задания" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent resize-none" />
              <div className="flex gap-3">
                <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})}
                  className="flex-1 px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent" />
                <input type="number" placeholder="Макс. балл" value={form.max_score} onChange={e => setForm({...form, max_score: e.target.value})}
                  className="w-28 px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 border border-border rounded-btn text-sm text-text-secondary hover:bg-bg-subtle">Отмена</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-accent text-white rounded-btn text-sm hover:bg-accent/90 disabled:opacity-50">
                {saving ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
