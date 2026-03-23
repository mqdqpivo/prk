import { useState, useEffect } from 'react';
import api from '../../api';
import AnnouncementCard from '../../components/AnnouncementCard';

export default function ParentAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/announcements').then(res => { setAnnouncements(res.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-btn" />)}</div>;

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная / Объявления</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-6">Объявления</h1>
      <div className="space-y-3">
        {announcements.map((a: any) => (
          <AnnouncementCard key={a.id} title={a.title} content={a.content} author={a.author ? `${a.author.last_name} ${a.author.first_name}` : ''} date={a.created_at} isPinned={a.is_pinned} targetRole={a.target_role} />
        ))}
        {announcements.length === 0 && <div className="text-sm text-text-secondary py-8 text-center">Нет объявлений</div>}
      </div>
    </div>
  );
}
