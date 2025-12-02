import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Conversation, Message, User } from '../types';
import { useSearchParams } from 'react-router-dom';
import { Send, User as UserIcon, Loader2, MessageCircle } from 'lucide-react';

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
        const sub = api.subscribeToMessages(activeChat, (msg) => {
            // Only add if not already in list (dedupe)
            setMessages(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            setTimeout(scrollToBottom, 100);
        });

        return () => sub.unsubscribe();
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
        // We don't need to manually update messages list here because 
        // the realtime subscription will catch our own message too!
        // But for instant feedback we can append locally if network is slow, 
        // though Supabase is fast enough usually.
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!currentUser) return <div className="p-10 text-center">Авторизуйтесь для доступа к чатам</div>;

    const activeConvo = conversations.find(c => c.id === activeChat);

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white">
            {/* Sidebar List */}
            <div className={`w-full md:w-80 border-r flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-bold text-gray-700">Сообщения</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <p className="text-gray-500 text-center py-10 text-sm">Нет активных диалогов</p>
                    ) : (
                        conversations.map(c => (
                            <div 
                                key={c.id}
                                onClick={() => setActiveChat(c.id)}
                                className={`p-4 border-b cursor-pointer hover:bg-gray-50 flex items-center gap-3 transition-colors ${activeChat === c.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                            >
                                <img src={c.partnerAvatar} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                                <div className="min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{c.partnerName}</h4>
                                    <p className="text-xs text-gray-500">{c.lastMessageDate}</p>
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
                        <div className="p-4 border-b flex items-center justify-between bg-white shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button className="md:hidden" onClick={() => setActiveChat(null)}>←</button>
                                <img src={activeConvo.partnerAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                <span className="font-bold text-gray-800">{activeConvo.partnerName}</span>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map(m => {
                                const isMe = m.senderId === currentUser.id;
                                return (
                                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none'}`}>
                                            {m.text}
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
                        <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
                            <input 
                                type="text" 
                                className="flex-1 border rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Напишите сообщение..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                            <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                        <p>Выберите собеседника для начала общения</p>
                    </div>
                )}
            </div>
        </div>
    );
};