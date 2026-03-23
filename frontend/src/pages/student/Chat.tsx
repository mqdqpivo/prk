import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import api from '../../api';
import { useWebSocket } from '../../hooks/useWebSocket';

export default function StudentChat() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const { send } = useWebSocket('/ws/chat', (data: any) => {
    if (data.type === 'new_message' && activeUser && data.message?.sender_id === activeUser.id) {
      setMessages(prev => [...prev, data.message]);
    }
  });

  useEffect(() => {
    api.get('/api/chat/conversations').then(res => setConversations(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeUser) {
      api.get(`/api/chat/messages/${activeUser.id}`).then(res => setMessages(res.data || [])).catch(() => {});
    }
  }, [activeUser]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !activeUser) return;
    try {
      const res = await api.post('/api/chat/messages', { receiver_id: activeUser.id, content: text });
      setMessages(prev => [...prev, res.data]);
      setText('');
    } catch {}
  };

  return (
    <div>
      <div className="text-xs text-text-secondary mb-1">Главная / Чат</div>
      <h1 className="text-[22px] font-semibold text-text-primary mb-4">Чат</h1>
      <div className="flex bg-bg-surface border border-border rounded-btn overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="w-[300px] border-r border-border overflow-y-auto flex-shrink-0">
          {conversations.length === 0 && <div className="p-4 text-sm text-text-secondary">Нет диалогов</div>}
          {conversations.map((c: any, idx: number) => (
            <div key={idx} onClick={() => setActiveUser(c.user)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-border hover:bg-bg-subtle ${activeUser?.id === c.user?.id ? 'bg-bg-subtle' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {(c.user?.last_name || '')[0]}{(c.user?.first_name || '')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">{c.user?.last_name} {c.user?.first_name}</div>
                <div className="text-[11px] text-text-secondary truncate">{c.last_message?.content || ''}</div>
              </div>
              {c.unread_count > 0 && <span className="w-5 h-5 bg-accent text-white text-[10px] flex items-center justify-center rounded-full">{c.unread_count}</span>}
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          {!activeUser ? (
            <div className="flex-1 flex items-center justify-center text-sm text-text-secondary">Выберите диалог</div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border">
                <div className="text-sm font-medium">{activeUser.last_name} {activeUser.first_name}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg: any, idx: number) => {
                  const isMine = msg.sender_id === currentUser.id;
                  return (
                    <div key={msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-3 py-2 rounded-btn text-sm ${isMine ? 'bg-accent text-white' : 'bg-bg-subtle text-text-primary'}`}>
                        {msg.content}
                        <div className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-text-secondary'}`}>
                          {msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="px-4 py-3 border-t border-border flex gap-2">
                <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Введите сообщение..." className="flex-1 px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:border-accent" />
                <button onClick={handleSend} className="px-3 py-2 bg-accent text-white rounded-btn hover:bg-accent/90 transition-colors"><Send size={16} /></button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
