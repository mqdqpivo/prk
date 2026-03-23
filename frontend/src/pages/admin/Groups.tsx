import { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Edit2, Trash2, Users, X } from 'lucide-react';

interface Group {
  id: number;
  name: string;
  specialty_id: number;
  year_start: number;
  specialty?: { name?: string; short_code?: string };
}

interface Specialty { id: number; name: string; short_code: string; }

const emptyForm = { name: '', specialty_id: '', year_start: new Date().getFullYear().toString() };

export default function AdminGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const loadGroups = () => {
    setLoading(true);
    api.get('/api/groups').then(r => setGroups(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGroups();
    api.get('/api/subjects').catch(() => {});
    api.get('/api/groups').then(r => {
      const specIds = new Set((r.data || []).map((g: any) => g.specialty_id));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/api/admin/specialties').then(r => setSpecialties(r.data || [])).catch(() => {
      const uniqueSpecs: Specialty[] = [];
      const seen = new Set<number>();
      groups.forEach(g => {
        if (g.specialty_id && !seen.has(g.specialty_id) && g.specialty) {
          seen.add(g.specialty_id);
          uniqueSpecs.push({ id: g.specialty_id, name: g.specialty.name || '', short_code: g.specialty.short_code || '' });
        }
      });
      setSpecialties(uniqueSpecs);
    });
  }, [groups]);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить группу?')) return;
    try { await api.delete(`/api/groups/${id}`); loadGroups(); } catch { alert('Ошибка удаления'); }
  };

  const openCreate = () => { setForm(emptyForm); setEditId(null); setModal('create'); };
  const openEdit = (g: Group) => {
    setForm({ name: g.name, specialty_id: g.specialty_id.toString(), year_start: g.year_start.toString() });
    setEditId(g.id); setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { name: form.name, specialty_id: parseInt(form.specialty_id), year_start: parseInt(form.year_start) };
      if (modal === 'create') { await api.post('/api/groups', payload); }
      else if (editId) { await api.put(`/api/groups/${editId}`, payload); }
      setModal(null); loadGroups();
    } catch (e: any) { alert(e.response?.data?.detail || 'Ошибка сохранения'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">Группы</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-btn text-sm hover:bg-accent/90 transition-colors">
          <Plus size={16} /> Добавить группу
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-bg-surface border border-border rounded-card animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <div key={g.id} className="bg-bg-surface border border-border rounded-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">{g.name}</h3>
                  <p className="text-xs text-text-secondary">{g.specialty?.name || ''}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(g)} className="p-1.5 rounded-btn hover:bg-bg-subtle text-text-secondary hover:text-accent transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded-btn hover:bg-bg-subtle text-text-secondary hover:text-danger transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{g.year_start} год</span>
              </div>
            </div>
          ))}
          {groups.length === 0 && <div className="col-span-full text-center text-text-secondary py-8">Группы не найдены</div>}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-bg-surface border border-border rounded-card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">{modal === 'create' ? 'Новая группа' : 'Редактирование группы'}</h2>
              <button onClick={() => setModal(null)} className="text-text-secondary hover:text-text-primary"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Название группы" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent" />
              <select value={form.specialty_id} onChange={e => setForm({...form, specialty_id: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent">
                <option value="">Выберите специальность</option>
                {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input placeholder="Год поступления" type="number" value={form.year_start} onChange={e => setForm({...form, year_start: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent" />
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
