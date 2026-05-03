import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { Send, MessageSquare, Loader2 } from 'lucide-react';

const STYLES = {
  customer: {
    sendBtn: 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200',
    myBubble: 'bg-blue-500 text-white',
    myTime: 'text-white/60',
    ring: 'focus:ring-2 focus:ring-blue-400',
    icon: 'text-blue-500',
  },
  admin: {
    sendBtn: 'bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200',
    myBubble: 'bg-orange-500 text-white',
    myTime: 'text-white/60',
    ring: 'focus:ring-2 focus:ring-orange-400',
    icon: 'text-orange-500',
  },
};

export default function ChatPanel({ orderId, role, authHeaders }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const socketRef = useSocket();
  const s = STYLES[role] || STYLES.customer;
  const apiBase = role === 'admin' ? '/api/admin' : '/api/customer';

  useEffect(() => {
    axios.get(`${apiBase}/orders/${orderId}/messages`, { headers: authHeaders() })
      .then(r => setMessages(r.data.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    const socket = socketRef?.current;
    if (!socket) return;

    socket.emit('join:order', orderId);

    const handler = (msg) => {
      if (msg.orderId === orderId) {
        setMessages(prev =>
          prev.some(m => m._id && m._id === msg._id) ? prev : [...prev, msg]
        );
      }
    };
    socket.on('chat:message', handler);
    return () => {
      socket.off('chat:message', handler);
      socket.emit('leave:order', orderId);
    };
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await axios.post(
        `${apiBase}/orders/${orderId}/messages`,
        { content: text.trim() },
        { headers: authHeaders() }
      );
      setText('');
    } catch {}
    setSending(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <MessageSquare className={`w-4 h-4 ${s.icon}`} />
        <h3 className="font-semibold text-gray-800 text-sm">Support Chat</h3>
        <span className="text-xs text-gray-400 ml-auto">Nirman Setu Team</span>
      </div>

      <div className="h-64 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50/40">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-1">
            <MessageSquare className="w-8 h-8 opacity-20" />
            <p>Koi message nahi abhi</p>
            <p className="text-xs opacity-70">Order se related sawaal yahan poochein</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.from === role;
            return (
              <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-sm ${isMe ? s.myBubble : 'bg-white border border-gray-200 text-gray-800'}`}>
                  {!isMe && (
                    <p className="text-[11px] font-semibold mb-0.5 opacity-60">{msg.senderName}</p>
                  )}
                  <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-0.5 ${isMe ? s.myTime : 'text-gray-400'} ${isMe ? 'text-right' : ''}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex gap-2 bg-white">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Message likhein... (Enter to send)"
          className={`flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none ${s.ring}`}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className={`${s.sendBtn} text-white rounded-xl p-2.5 transition-colors shrink-0`}
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
