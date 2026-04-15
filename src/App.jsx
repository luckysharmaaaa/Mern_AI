import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

// API Configuration
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

// 1. Sidebar Component
const Sidebar = ({ chats, activeChatId, setActiveChatId, createNewChat, deleteChat, togglePin, renameChat }) => {
  return (
    <div className='w-72 bg-zinc-950 border-r border-zinc-800  flex-col hidden md:flex'>
      <div className='p-6'>
        {/* Yahan Name Change Karo */}
        <h1 className='text-blue-500 font-black text-2xl tracking-tighter mb-6 italic uppercase'>
          Chat box AI
        </h1>
        <button onClick={createNewChat} className='w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition shadow-lg shadow-blue-900/20'>
          + New Chat
        </button>
      </div>

      <div className='flex-1 overflow-y-auto px-3 space-y-1'>
        {chats.map(chat => (
          <div 
            key={chat.id} 
            onClick={() => setActiveChatId(chat.id)}
            className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
              activeChatId === chat.id ? 'bg-zinc-800 border border-zinc-700' : 'hover:bg-zinc-900 text-zinc-400'
            }`}
          >
            <div className='flex items-center gap-2 truncate'>
              {chat.pinned && <span className='text-blue-400 text-[10px]'>📌</span>}
              <span className='text-sm truncate w-32'>{chat.title}</span>
            </div>

            <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition'>
              <button onClick={(e) => { e.stopPropagation(); const n = prompt("New name:", chat.title); if(n) renameChat(chat.id, n); }} className='hover:text-zinc-200 text-xs'>✏️</button>
              <button onClick={(e) => togglePin(chat.id, e)} className='hover:text-blue-400 text-xs'>📌</button>
              <button onClick={(e) => deleteChat(chat.id, e)} className='hover:text-red-500 text-xs'>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Main App Component
function App() {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("nexus_v2_chats");
    return saved ? JSON.parse(saved) : [{ id: 1, title: "New Chat", messages: [], pinned: false }];
  });
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  useEffect(() => {
    localStorage.setItem("nexus_v2_chats", JSON.stringify(chats));
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, loading]);

  const createNewChat = () => {
    const newId = Date.now();
    setChats([{ id: newId, title: "New Chat", messages: [], pinned: false }, ...chats]);
    setActiveChatId(newId);
  };

  const togglePin = (id, e) => {
    e.stopPropagation();
    setChats(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c);
      return updated.sort((a, b) => (b.pinned - a.pinned) || (b.id - a.id));
    });
  };

  const renameChat = (id, newTitle) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    const filtered = chats.filter(c => c.id !== id);
    setChats(filtered.length ? filtered : [{ id: Date.now(), title: "New Chat", messages: [], pinned: false }]);
    if (activeChatId === id) setActiveChatId(filtered[0]?.id || Date.now());
  };

  const askQuestion = async () => {
    if (!question.trim() || loading) return;

    const userMsg = { role: "user", text: question };
    const updatedMessages = [...activeChat.messages, userMsg];
    let newTitle = activeChat.title === "New Chat" ? question.slice(0, 20) + "..." : activeChat.title;

    setChats(prev => prev.map(c => 
      c.id === activeChatId ? { ...c, messages: updatedMessages, title: newTitle } : c
    ));
    setQuestion("");
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: updatedMessages.map(m => ({
          role: m.role === "model" ? "model" : "user",
          parts: [{ text: m.text }]
        })),
      });

      setChats(prev => prev.map(c => 
        c.id === activeChatId ? { ...c, messages: [...updatedMessages, { role: "model", text: response.text }] } : c
      ));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex h-screen bg-zinc-900 text-zinc-100 font-sans'>
      <Sidebar 
        chats={chats} 
        activeChatId={activeChatId} 
        setActiveChatId={setActiveChatId} 
        createNewChat={createNewChat} 
        deleteChat={deleteChat}
        togglePin={togglePin}
        renameChat={renameChat}
      />

      <div className='flex-1 flex flex-col'>
        <div className='flex-1 overflow-y-auto p-6 md:px-24'>
          {activeChat.messages.length === 0 && (
            <div className='h-full flex flex-col items-center justify-center opacity-10 select-none'>
              <h2 className='text-8xl font-black italic'>NEXUS</h2>
            </div>
          )}
          
          {activeChat.messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-xl ${
                msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-zinc-800 border border-zinc-700 rounded-tl-none'
              }`}>
                <div className='prose prose-invert max-w-none text-sm md:text-base'>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && <div className='text-zinc-600 animate-pulse font-bold text-xs tracking-widest'>THINKING...</div>}
          <div ref={scrollRef} />
        </div>

        <div className='p-6'>
          <div className='max-w-4xl mx-auto flex gap-3 bg-zinc-800 p-2 pl-6 rounded-2xl border border-zinc-700 shadow-2xl focus-within:border-blue-500 transition-all'>
            <input 
              className='flex-1 bg-transparent py-2 outline-none text-zinc-100 text-lg'
              placeholder='Ask me anything...'
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askQuestion()}
            />
            <button onClick={askQuestion} disabled={loading} className='px-8 bg-white text-black rounded-xl font-black hover:bg-zinc-200 transition disabled:opacity-50'>
              SEND
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;