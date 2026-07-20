import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messageApi } from '../../api/messageApi';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';

export default function BuyerMessages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(searchParams.get('conversation') || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    messageApi.myConversations().then(({ data }) => {
      setConversations(data.data);
      if (!activeId && data.data[0]) setActiveId(data.data[0]._id);
    }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) return;
    messageApi.getMessages(activeId).then(({ data }) => setMessages(data.data));
    messageApi.markConversationRead(activeId).catch(() => {});
    setSearchParams({ conversation: activeId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const { data } = await messageApi.send(activeId, text);
    setMessages((prev) => [...prev, data.data]);
    setText('');
  };

  if (loading) return <Loader />;
  if (conversations.length === 0) return <p className="text-sm text-forest-500">No conversations yet.</p>;

  return (
    <div className="card grid h-[32rem] grid-cols-3 overflow-hidden">
      <div className="col-span-1 overflow-y-auto border-r border-forest-100">
        {conversations.map((c) => {
          const other = c.participants.find((p) => p._id !== user._id);
          return (
            <button
              key={c._id}
              onClick={() => setActiveId(c._id)}
              className={`block w-full border-b border-forest-50 p-3 text-left text-sm ${
                activeId === c._id ? 'bg-forest-100' : 'hover:bg-forest-50'
              }`}
            >
              <p className="font-medium text-forest-800">{other?.name}</p>
              <p className="line-clamp-1 text-xs text-forest-500">{c.lastMessage}</p>
            </button>
          );
        })}
      </div>

      <div className="col-span-2 flex flex-col">
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                m.sender === user._id ? 'ml-auto bg-forest-700 text-white' : 'bg-forest-100 text-forest-800'
              }`}
            >
              {m.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="flex gap-2 border-t border-forest-100 p-3">
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
          <button className="btn btn-primary shrink-0">Send</button>
        </form>
      </div>
    </div>
  );
}
