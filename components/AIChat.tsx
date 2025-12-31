
import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Loader2, Sparkles, Trash2, MessageSquare, Terminal } from 'lucide-react';
import { aiService } from '../services/aiService';
import { Button } from './ui/Common';

export const AIChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isLoading, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));
            const response = await aiService.sendMessage(userText, history);
            setMessages(prev => [...prev, { role: 'model', text: response || 'Сбой в передаче данных. Повторите запрос.' }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: 'Ошибка терминала Снежика. Проверьте соединение с сетью ЗАТО.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        if (confirm('Очистить лог взаимодействия со Снежиком?')) {
            setMessages([]);
        }
    };

    return (
        <div className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-[200] flex flex-col items-end">
            {isOpen ? (
                <div className="bg-white dark:bg-gray-900 w-[90vw] sm:w-[400px] h-[550px] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="p-5 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#2563eb] text-white flex justify-between items-center shrink-0 relative">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <Terminal className="w-full h-full scale-150 rotate-12" />
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20">
                                <Bot className="w-7 h-7 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-black text-xs uppercase tracking-[0.2em] leading-none mb-1.5">Система Снежик</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                                    <span className="text-[9px] font-bold text-cyan-200 uppercase tracking-widest">Протокол Активен</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 relative z-10">
                            <button onClick={clearChat} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors" title="Сброс системы">
                                <Trash2 className="w-4 h-4 text-white/60" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-[#f8fafc] dark:bg-[#0d1117]">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/10 rounded-3xl flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-900/30">
                                    <Sparkles className="w-10 h-10 text-blue-500 animate-pulse" />
                                </div>
                                <h4 className="text-gray-900 dark:text-white font-black text-lg mb-2 uppercase tracking-tight">Терминал жителя</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[240px]">
                                    Я Снежик — ИИ-проводник по Снежинску. Помогу с расписанием, новостями или расскажу историю нашего наукограда.
                                </p>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                                    m.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-600/10 font-medium' 
                                        : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
                                }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-2xl rounded-tl-none shadow-sm">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 border-t dark:border-gray-700 flex gap-3 bg-white dark:bg-gray-900">
                        <input 
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Запрос в систему..."
                            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all font-medium"
                        />
                        <button 
                            disabled={!input.trim() || isLoading}
                            className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-xl shadow-blue-500/30 active:scale-90"
                        >
                            <Send className="w-6 h-6" />
                        </button>
                    </form>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-20 h-20 bg-[#0f172a] hover:bg-blue-600 text-white rounded-[2rem] shadow-[0_15px_35px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/0 via-blue-400/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <Bot className="w-10 h-10" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full shadow-lg"></div>
                    
                    <div className="absolute right-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap shadow-2xl border dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-x-6 group-hover:translate-x-0">
                        Центр Помощи
                    </div>
                </button>
            )}
        </div>
    );
};
