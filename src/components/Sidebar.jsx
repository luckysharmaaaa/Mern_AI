const Sidebar = ({ chats, activeChatId, setActiveChatId, createNewChat, deleteChat, togglePin, renameChat }) => {
  return (
    <div className='w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col md:flex'>
      <div className='p-6'>
        <h1 className='text-blue-500 font-black text-2xl tracking-tighter mb-6 italic'>NEXUS AI</h1>
        <button onClick={createNewChat} className='w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition shadow-lg shadow-blue-900/20'>
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
              {chat.pinned && <span className='text-blue-400 text-xs'>📌</span>}
              <span className='text-sm truncate w-32'>{chat.title}</span>
            </div>

            <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition'>
              <button 
                onClick={(e) => { e.stopPropagation(); const newName = prompt("Rename chat:", chat.title); if(newName) renameChat(chat.id, newName); }}
                className='hover:text-zinc-200 text-xs'
              >
                ✏️
              </button>
              <button 
                onClick={(e) => togglePin(chat.id, e)}
                className={`hover:text-blue-400 text-xs ${chat.pinned ? 'text-blue-400' : ''}`}
              >
                📌
              </button>
              <button 
                onClick={(e) => deleteChat(chat.id, e)} 
                className='hover:text-red-500 text-xs'
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;