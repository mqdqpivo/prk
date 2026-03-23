import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '../api';

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    api.get('/api/notifications', { params: { is_read: false, size: 1 } })
      .then(res => setCount(res.data.total || 0))
      .catch(() => {});

    const interval = setInterval(() => {
      api.get('/api/notifications', { params: { is_read: false, size: 1 } })
        .then(res => setCount(res.data.total || 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative cursor-pointer">
      <Bell size={16} className="text-text-secondary" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-danger text-white text-[9px] flex items-center justify-center rounded-full font-medium">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
  );
}
