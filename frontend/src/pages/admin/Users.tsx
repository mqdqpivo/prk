import { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

interface User {
  id: number;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  is_active: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Студент',
  teacher: 'Преподаватель',
  parent: 'Родитель',
  admin: 'Администратор',
  dean: 'Деканат',
};

const emptyForm = { email: '', password: '', role: 'student', first_name: '', last_name: '', middle_name: '', phone: '' };

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    const params: any = { page, size: 20 };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    api.get('/api/users', { params })
      .then((r) => { setUsers(r.data.items || []); setTotal(r.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, [page, roleFilter]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); loadUsers(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!confirm('Деактивировать пользователя?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      loadUsers();
    } catch {
      alert('Ошибка');
    }
  };

  const openCreate = () => { setForm(emptyForm); setEditId(null); setModal('create'); };
  const openEdit = (u: User) => {
    setForm({ email: u.email, password: '', role: u.role, first_name: u.first_name || '', last_name: u.last_name || '', middle_name: u.middle_name || '', phone: '' });
    setEditId(u.id); setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.post('/api/users', form);
      } else if (modal === 'edit' && editId) {
        const { password, ...updateData } = form;
        await api.put(`/api/users/${editId}`, updateData);
      }
      setModal(null);
      loadUsers();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">Пользователи</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-btn text-sm hover:bg-accent/90 transition-colors">
          <Plus size={16} /> Добавить
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input type="text" placeholder="Поиск по имени или email..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-bg-surface border border-border rounded-btn text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-bg-surface border border-border rounded-btn text-sm text-text-primary focus:outline-none focus:border-accent">
          <option value="">Все роли</option>
          {Object.entries(ROLE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-bg-surface border border-border rounded-btn animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="bg-bg-surface border border-border rounded-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-subtle">
                  <th className="text-left px-4 py-3 text-text-secondary font-medium">ФИО</th>
                  <th className="text-left px-4 py-3 text-text-secondary font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-text-secondary font-medium">Роль</th>
                  <th className="text-center px-4 py-3 text-text-secondary font-medium">Статус</th>
                  <th className="text-right px-4 py-3 text-text-secondary font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-bg-subtle/50">
                    <td className="px-4 py-3 text-text-primary">{u.last_name} {u.first_name} {u.middle_name}</td>
                    <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-accent/10 text-accent">{ROLE_LABELS[u.role] || u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`w-2 h-2 rounded-full inline-block ${u.is_active ? 'bg-success' : 'bg-text-secondary'}`} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-btn hover:bg-bg-subtle text-text-secondary hover:text-accent transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-btn hover:bg-bg-subtle text-text-secondary hover:text-danger transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-text-secondary">Пользователи не найдены</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded-btn text-sm ${page === i + 1 ? 'bg-accent text-white' : 'bg-bg-surface border border-border text-text-secondary hover:bg-bg-subtle'}`}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-bg-surface border border-border rounded-card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">{modal === 'create' ? 'Новый пользователь' : 'Редактирование'}</h2>
              <button onClick={() => setModal(null)} className="text-text-secondary hover:text-text-primary"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Фамилия" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent" />
              <input placeholder="Имя" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent" />
              <input placeholder="Отчество" value={form.middle_name} onChange={e => setForm({...form, middle_name: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent" />
              <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent" />
              {modal === 'create' && (
                <input placeholder="Пароль" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent" />
              )}
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-bg-surface text-text-primary focus:outline-none focus:border-accent">
                {Object.entries(ROLE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
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
