
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Message } from '../types';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, Loader2, MessageCircle, Paperclip, Check, CheckCheck, ChevronLeft } from 'lucide-react';

export const ChatPage: React.FC = () => {
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    
    const [searchParams] = useSearchParams();
    const urlChatId = searchParams.get('id');
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const queryClient = useQueryClient();

    // Fetch Current User
    const { data: currentUser } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    // Fetch Conversations
    const { data: conversations = [], isLoading: convosLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: api.getConversations,
        enabled: !!currentUser,
        // Poll for new conversations or last message updates
        refetchInterval: 5000
    });

    // Handle URL param selection only explicitly
    useEffect(() => {
        if (urlChatId) {
            setActiveChat(urlChatId);
        }
    }, [urlChatId]);

    // Fetch Messages
    const { data: messages = [] } = useQuery({
        queryKey: ['messages', activeChat],
        queryFn: () => api.getMessages(activeChat!),
        enabled: !!activeChat,
        // Short polling is good backup if realtime socket drops
        refetchInterval: 3000 
    });

    const markReadIfNeeded = useCallback(() => {
        if (activeChat && messages.length > 0 && currentUser) {
            const hasUnreadFromPartner = messages.some(m => m.senderId !== currentUser.id && !m.isRead);
            if (hasUnreadFromPartner) {
                api.markMessagesAsRead(activeChat);
                // We invalidate strictly to ensure UI update
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            }
        }
    }, [activeChat, messages, currentUser, queryClient]);

    // MARK AS READ LOGIC
    useEffect(() => {
        markReadIfNeeded();
    }, [markReadIfNeeded]);

    // Also mark read on window focus (in case user came back to tab)
    useEffect(() => {
        const onFocus = () => markReadIfNeeded();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [markReadIfNeeded]);

    // Send Message Mutation
    const sendMessageMutation = useMutation({
        mutationFn: (text: string) => api.sendMessage(activeChat!, text),
        onSuccess: () => {
            // Optimistic update handled by Realtime, but invalidation ensures consistency
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            setNewMessage('');
            setTimeout(scrollToBottom, 50);
        }
    });

    // Realtime Subscription
    useEffect(() => {
        if (!activeChat) return;
        
        let unsub: () => void;
        const setupSub = async () => {
            const sub = await api.subscribeToMessages(activeChat, (msg) => {
                queryClient.setQueryData(['messages', activeChat], (old: Message[] | undefined) => {
                    if (!old) return [msg];
                    
                    const existingIdx = old.findIndex(m => m.id === msg.id);
                    if (existingIdx !== -1) {
                        const newArr = [...old];
                        // Update existing message (e.g. status changed to read)
                        newArr[existingIdx] = { ...newArr[existingIdx], ...msg };
                        return newArr;
                    }
                    // Add new message
                    return [...old, msg];
                });
                
                // If I receive a message while looking at the chat, mark it read immediately
                if (!msg.isRead && msg.senderId !== currentUser?.id) {
                    api.markMessagesAsRead(activeChat);
                }

                setTimeout(scrollToBottom, 50);
            });
            unsub = sub.unsubscribe;
        };
        setupSub();

        return () => {
            if (unsub) unsub();
        };
    }, [activeChat, queryClient, currentUser]);

    // Scroll effect for new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages.length, activeChat]);

    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeChat || !newMessage.trim()) return;
        sendMessageMutation.mutate(newMessage);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeChat) return;
        
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            sendMessageMutation.mutate(url);
        } catch (e: any) {
            alert("Upload failed: " + e.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const renderMessageContent = (text: string) => {
        try {
            if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
                const data = JSON.parse(text);
                if (data && data.type === 'ad_inquiry') {
                    return (
                        <div className="max-w-xs">
                            <div className="bg-gray-100 dark:bg-gray-700/50 rounded-xl p-3 mb-2 border dark:border-gray-600">
                                <img src={data.image} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />
                                <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{data.title}</div>
                                <div className="text-blue-600 dark:text-blue-400 font-bold mb-1">{data.price}</div>
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
            // ignore
        }

        const lines = text.split('\n');
        return lines.map((line, idx) => {
            const isImageUrl = line.match(/^https?:\/\/.*\.(jpg|jpeg|png|webp|gif|bmp)$/i) || line.includes('picsum.photos') || line.includes('ui-avatars.com') || (line.startsWith('blob:') && !line.includes(' '));
            if (isImageUrl) {
                return (
                    <div key={idx} className="mt-1 mb-1">
                        <img src={line.trim()} alt="attachment" className="rounded-lg max-w-full max-h-60 object-cover border border-black/10 dark:border-white/10" />
                    </div>
                );
            }
            return <div key={idx} className="min-h-[1.2em] break-words">{line}</div>;
        });
    };

    const StatusIcon = ({ isRead, isMe }: { isRead?: boolean, isMe: boolean }) => {
        if (!isMe) return null;
        
        if (isRead) {
            return (
                <div className="flex -space-x-1.5 text-blue-500 dark:text-blue-400 animate-in zoom-in duration-300" title="Прочитано">
                    <CheckCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                </div>
            );
        }
        
        return (
            <div title="Отправлено (не прочитано)">
                <Check className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" strokeWidth={2} />
            </div>
        );
    };

    if (convosLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!currentUser) return <div className="p-10 text-center">Авторизуйтесь для доступа к чатам</div>;

    const activeConvo = conversations.find(c => c.id === activeChat);

    return (
        <div className="flex h-full bg-white dark:bg-gray-900 overflow-hidden relative">
            {/* Sidebar List */}
            <div className={`w-full md:w-80 border-r dark:border-gray-700 flex flex-col h-full absolute inset-0 md:static z-20 bg-white dark:bg-gray-900 transition-transform duration-300 ${activeChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
                    <h2 className="font-bold text-gray-700 dark:text-white text-lg">Сообщения</h2>
                </div>
                <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6">
                            <MessageCircle className="w-12 h-12 text-gray-300 mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Нет активных диалогов</p>
                        </div>
                    ) : (
                        conversations.map((c, idx) => {
                            const isSelected = activeChat === c.id;
                            return (
                                <div 
                                    key={c.id}
                                    onClick={() => setActiveChat(c.id)}
                                    className={`p-4 border-b dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600 dark:border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="relative">
                                        <img src={c.partnerAvatar} alt="" className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-700" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white truncate">{c.partnerName}</h4>
                                            <span className="text-[10px] text-gray-400">{c.lastMessageDate}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-xs truncate max-w-[90%] text-gray-500 dark:text-gray-400`}>
                                                {c.lastMessageText || 'Нет сообщений'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`w-full md:flex-1 flex flex-col h-full absolute inset-0 md:static z-30 bg-white dark:bg-gray-900 transition-transform duration-300 ${activeChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                {activeChat && activeConvo ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-3 lg:p-4 border-b dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm z-30 shrink-0 h-[64px] lg:h-auto">
                            <div className="flex items-center gap-3">
                                <button className="md:hidden text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full" onClick={() => setActiveChat(null)}>
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <img src={activeConvo.partnerAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                <span className="font-bold text-gray-800 dark:text-white truncate max-w-[200px]">{activeConvo.partnerName}</span>
                            </div>
                        </div>

                        {/* Messages Area - constrained scroll */}
                        <div 
                            ref={messageContainerRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-gray-900/50 scroll-smooth"
                        >
                            {messages.map(m => {
                                const isMe = m.senderId === currentUser.id;
                                return (
                                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'}`}>
                                            {renderMessageContent(m.text)}
                                            <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                <StatusIcon isRead={m.isRead} isMe={isMe} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2 items-center shrink-0 safe-area-pb">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                disabled={uploading || sendMessageMutation.isPending}
                            >
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                            </button>
                            <input 
                                type="text" 
                                className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-full px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                placeholder="Напишите сообщение..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                            <button 
                                className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={(!newMessage.trim() && !uploading) || sendMessageMutation.isPending}
                            >
                                {sendMessageMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 translate-x-0.5 translate-y-0.5" />}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-slate-50 dark:bg-gray-900/50 hidden md:flex">
                        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                            <MessageCircle className="w-16 h-16 opacity-30" />
                        </div>
                        <p className="text-lg font-medium">Выберите чат</p>
                        <p className="text-sm opacity-70">чтобы начать общение</p>
                    </div>
                )}
            </div>
        </div>
    );
};
