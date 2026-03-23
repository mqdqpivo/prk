import { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

interface Subject {
  id: number;
  name: string;
  short_name: string;
  semester: number;
  hours_total: number;
  hours_lectures: number;
  hours_practice: number;
}

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/subjects')
      .then((r) => setSubjects(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = subjects.filter(
    (s) => !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить предмет?')) return;
    try {
      await api.delete(`/api/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert('Ошибка удаления');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">Предметы</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-btn text-sm hover:bg-accent/90 transition-colors">
          <Plus size={16} /> Добавить предмет
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder="Поиск предмета..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-bg-surface border border-border rounded-btn text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-bg-surface border border-border rounded-btn animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-bg-surface border border-border rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-subtle">
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Предмет</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Сокр.</th>
                <th className="text-center px-4 py-3 text-text-secondary font-medium">Семестр</th>
                <th className="text-center px-4 py-3 text-text-secondary font-medium">Часы</th>
                <th className="text-right px-4 py-3 text-text-secondary font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-bg-subtle/50">
                  <td className="px-4 py-3 text-text-primary font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{s.short_name}</td>
                  <td className="px-4 py-3 text-center text-text-secondary">{s.semester}</td>
                  <td className="px-4 py-3 text-center text-text-secondary">{s.hours_total}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded-btn hover:bg-bg-subtle text-text-secondary hover:text-accent transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-btn hover:bg-bg-subtle text-text-secondary hover:text-danger transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                    Предметы не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
