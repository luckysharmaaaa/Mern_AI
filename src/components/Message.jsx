import ReactMarkdown from 'react-markdown';

const Message = ({ msg }) => {
  const isUser = msg.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-[85%] p-4 rounded-2xl shadow-md ${
        isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-tl-none'
      }`}>
        <div className='prose prose-invert max-w-none text-sm md:text-base'>
          <ReactMarkdown>{msg.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Message;