
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Message, Conversation } from '../types';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, Loader2, MessageCircle, Paperclip, ChevronLeft, Trash2, ShoppingBag, X, Car, Check, Calendar, ArrowRight, Users, HelpCircle, Repeat, ShieldCheck, MapPin } from 'lucide-react';
import { UserStatus, Button } from '../components/ui/Common';

export const ChatPage: React.FC = () => {
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    
    const [searchParams, setSearchParams] = useSearchParams();
    const urlChatId = searchParams.get('id');
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const queryClient = useQueryClient();

    const { data: currentUser } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    const { data: conversations = [], isLoading: convosLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: api.getConversations,
        enabled: !!currentUser
    });

    const { data: allRides = [] } = useQuery({
        queryKey: ['rides'],
        queryFn: api.getRides
    });

    const { data: myRentalBookings = [] } = useQuery({
        queryKey: ['myRentalBookings'],
        queryFn: api.getMyRentals
    });

    useEffect(() => {
        if (urlChatId && conversations.length > 0) {
            const exists = conversations.some(c => c.id === urlChatId);
            if (exists) setActiveChat(urlChatId);
        }
    }, [urlChatId, conversations]);

    const activeConvo = useMemo(() => conversations.find(c => c.id === activeChat), [conversations, activeChat]);
    
    const { data: partnerProfile } = useQuery({
        queryKey: ['publicUser', activeConvo?.partnerId],
        queryFn: () => api.getUserById(activeConvo!.partnerId),
        enabled: !!activeConvo?.partnerId,
        refetchInterval: 10000 
    });

    const { data: messages = [], isLoading: messagesLoading } = useQuery({
        queryKey: ['messages', activeChat],
        queryFn: () => api.getMessages(activeChat!),
        enabled: !!activeChat
    });

    const sendMessageMutation = useMutation({
        mutationFn: (text: string) => {
            api.updateLastSeen();
            return api.sendMessage(activeChat!, text);
        },
        onMutate: async (text) => {
            await queryClient.cancelQueries({ queryKey: ['messages', activeChat] });
            const previousMessages = queryClient.getQueryData<Message[]>(['messages', activeChat]);

            if (previousMessages && currentUser) {
                const optimisticMessage: Message = {
                    id: 'temp-' + Date.now(),
                    conversationId: activeChat!,
                    senderId: currentUser.id,
                    text: text,
                    createdAt: new Date().toISOString(),
                    isRead: false,
                    status: 'pending'
                };
                queryClient.setQueryData(['messages', activeChat], [...previousMessages, optimisticMessage]);
            }

            return { previousMessages };
        },
        onError: (err, text, context) => {
            if (context?.previousMessages) {
                queryClient.setQueryData(['messages', activeChat], context.previousMessages);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', activeChat] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['chatUnread'] });
        }
    });

    const scrollToBottom = useCallback(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages.length, scrollToBottom]);

    useEffect(() => {
        if (activeChat) {
            queryClient.setQueryData(['conversations'], (old: Conversation[] = []) => 
                old.map(c => c.id === activeChat ? { ...c, unreadCount: 0 } : c)
            );
            
            queryClient.setQueryData(['chatUnread'], (old: number = 0) => {
                const convo = conversations.find(c => c.id === activeChat);
                return Math.max(0, old - (convo?.unreadCount || 0));
            });

            api.markMessagesAsRead(activeChat).then(() => {
                queryClient.invalidateQueries({ queryKey: ['chatUnread'] });
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            });
        }
    }, [activeChat, queryClient]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeChat || !newMessage.trim()) return;
        const txt = newMessage;
        setNewMessage('');
        sendMessageMutation.mutate(txt);
    };

    const confirmBookingMutation = useMutation({
        mutationFn: ({ rideId, passengerId, count }: { rideId: string, passengerId: string, count: number }) => 
            api.confirmRideBooking(rideId, passengerId, count),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['rides'] });
            queryClient.invalidateQueries({ queryKey: ['messages', activeChat] });
            sendMessageMutation.mutate(`✅ Я подтвердил вашу бронь на ${variables.count} мест! Жду вас в назначенное время.`);
        },
        onError: (e: any) => alert(e.message)
    });

    const confirmRentalMutation = useMutation({
        mutationFn: (data: any) => api.bookRental(data.rentalId, data.startDate, data.endDate, data.totalPrice, data.deposit),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['rentals'] });
            queryClient.invalidateQueries({ queryKey: ['myRentalBookings'] });
            queryClient.invalidateQueries({ queryKey: ['messages', activeChat] });
            sendMessageMutation.mutate(`✅ Я подтвердил аренду "${variables.title}"! Можете забирать вещь в оговоренное время.`);
        },
        onError: (e: any) => alert(e.message)
    });

    const handleDeleteConvo = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Удалить этот диалог навсегда?")) return;
        try {
            await api.deleteConversation(id);
            if (activeChat === id) setActiveChat(null);
            setSearchParams({});
            await queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['chatUnread'] });
        } catch (err: any) {
            alert("Ошибка при удалении: " + err.message);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeChat) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            sendMessageMutation.mutate(url);
        } catch (e: any) {
            alert("Ошибка загрузки");
        } finally {
            setUploading(false);
        }
    };

    const renderMessageContent = (m: Message) => {
        if (m.text.startsWith('http') && (m.text.includes('supabase') || m.text.includes('unsplash') || m.text.includes('picsum'))) {
            return <img src={m.text} alt="" className="rounded-lg max-h-64 w-full object-cover shadow-sm border dark:border-gray-700" />;
        }

        if (m.text.startsWith('{')) {
            try {
                const data = JSON.parse(m.text);
                
                if (data.type === 'ride_booking') {
                    const isDriver = currentUser?.id !== m.senderId;
                    const requestedCount = data.requestedSeats || 1;
                    const targetRide = allRides.find(r => r.id === data.rideId);
                    const passengersList = JSON.parse(targetRide?.passengers || '[]');
                    const isConfirmed = passengersList.includes(m.senderId);
                    
                    return (
                        <div className={`bg-white dark:bg-gray-900 rounded-2xl border-2 overflow-hidden shadow-md w-[240px] md:w-[280px] mt-1 mb-1 transition-colors ${isConfirmed ? 'border-green-500' : 'border-blue-500'}`}>
                            <div className={`p-3 text-white flex items-center gap-2 ${isConfirmed ? 'bg-green-500' : 'bg-blue-500'}`}>
                                <Car className="w-5 h-5" />
                                <span className="font-bold text-[10px] uppercase tracking-tighter">{isConfirmed ? 'Место забронировано' : 'Запрос на поездку'}</span>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-3 font-bold text-sm dark:text-white">
                                    <span>{data.fromCity}</span>
                                    <ArrowRight className="w-3 h-3 text-gray-400" />
                                    <span>{data.toCity}</span>
                                </div>
                                <div className="space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {new Date(data.date).toLocaleDateString()} в {data.time}</div>
                                    <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400"><Users className="w-3 h-3" /> Мест: {requestedCount}</div>
                                </div>
                                {isConfirmed ? (
                                    <div className="flex items-center justify-center gap-2 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase">Подтверждено</span>
                                    </div>
                                ) : isDriver ? (
                                    <Button size="sm" className="w-full font-bold py-2 rounded-xl" onClick={() => confirmBookingMutation.mutate({ rideId: data.rideId, passengerId: m.senderId, count: requestedCount })}>
                                        Подтвердить бронь
                                    </Button>
                                ) : <div className="text-center py-2 text-[10px] text-gray-400 italic">Ожидайте подтверждения</div>}
                            </div>
                        </div>
                    );
                }

                if (data.type === 'rental_inquiry' || data.type === 'ad_inquiry' || data.type === 'lost_found_inquiry') {
                    const typeLabel = data.type === 'rental_inquiry' ? 'АРЕНДА' : data.type === 'lost_found_inquiry' ? 'БЮРО НАХОДОК' : 'ОБЪЯВЛЕНИЕ';
                    const targetPath = data.type === 'rental_inquiry' ? '/rentals' : data.type === 'lost_found_inquiry' ? '/lost-found' : (data.businessId ? `/business/${data.businessId}` : `/ad/${data.adId}`);

                    return (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-700 overflow-hidden shadow-sm w-[240px] md:w-[280px] mt-1 mb-1">
                            <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img src={data.image || 'https://via.placeholder.com/300'} className="w-full h-full object-cover" alt="" />
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-widest">{typeLabel}</div>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                <h5 className="font-bold text-sm dark:text-white line-clamp-1 leading-tight">{data.title || 'Без названия'}</h5>
                                {data.price && <p className="text-blue-600 dark:text-blue-400 font-bold text-base">{data.price}</p>}
                                <Link to={targetPath} className="block w-full py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase text-center rounded-lg transition-all active:scale-95">
                                    Посмотреть на сайте
                                </Link>
                            </div>
                        </div>
                    );
                }
            } catch (e) { }
        }

        return <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">{m.text}</p>;
    };

    if (convosLoading && conversations.length === 0) return <div className="flex h-full items-center justify-center bg-white dark:bg-gray-900"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="flex-1 flex bg-white dark:bg-gray-900 overflow-hidden relative min-h-0 h-[calc(100dvh-64px)] lg:h-full">
            <div className={`w-full md:w-80 border-r dark:border-gray-700 flex flex-col h-full absolute inset-0 md:static z-20 bg-white dark:bg-gray-900 transition-transform duration-300 ${activeChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                <div className="p-5 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
                    <h2 className="font-bold text-xl dark:text-white">Чаты</h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.map(c => {
                        const hasUnread = (c.unreadCount || 0) > 0;
                        return (
                        <div 
                            key={c.id} 
                            onClick={() => { setActiveChat(c.id); setSearchParams({id: c.id}); }}
                            className={`p-4 border-b dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-center gap-3 transition-all group ${activeChat === c.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        >
                            <div className="relative">
                                <Link 
                                    to={c.businessId && !c.partnerId.includes('-') ? `/business/${c.businessId}` : `/user/${c.partnerId}`} 
                                    onClick={(e) => e.stopPropagation()}
                                    className="block relative hover:scale-110 transition-transform z-10"
                                >
                                    <img src={c.partnerAvatar || 'https://ui-avatars.com/api/?name=U'} className="w-12 h-12 rounded-full object-cover bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 shadow-sm" alt="" />
                                    {c.businessId && <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white dark:border-gray-900"><ShoppingBag className="w-2.5 h-2.5" /></div>}
                                    {hasUnread && (
                                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                                    )}
                                </Link>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h4 className={`text-sm dark:text-white truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                        {c.partnerName}
                                    </h4>
                                    <span className="text-[9px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-tighter shrink-0 group-hover:hidden">{c.lastMessageDate || '—'}</span>
                                    <button onClick={(e) => handleDeleteConvo(e, c.id)} className="hidden group-hover:block p-1 text-red-400 hover:text-red-600 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-xs truncate flex-1 pr-2 ${hasUnread ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {c.lastMessageText ? c.lastMessageText : <span className="italic opacity-50">Нет сообщений</span>}
                                    </p>
                                    {hasUnread && (
                                        <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                            {c.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        );
                    })}
                    {conversations.length === 0 && !convosLoading && <div className="p-10 text-center text-gray-400 text-sm italic">У вас пока нет переписок</div>}
                </div>
            </div>

            <div className={`w-full md:flex-1 flex flex-col h-full absolute inset-0 md:static z-30 bg-white dark:bg-gray-900 transition-transform duration-300 ${activeChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                {activeChat && activeConvo ? (
                    <>
                        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <button className="md:hidden text-gray-500 p-1" onClick={() => setActiveChat(null)}>
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <Link to={activeConvo.businessId && !activeConvo.partnerId.includes('-') ? `/business/${activeConvo.businessId}` : `/user/${activeConvo.partnerId}`} className="flex items-center gap-3 group">
                                    <img src={activeConvo.partnerAvatar || 'https://ui-avatars.com/api/?name=U'} className="w-10 h-10 rounded-full object-cover border-2 border-transparent dark:border-gray-700 group-hover:border-blue-500 transition-all" alt="" />
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 leading-none mb-1 group-hover:text-blue-600 transition-colors">
                                            {activeConvo.partnerName}
                                            {activeConvo.businessId && <ShoppingBag className="w-3 h-3 text-blue-500" />}
                                        </div>
                                        <UserStatus lastSeen={partnerProfile?.lastSeen} className="text-[10px] font-semibold" />
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-gray-950/50 custom-scrollbar">
                            {messages.map(m => (
                                <div key={m.id} className={`flex ${m.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm transition-opacity ${m.status === 'pending' ? 'opacity-70' : 'opacity-100'} ${m.senderId === currentUser?.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'}`}>
                                        {renderMessageContent(m)}
                                        <div className={`text-[8px] mt-1 font-bold uppercase tracking-widest text-right ${m.senderId === currentUser?.id ? 'text-blue-100/70' : 'text-gray-400'}`}>
                                            {m.status === 'pending' ? 'Отправка...' : m.createdAt ? new Date(m.createdAt.replace(' ', 'T')).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2 items-center shrink-0">
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-400 hover:text-blue-500 rounded-xl transition-all" disabled={uploading}>
                                {uploading ? <Loader2 className="animate-spin w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
                            </button>
                            <input 
                                type="text" 
                                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white text-sm"
                                placeholder="Напишите сообщение..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                            <button className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-90" disabled={!newMessage.trim() || sendMessageMutation.isPending}>
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30 dark:bg-gray-900/30">
                        <MessageCircle className="w-12 h-12 opacity-10 mb-4" />
                        <p className="font-bold uppercase tracking-widest text-xs">Выберите чат</p>
                    </div>
                )}
            </div>
        </div>
    );
};
