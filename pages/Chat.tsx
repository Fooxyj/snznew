
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Message, Conversation } from '../types';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Send, Loader2, MessageCircle, Paperclip, ChevronLeft, Trash2, ShoppingBag, X, Car, Check, Calendar, ArrowRight, Users, HelpCircle, Repeat, ShieldCheck, MapPin, Building2, Store, User as UserIcon, RefreshCw, Scale, ShieldAlert } from 'lucide-react';
import { UserStatus, Button } from '../components/ui/Common';

export const ChatPage: React.FC = () => {
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [chatFilter, setChatFilter] = useState<'personal' | 'business'>('personal');
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const [searchParams, setSearchParams] = useSearchParams();
    const urlChatId = searchParams.get('id');
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: currentUser } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    const { data: conversations = [], isLoading: convosLoading, refetch: refetchConvos } = useQuery({
        queryKey: ['conversations'],
        queryFn: api.getConversations,
        enabled: !!currentUser,
        refetchInterval: 5000 
    });

    // Разделение диалогов по категориям
    const personalChats = useMemo(() => conversations.filter(c => !c.businessId), [conversations]);
    const businessChats = useMemo(() => conversations.filter(c => !!c.businessId), [conversations]);

    const filteredConversations = chatFilter === 'personal' ? personalChats : businessChats;

    useEffect(() => {
        if (urlChatId && conversations.length > 0) {
            const convo = conversations.find(c => c.id === urlChatId);
            if (convo) {
                setActiveChat(urlChatId);
                setChatFilter(convo.businessId ? 'business' : 'personal');
            }
        }
    }, [urlChatId, conversations]);

    const activeConvo = useMemo(() => conversations.find(c => c.id === activeChat), [conversations, activeChat]);
    
    const isIAmBusinessOwner = useMemo(() => {
        return activeConvo && currentUser && activeConvo.businessOwnerId === currentUser.id;
    }, [activeConvo, currentUser]);

    const { data: partnerProfile } = useQuery({
        queryKey: ['publicUser', activeConvo?.partnerId],
        queryFn: () => api.getUserById(activeConvo!.partnerId),
        enabled: !!activeConvo?.partnerId && activeConvo.partnerId !== 'undefined'
    });

    const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
        queryKey: ['messages', activeChat],
        queryFn: () => api.getMessages(activeChat!),
        enabled: !!activeChat && activeChat !== 'undefined',
        refetchInterval: 3000 
    });

    const handleRefreshAll = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                refetchConvos(),
                activeChat ? refetchMessages() : Promise.resolve()
            ]);
            queryClient.invalidateQueries({ queryKey: ['chatUnread'] });
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    const sendMessageMutation = useMutation({
        mutationFn: (text: string) => {
            api.updateLastSeen();
            return api.sendMessage(activeChat!, text);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', activeChat] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });

    // Функция для очистки всех запросов на одну и ту же поездку в чате
    const markRideRequestsProcessed = async (rideId: string) => {
        const relatedMessages = messages.filter(m => {
            if (!m.text.startsWith('{')) return false;
            try {
                const data = JSON.parse(m.text);
                return data.type === 'ride_booking' && data.rideId === rideId && !data.processed;
            } catch (e) { return false; }
        });

        for (const m of relatedMessages) {
            try {
                const data = JSON.parse(m.text);
                data.processed = true;
                await api.updateMessage(m.id, JSON.stringify(data));
            } catch (e) {}
        }
    };

    const confirmRideMutation = useMutation({
        mutationFn: async ({ rideId, passengerId, seats }: { rideId: string, passengerId: string, seats: number }) => {
            await api.confirmRideBooking(rideId, passengerId, seats);
            // NEW: Помечаем все сообщения в текущем чате для этой поездки как обработанные
            await markRideRequestsProcessed(rideId);
            return { rideId };
        },
        onSuccess: () => {
            sendMessageMutation.mutate("✅ Я подтвердил ваше бронирование. До встречи!");
            queryClient.invalidateQueries({ queryKey: ['rides'] });
            queryClient.invalidateQueries({ queryKey: ['messages', activeChat] });
        },
        onError: (e: any) => alert(e.message)
    });

    const declineRide = async (rideId: string) => {
        await markRideRequestsProcessed(rideId);
        sendMessageMutation.mutate("Извините, я не могу подтвердить вашу поездку.");
        queryClient.invalidateQueries({ queryKey: ['messages', activeChat] });
    };

    const deleteMessageMutation = useMutation({
        mutationFn: (mid: string) => api.deleteMessage(mid),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', activeChat] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });

    const deleteConversationMutation = useMutation({
        mutationFn: (cid: string) => api.deleteConversation(cid),
        onSuccess: (_, cid) => {
            if (activeChat === cid) {
                setActiveChat(null);
                setSearchParams({});
            }
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
        if (messages.length > 0) scrollToBottom();
    }, [messages.length, scrollToBottom]);

    useEffect(() => {
        if (activeChat && activeChat !== 'undefined') {
            api.markMessagesAsRead(activeChat).then(() => {
                queryClient.invalidateQueries({ queryKey: ['chatUnread'] });
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            });
        }
    }, [activeChat, queryClient]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeChat || activeChat === 'undefined' || !newMessage.trim()) return;
        const txt = newMessage;
        setNewMessage('');
        sendMessageMutation.mutate(txt);
    };

    const handleDeleteMessage = (mid: string) => {
        if (confirm("Удалить это сообщение?")) {
            deleteMessageMutation.mutate(mid);
        }
    };

    const handleDeleteConversation = (e: React.MouseEvent, cid: string) => {
        e.stopPropagation();
        if (confirm("Вы действительно хотите удалить этот диалог? Это удалит запись о переписке из вашего списка.")) {
            deleteConversationMutation.mutate(cid);
        }
    };

    const navigateToProfile = (e: React.MouseEvent, userId: string) => {
        e.stopPropagation();
        navigate(`/user/${userId}`);
    };

    const renderMessageContent = (m: Message) => {
        if (m.text.startsWith('http') && (m.text.includes('supabase') || m.text.includes('unsplash'))) {
            return <img src={m.text} alt="" className="rounded-2xl max-h-80 w-full object-cover shadow-sm border dark:border-gray-700" />;
        }

        if (m.text.startsWith('{')) {
            try {
                const data = JSON.parse(m.text);
                
                if (data.type === 'ride_booking') {
                    const isIncoming = m.senderId !== currentUser?.id;
                    const isProcessed = data.processed === true;

                    return (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl border dark:border-gray-700 overflow-hidden shadow-sm w-full max-w-[300px] my-1 animate-fade-in">
                            <div className="p-3 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center gap-2">
                                <Car className="w-4 h-4 text-blue-500" />
                                <span className="font-black text-[9px] uppercase tracking-widest text-gray-500">Запрос поездки</span>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2 font-bold text-sm dark:text-white uppercase tracking-tight">
                                    <span>{data.fromCity}</span>
                                    <ArrowRight className="w-3 h-3 text-gray-300" />
                                    <span>{data.toCity}</span>
                                </div>
                                <div className="space-y-1 text-[10px] text-gray-400 font-bold uppercase">
                                    <div className="flex items-center gap-2"><Calendar className="w-3 h-3 text-blue-400" /> {new Date(data.date).toLocaleDateString()} в {data.time}</div>
                                    <div className="flex items-center gap-2"><Users className="w-3 h-3 text-blue-400" /> Мест: {data.requestedSeats || 1}</div>
                                </div>
                                
                                {isIncoming && !isProcessed && (
                                    <div className="pt-3 flex gap-2">
                                        <button 
                                            onClick={() => confirmRideMutation.mutate({ 
                                                rideId: data.rideId, 
                                                passengerId: m.senderId, 
                                                seats: data.requestedSeats || 1
                                            })}
                                            disabled={confirmRideMutation.isPending}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                                        >
                                            {confirmRideMutation.isPending ? '...' : 'Одобрить'}
                                        </button>
                                        <button 
                                            onClick={() => declineRide(data.rideId)}
                                            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                        >
                                            Отклонить
                                        </button>
                                    </div>
                                )}
                                {isProcessed && (
                                    <div className="pt-2 text-center border-t dark:border-gray-700 mt-2">
                                        <span className="text-[9px] font-black uppercase text-green-600 dark:text-green-400 tracking-widest italic flex items-center justify-center gap-1">
                                            <Check className="w-3 h-3" /> Запрос обработан
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }

                if (['rental_inquiry', 'ad_inquiry', 'lost_found_inquiry', 'product_inquiry', 'service_inquiry', 'ride_inquiry'].includes(data.type)) {
                    const label = data.type === 'rental_inquiry' ? 'ПРОКАТ' : 
                                  data.type === 'lost_found_inquiry' ? 'БЮРО НАХОДОК' : 
                                  ['service_inquiry', 'product_inquiry'].includes(data.type) ? 'БИЗНЕС-КАТАЛОГ' : 'ОБЪЯВЛЕНИЕ';
                    
                    const path = data.type === 'rental_inquiry' ? '/rentals' : 
                                 data.type === 'lost_found_inquiry' ? '/lost-found' : 
                                 ['service_inquiry', 'product_inquiry'].includes(data.type) ? `/business/${data.businessId}` :
                                 (data.adId ? `/ad/${data.adId}` : '/classifieds');

                    return (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden shadow-sm w-full max-w-[280px] my-1 group transition-all">
                            <div className="aspect-video relative overflow-hidden bg-white dark:bg-gray-950">
                                <img src={data.image || 'https://via.placeholder.com/300'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                                    {label}
                                </div>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                {data.businessName && (
                                    <div className="flex items-center gap-1 text-[8px] font-black text-blue-600 uppercase tracking-widest">
                                        <Building2 className="w-2.5 h-2.5" /> {data.businessName}
                                    </div>
                                )}
                                <h5 className="font-bold text-xs dark:text-white uppercase leading-tight line-clamp-1">{data.title || 'Предмет'}</h5>
                                {data.price && <p className="text-blue-600 dark:text-blue-400 font-black text-sm">{data.price}</p>}
                                <Link to={path} className="block w-full py-2.5 bg-white dark:bg-gray-900 hover:bg-blue-600 hover:text-white border dark:border-gray-700 text-[9px] font-black uppercase tracking-widest text-center rounded-xl transition-all active:scale-95">
                                    Посмотреть
                                </Link>
                            </div>
                        </div>
                    );
                }
            } catch (e) { }
        }

        return <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{m.text}</p>;
    };

    if (convosLoading) return <div className="flex h-full items-center justify-center bg-white dark:bg-gray-900"><Loader2 className="animate-spin text-blue-600 w-12 h-12" /></div>;

    return (
        <div className="flex-1 flex bg-white dark:bg-gray-900 overflow-hidden h-full relative">
            {/* Sidebar */}
            <div className={`w-full md:w-80 border-r dark:border-gray-800 flex flex-col h-full absolute inset-0 md:static z-20 bg-white dark:bg-gray-900 transition-transform duration-300 ${activeChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                <div className="p-6 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-black text-2xl dark:text-white tracking-tighter uppercase">Сообщения</h2>
                        <button 
                            onClick={handleRefreshAll}
                            disabled={isRefreshing}
                            className={`p-2 text-gray-400 hover:text-blue-600 transition-all rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 ${isRefreshing ? 'animate-spin' : ''}`}
                            title="Обновить список"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-2xl">
                        <button 
                            onClick={() => setChatFilter('personal')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${chatFilter === 'personal' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-500'}`}
                        >
                            <UserIcon className="w-3.5 h-3.5" /> Личные {personalChats.length > 0 && <span className="opacity-50">({personalChats.length})</span>}
                        </button>
                        <button 
                            onClick={() => setChatFilter('business')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${chatFilter === 'business' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-500'}`}
                        >
                            <Store className="w-3.5 h-3.5" /> Бизнес {businessChats.length > 0 && <span className="opacity-50">({businessChats.length})</span>}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredConversations.map(c => {
                        const amIOwner = currentUser && c.businessOwnerId === currentUser.id;
                        return (
                        <div 
                            key={c.id} 
                            onClick={() => { setActiveChat(c.id); setSearchParams({id: c.id}); }}
                            className={`p-5 border-b dark:border-gray-800 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 flex items-center gap-4 transition-all group ${activeChat === c.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        >
                            <div className="relative shrink-0" onClick={(e) => navigateToProfile(e, c.partnerId)}>
                                <img src={c.partnerAvatar || 'https://ui-avatars.com/api/?name=U'} className="w-12 h-12 rounded-2xl object-cover bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 shadow-sm hover:ring-2 hover:ring-blue-500 transition-all" alt="" />
                                {c.businessId && (
                                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-lg border-2 border-white dark:border-gray-900 shadow-lg">
                                        <Store className="w-2.5 h-2.5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-sm font-black dark:text-white truncate uppercase tracking-tight flex items-center gap-1.5 hover:text-blue-600 transition-colors" onClick={(e) => navigateToProfile(e, c.partnerId)}>
                                        {amIOwner ? c.partnerName : (c.businessName || c.partnerName)}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter shrink-0">{c.lastMessageDate}</span>
                                        <button 
                                            onClick={(e) => handleDeleteConversation(e, c.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                            title="Удалить диалог"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                {c.businessName && (
                                    <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1 opacity-70 truncate">
                                        {amIOwner ? 'Ваш клиент' : `Магазин: ${c.partnerName}`}
                                    </p>
                                )}
                                <p className={`text-xs truncate ${ (c.unreadCount || 0) > 0 ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {c.lastMessageText}
                                </p>
                            </div>
                        </div>
                    )})}
                    {filteredConversations.length === 0 && (
                        <div className="p-10 text-center flex flex-col items-center gap-3 mt-10">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center text-gray-200 dark:text-gray-700">
                                {chatFilter === 'personal' ? <UserIcon className="w-8 h-8" /> : <Store className="w-8 h-8" />}
                            </div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-relaxed max-w-[160px]">
                                {chatFilter === 'personal' ? 'Нет личных переписок' : 'Нет чатов с магазинами'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`w-full md:flex-1 flex flex-col h-full absolute inset-0 md:static z-30 bg-white dark:bg-gray-900 transition-transform duration-300 ${activeChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                {activeChat && activeConvo ? (
                    <>
                        <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-sm z-10 shrink-0">
                            <div className="flex items-center gap-4">
                                <button className="md:hidden text-gray-400 p-2" onClick={() => { setActiveChat(null); setSearchParams({}); }}>
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <img 
                                    src={activeConvo.partnerAvatar || 'https://ui-avatars.com/api/?name=U'} 
                                    className="w-10 h-10 rounded-xl object-cover shadow-md border-2 border-white dark:border-gray-800 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all" 
                                    alt="" 
                                    onClick={(e) => navigateToProfile(e, activeConvo.partnerId)}
                                />
                                <div>
                                    <div 
                                        className="font-black text-sm dark:text-white uppercase tracking-tighter leading-none mb-1 flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
                                        onClick={(e) => navigateToProfile(e, activeConvo.partnerId)}
                                    >
                                        {isIAmBusinessOwner ? activeConvo.partnerName : (activeConvo.businessName || activeConvo.partnerName)}
                                        {activeConvo.businessName && <Store className="w-4 h-4 text-blue-500" />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UserStatus lastSeen={partnerProfile?.lastSeen} className="text-[9px] font-black tracking-widest opacity-70" />
                                        {activeConvo.businessId && (
                                            <span className="text-[8px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                {isIAmBusinessOwner ? 'Покупатель' : `Сотрудник: ${activeConvo.partnerName}`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => handleDeleteConversation(e, activeChat)}
                                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                                    title="Удалить весь чат"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 custom-scrollbar bg-white dark:bg-gray-900">
                            {/* Safety Notice */}
                            <div className="mx-auto max-w-md bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-3 mb-4">
                                <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <div className="text-[10px] text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                                    <span className="font-black uppercase tracking-widest block mb-1">Совет по безопасности</span>
                                    Не переводите предоплату. Платформа является информационным посредником и не гарантирует успех сделки. <Link to="/legal" className="underline font-bold">Правила сервиса</Link>.
                                </div>
                            </div>

                            {messages.length === 0 && !messagesLoading && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50 animate-pulse">
                                    <MessageCircle className="w-12 h-12 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Сообщений нет</p>
                                </div>
                            )}
                            {messages.map(m => {
                                const isSystem = m.text.startsWith('{');
                                const isMine = m.senderId === currentUser?.id;
                                return (
                                    <div key={m.id} className={`flex items-end gap-2 group ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        {isMine && !isSystem && (
                                            <button 
                                                onClick={() => handleDeleteMessage(m.id)}
                                                className="mb-2 opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                title="Удалить сообщение"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <div className={`max-w-[85%] px-4 py-2.5 rounded-[1.25rem] transition-all ${
                                            isSystem 
                                                ? 'bg-transparent border-none shadow-none p-0' 
                                                : isMine 
                                                    ? 'bg-blue-600 text-white rounded-tr-none shadow-sm' 
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border dark:border-gray-700 shadow-sm'
                                        }`}>
                                            {renderMessageContent(m)}
                                            {!isSystem && (
                                                <div className={`text-[8px] mt-1 font-black uppercase tracking-widest text-right ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                                                    {new Date(m.createdAt.replace(' ', 'T')).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Row */}
                        <div className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 p-4 pb-6 md:pb-4 shrink-0 z-40">
                            <form onSubmit={handleSend} className="flex gap-3 items-center">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async (e) => {
                                    const file = e.target.files?.[0]; if (!file) return; setUploading(true);
                                    try { const url = await api.uploadImage(file); sendMessageMutation.mutate(url); } catch(e) { alert("Ошибка"); } finally { setUploading(false); }
                                }} />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-blue-500 bg-gray-50 dark:bg-gray-800 rounded-2xl transition-all" disabled={uploading}>
                                    {uploading ? <Loader2 className="animate-spin w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
                                </button>
                                <input 
                                    type="text" 
                                    className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-[1.25rem] px-5 py-3.5 focus:ring-4 focus:ring-blue-500/5 outline-none dark:text-white text-sm font-medium transition-all"
                                    placeholder="Сообщение..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                />
                                <button className="bg-blue-600 text-white p-3.5 rounded-[1.25rem] hover:bg-blue-700 disabled:opacity-30 transition-all shadow-xl shadow-blue-500/20 active:scale-90" disabled={!newMessage.trim() || sendMessageMutation.isPending}>
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center bg-white dark:bg-gray-900">
                        <MessageCircle className="w-20 h-20 opacity-5 mb-6" />
                        <p className="font-black uppercase tracking-[0.3em] text-[10px]">Выберите диалог для общения</p>
                    </div>
                )}
            </div>
        </div>
    );
};
