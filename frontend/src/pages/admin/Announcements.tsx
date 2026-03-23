import { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  author?: { last_name?: string; first_name?: string };
  target_role: string;
  target_group_id?: number;
  is_pinned: boolean;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Студенты',
  teacher: 'Преподаватели',
  parent: 'Родители',
  all: 'Все',
};

const emptyForm = { title: '', content: '', target_role: 'all', is_pinned: false };

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/api/announcements').then(r => setAnnouncements(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить объявление?')) return;
    try { await api.delete(`/api/announcements/${id}`); load(); } catch { alert('Ошибка удаления'); }
  };

  const openCreate = () => { setForm(emptyForm); setEditId(null); setModal('create'); };
  const openEdit = (a: Announcement) => {
    setForm({ title: a.title, content: a.content, target_role: a.target_role, is_pinned: a.is_pinned });
    setEditId(a.id); setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') { await api.post('/api/announcements', form); }
      else if (editId) { await api.put(`/api/announcements/${editId}`, form); }
      setModal(null); load();
    } catch (e: any) { alert(e.response?.data?.detail || 'Ошибка сохранения'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">Объявления</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-btn text-sm hover:bg-accent/90 transition-colors">
          <Plus size={16} /> Новое объявление
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-bg-surface border border-border rounded-card animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="bg-bg-surface border border-border rounded-card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{a.title}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {a.author?.last_name} {a.author?.first_name} · {new Date(a.created_at).toLocaleDateString('ru-RU')}
                    {a.is_pinned && <span className="ml-2 text-accent">📌</span>}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded-btn hover:bg-bg-subtle text-text-secondary hover:text-accent transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-btn hover:bg-bg-subtle text-text-secondary hover:text-danger transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-sm text-text-secondary line-clamp-2">{a.content}</p>
              <div className="flex gap-1 mt-2">
                <span className="px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-full">{ROLE_LABELS[a.target_role] || a.target_role}</span>
              </div>
            </div>
          ))}
          {announcements.length === 0 && <div className="text-center text-text-secondary py-8">Объявлений нет</div>}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-bg-surface border border-border rounded-card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">{modal === 'create' ? 'Новое объявление' : 'Редактирование'}</h2>
              <button onClick={() => setModal(null)} className="text-text-secondary hover:text-text-primary"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Заголовок" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent" />
              <textarea placeholder="Текст объявления" rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent resize-none" />
              <select value={form.target_role} onChange={e => setForm({...form, target_role: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent">
                {Object.entries(ROLE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" checked={form.is_pinned} onChange={e => setForm({...form, is_pinned: e.target.checked})} className="rounded" />
                Закрепить объявление
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2 border border-border rounded-btn text-sm text-text-secondary hover:bg-bg-subtle">Отмена</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-accent text-white rounded-btn text-sm hover:bg-accent/90 disabled:opacity-50">
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
