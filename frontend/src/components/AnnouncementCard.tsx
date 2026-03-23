import { Pin } from 'lucide-react';

interface AnnouncementCardProps {
  title: string;
  content: string;
  author?: string;
  date?: string;
  isPinned?: boolean;
  targetRole?: string;
}

export default function AnnouncementCard({ title, content, author, date, isPinned, targetRole }: AnnouncementCardProps) {
  return (
    <div className={`border border-border rounded-btn p-4 ${isPinned ? 'bg-[#FFFBEB]' : 'bg-bg-surface'}`}>
      <div className="flex items-start gap-2">
        {isPinned && <Pin size={14} className="text-warning mt-0.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            {targetRole && targetRole !== 'all' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-bg-subtle rounded text-text-secondary">
                {targetRole === 'student' ? 'Студентам' : targetRole === 'parent' ? 'Родителям' : 'Преподавателям'}
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary line-clamp-3">{content}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-text-secondary">
            {author && <span>{author}</span>}
            {date && <span>{new Date(date).toLocaleDateString('ru-RU')}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
