import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { messageApi } from '../../api/messageApi';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';

export default function BuyerMessages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryConversationId = searchParams.get('conversation');

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(queryConversationId || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    messageApi
      .myConversations()
      .then(({ data }) => {
        const list = Array.isArray(data?.data) ? data.data : [];
        setConversations(list);
        if (queryConversationId) {
          setActiveId(queryConversationId);
        } else if (list.length > 0) {
          setActiveId(list[0]._id);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch conversations:', err);
        setConversations([]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    setMsgLoading(true);
    messageApi
      .getMessages(activeId)
      .then(({ data }) => {
        setMessages(Array.isArray(data?.data) ? data.data : []);
      })
      .catch((err) => {
        console.error('Failed to load messages:', err);
        toast.error(err.response?.data?.message || 'Could not load messages');
        setMessages([]);
      })
      .finally(() => setMsgLoading(false));

    messageApi.markConversationRead(activeId).catch(() => {});
    setSearchParams({ conversation: activeId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    const content = text.trim();
    setText('');
    try {
      const { data } = await messageApi.send(activeId, content);
      const newMsg = data?.data;
      if (newMsg) {
        setMessages((prev) => [...(Array.isArray(prev) ? prev : []), newMsg]);
        setConversations((prev) =>
          (Array.isArray(prev) ? prev : []).map((c) =>
            c._id === activeId ? { ...c, lastMessage: newMsg.text, lastMessageAt: new Date() } : c
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
  };

  if (loading) return <Loader label="Loading messages..." />;

  const safeConversations = Array.isArray(conversations) ? conversations : [];
  const safeMessages = Array.isArray(messages) ? messages : [];

  if (safeConversations.length === 0) {
    return (
      <div className="card p-8 text-center text-forest-600">
        <p className="font-medium text-lg text-forest-800">No conversations yet</p>
        <p className="mt-1 text-sm text-forest-500">
          Browse listings and click &quot;Message seller&quot; to start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="card grid h-[32rem] grid-cols-3 overflow-hidden">
      <div className="col-span-1 overflow-y-auto border-r border-forest-100">
        {safeConversations.map((c) => {
          const other = c.participants?.find((p) => p && String(p._id || p) !== String(user?._id));
          return (
            <button
              key={c._id}
              onClick={() => setActiveId(c._id)}
              className={`block w-full border-b border-forest-50 p-3 text-left text-sm ${
                activeId === c._id ? 'bg-forest-100' : 'hover:bg-forest-50'
              }`}
            >
              <p className="font-medium text-forest-800">{other?.name || 'User'}</p>
              {c.listing?.title && (
                <p className="text-xs text-forest-600 truncate">Item: {c.listing.title}</p>
              )}
              <p className="line-clamp-1 text-xs text-forest-400 mt-0.5">{c.lastMessage || 'No messages yet'}</p>
            </button>
          );
        })}
      </div>

      <div className="col-span-2 flex flex-col">
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {msgLoading ? (
            <div className="flex h-full items-center justify-center text-xs text-forest-400">Loading chat...</div>
          ) : (
            safeMessages.map((m) => {
              const isMe = String(m.sender?._id || m.sender) === String(user?._id);
              return (
                <div
                  key={m._id}
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    isMe ? 'ml-auto bg-forest-700 text-white' : 'bg-forest-100 text-forest-800'
                  }`}
                >
                  {m.text}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="flex gap-2 border-t border-forest-100 p-3">
          <input
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
          />
          <button className="btn btn-primary shrink-0">Send</button>
        </form>
      </div>
    </div>
  );
}
