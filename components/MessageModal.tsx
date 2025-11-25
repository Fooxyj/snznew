import React, { useState, useRef, useEffect } from 'react';
import { Category } from '../types';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  adTitle: string;
  category: Category;
  subCategory?: string;
}

interface Message {
  id: number;
  text: string;
  isMe: boolean;
  time: string;
}

export const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose, adTitle, category, subCategory }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Scroll to bottom when chat opens
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Logic to determine relevant quick replies
  const getQuickReplies = (): string[] => {
    // 1. Specific Transport Services (Freight, Moving, Towing)
    if (category === 'services' && (subCategory === 'Грузоперевозки' || subCategory === 'Переезды' || subCategory === 'Эвакуатор' || subCategory === 'Пассажирские перевозки')) {
        return [
          "Здравствуйте! Какая цена за час?",
          "Нужна машина на завтра",
          "Есть ли грузчики?",
          "Какой размер кузова?",
          "Работаете по межгороду?"
        ];
    }

    // 2. Real Estate Rent
    if (category === 'rent' && subCategory && ['Квартиры', 'Комнаты', 'Дома, дачи', 'Гаражи', 'Коммерческая'].includes(subCategory)) {
        return [
            "Здравствуйте! Ещё сдаётся?",
            "На длительный срок?",
            "Можно с животными?",
            "Когда можно посмотреть?",
            "Входит ли коммуналка?"
        ];
    }

    // 3. General Rent (Tools, Equipment, Cars)
    if (category === 'rent') {
        return [
            "Здравствуйте! Свободно на выходные?",
            "Какая цена за сутки?",
            "Нужен ли залог?",
            "Есть доставка?",
            "В каком состоянии?"
        ];
    }

    // 4. General Services (Repairs, Beauty, IT)
    if (category === 'services') {
        return [
            "Здравствуйте! Какая стоимость услуги?",
            "Когда сможете приступить?",
            "Работаете в выходные?",
            "Есть ли гарантия?",
            "Нужна консультация"
        ];
    }

    // 5. Jobs
    if (category === 'jobs') {
        return [
            "Здравствуйте! Вакансия ещё актуальна?",
            "Какой график работы?",
            "Официальное трудоустройство?",
            "Рассматриваете без опыта?",
            "Где находится место работы?"
        ];
    }

    // 6. Default (Sale - Items, Cars, Electronics, etc.)
    return [
      "Здравствуйте! Ещё актуально?",
      "Когда можно посмотреть?",
      "Где вы находитесь?",
      "Торг уместен?",
      "Обмен интересует?"
    ];
  };

  const quickReplies = getQuickReplies();

  if (!isOpen) return null;

  const sendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text: text,
      isMe: true,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Simulate simple auto-reply
    const timer = setTimeout(() => {
       const reply: Message = {
          id: Date.now() + 1,
          text: 'Здравствуйте! Да, пишите, я на связи.',
          isMe: false,
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
       };
       setMessages(prev => [...prev, reply]);
    }, 1500);
    
    // Return cleanup function if used in useEffect, but here just firing and forgetting. 
    // Ideally we should track mounted state but for this simple modal it's okay unless unmounted quickly.
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    sendMessage(inputText);
    setInputText('');
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6" onClick={onClose}>
      <div 
        className="bg-surface w-full max-w-lg h-full max-h-[700px] rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Chat Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 z-10">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-300 flex items-center justify-center text-white font-bold shadow-sm">
                П
              </div>
              <div>
                 <h3 className="font-bold text-dark leading-none">Продавец</h3>
                 <span className="text-xs text-green-500 font-medium flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Онлайн
                 </span>
              </div>
           </div>
           
           <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-dark transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
           </button>
        </div>

        {/* Chat Body */}
        <div className="flex-grow overflow-y-auto p-6 bg-gray-50 space-y-4 custom-scrollbar flex flex-col">
           <div className="text-center text-xs text-gray-400 my-4">
              Сегодня
           </div>
           
           {messages.length === 0 ? (
             <div className="flex-grow flex flex-col justify-end items-center pb-4">
               <p className="text-secondary text-sm mb-4">Выберите быстрый вопрос:</p>
               <div className="flex flex-wrap gap-2 justify-center w-full">
                 {quickReplies.map((reply, idx) => (
                   <button
                     key={idx}
                     onClick={() => handleQuickReply(reply)}
                     className="bg-white border border-gray-200 text-dark text-sm px-4 py-2 rounded-full hover:border-primary hover:text-primary transition-colors shadow-sm active:scale-95"
                   >
                     {reply}
                   </button>
                 ))}
               </div>
             </div>
           ) : (
             messages.map((msg) => (
               <div 
                  key={msg.id} 
                  className={`flex w-full ${msg.isMe ? 'justify-end' : 'justify-start'}`}
               >
                  <div 
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm relative shadow-sm
                      ${msg.isMe 
                        ? 'bg-primary text-white rounded-br-none' 
                        : 'bg-white text-dark border border-gray-100 rounded-bl-none'
                      }`}
                  >
                     <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                     <span className={`text-[10px] block text-right mt-1 opacity-70 ${msg.isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                        {msg.time}
                     </span>
                  </div>
               </div>
             ))
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleFormSubmit} className="p-4 bg-white border-t border-gray-100 shrink-0">
           <div className="relative flex items-center gap-2">
              <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </button>
              <input 
                type="text" 
                className="flex-grow bg-gray-100 border-transparent focus:bg-white focus:border-primary border rounded-xl py-3 px-4 text-dark outline-none transition-all placeholder:text-gray-400"
                placeholder="Напишите сообщение..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                autoFocus
              />
              <button 
                type="submit"
                disabled={!inputText.trim()} 
                className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95"
              >
                 <svg className="w-5 h-5 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
           </div>
        </form>

      </div>
    </div>
  );
};