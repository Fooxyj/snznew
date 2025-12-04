
import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Conversation, Message, User } from '../types';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, User as UserIcon, Loader2, MessageCircle, ArrowRight } from 'lucide-react';

export const ChatPage: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [searchParams] = useSearchParams();
    const urlChatId = searchParams.get('id');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        const init = async () => {
            const user = await api.getCurrentUser();
            setCurrentUser(user);
            if (user) {
                const convos = await api.getConversations();
                setConversations(convos);
                
                // If ID in URL, select it
                if (urlChatId) {
                    setActiveChat(urlChatId);
                } else if (convos.length > 0) {
                    setActiveChat(convos[0].id);
                }
            }
            setLoading(false);
        };
        init();
    }, [urlChatId]);

    // Load Messages when chat changes + Realtime Sub
    useEffect(() => {
        if (!activeChat) return;
        
        const loadMessages = async () => {
            const msgs = await api.getMessages(activeChat);
            setMessages(msgs);
            setTimeout(scrollToBottom, 100);
        };

        loadMessages();
        
        // Subscribe to real-time messages
        const subPromise = api.subscribeToMessages(activeChat, (msg) => {
            // Only add if not already in list (dedupe)
            setMessages(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            setTimeout(scrollToBottom, 100);
        });

        return () => {
            subPromise.then(sub => sub.unsubscribe());
        };
    }, [activeChat]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeChat || !newMessage.trim()) return;

        const text = newMessage;
        setNewMessage(''); // optimistic clear
        
        await api.sendMessage(activeChat, text);
    };

    const renderMessageContent = (text: string) => {
        // 1. Try parse JSON for "Ad Card"
        try {
            if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
                const data = JSON.parse(text);
                if (data && data.type === 'ad_inquiry') {
                    return (
                        <div className="max-w-xs">
                            <div className="bg-gray-100 dark:bg-gray-700/50 rounded-xl p-3 mb-2 border dark:border-gray-600">
                                <img src={data.image} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />
                                <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{data.title}</div>
                                <div className="text-blue-600 dark:text-blue-400 font-bold mb-2">{data.price}</div>
                                <Link to={`/ad/${data.adId}`} className="block w-full bg-white dark:bg-gray-600 text-center py-2 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors">
                                    Открыть объявление
                                </Link>
                            </div>
                            <div className="text-sm">{data.text}</div>
                        </div>
                    );
                }
            }
        } catch (e) {
            // ignore JSON parse error, treat as text
        }

        // 2. Standard Text / Image rendering
        const lines = text.split('\n');
        return lines.map((line, idx) => {
            const isImageUrl = line.match(/^https?:\/\/.*\.(jpg|jpeg|png|webp|gif)$/i) || line.includes('picsum.photos') || line.includes('ui-avatars.com');
            if (isImageUrl) {
                return (
                    <div key={idx} className="mt-2 mb-1">
                        <img src={line.trim()} alt="attachment" className="rounded-lg max-w-full max-h-48 object-cover border border-black/10" />
                    </div>
                );
            }
            return <div key={idx} className="min-h-[1.2em]">{line}</div>;
        });
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!currentUser) return <div className="p-10 text-center">Авторизуйтесь для доступа к чатам</div>;

    const activeConvo = conversations.find(c => c.id === activeChat);

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-gray-900">
            {/* Sidebar List */}
            <div className={`w-full md:w-80 border-r dark:border-gray-700 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h2 className="font-bold text-gray-700 dark:text-white">Сообщения</h2>
                </div>
                <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                    {conversations.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-10 text-sm">Нет активных диалогов</p>
                    ) : (
                        conversations.map(c => (
                            <div 
                                key={c.id}
                                onClick={() => setActiveChat(c.id)}
                                className={`p-4 border-b dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors ${activeChat === c.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600 dark:border-l-blue-500' : ''}`}
                            >
                                <img src={c.partnerAvatar} alt="" className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-700" />
                                <div className="min-w-0">
                                    <h4 className="font-medium text-gray-900 dark:text-white truncate">{c.partnerName}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.lastMessageDate}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                {activeChat && activeConvo ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button className="md:hidden text-gray-500 dark:text-gray-300" onClick={() => setActiveChat(null)}>
                                    <ArrowRight className="w-5 h-5 rotate-180" />
                                </button>
                                <img src={activeConvo.partnerAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                <span className="font-bold text-gray-800 dark:text-white">{activeConvo.partnerName}</span>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-gray-900/50">
                            {messages.map(m => {
                                const isMe = m.senderId === currentUser.id;
                                return (
                                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'}`}>
                                            {renderMessageContent(m.text)}
                                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2">
                            <input 
                                type="text" 
                                className="flex-1 border dark:border-gray-600 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
                                placeholder="Напишите сообщение..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                            <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                                <Send className="w-5 h-5 translate-x-0.5 translate-y-0.5" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                        <MessageCircle className="w-20 h-20 mb-4 opacity-20" />
                        <p>Выберите собеседника для начала общения</p>
                    </div>
                )}
            </div>
        </div>
    );
};
