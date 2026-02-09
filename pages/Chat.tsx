
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Message, Conversation } from '../types';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
    Send, Loader2, MessageCircle, ChevronLeft, Trash2, 
    Check, CheckCheck, Briefcase, Star, User, 
    Image as ImageIcon, X,
    CheckCircle2, Circle, MoreVertical, Copy, Reply, Share, Forward, 
    ExternalLink, ShoppingBag, Car, Info
} from 'lucide-react';
import { Img } from '../components/ui/Image';
import { ImageViewer } from '../components/ImageViewer';
import { Button } from '../components/ui/Common';

// --- Компонент для парсинга и отображения карточек в сообщениях ---
const MessageContent: React.FC<{ text: string; isSelf: boolean }> = ({ text, isSelf }) => {
    const navigate = useNavigate();

    const parsedData = useMemo(() => {
        const trimmed = text?.trim() || "";
        if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null;
        try {
            return JSON.parse(trimmed);
        } catch (e) {
            return null;
        }
    }, [text]);

    if (!parsedData) {
        return <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap break-words">{text}</p>;
    }

    // Рендеринг карточки объявления
    if (parsedData.type === 'ad_inquiry') {
        return (
            <div className={`flex flex-col gap-3 rounded-xl overflow-hidden border ${isSelf ? 'bg-white/10 border-white/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'} p-3 max-w-[280px]`}>
                <div className="flex gap-3 items-start">
                    <img src={parsedData.image} className="w-16 h-16 rounded-lg object-cover bg-gray-200 shrink-0" alt="" />
                    <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase text-blue-500 mb-0.5 tracking-widest">Объявление</div>
                        <div className={`text-xs font-bold truncate ${isSelf ? 'text-white' : 'dark:text-white'}`}>{parsedData.title}</div>
                        <div className="text-sm font-black text-blue-600 mt-1">{parsedData.price}</div>
                    </div>
                </div>
                <div className={`text-xs p-2 rounded-lg italic ${isSelf ? 'bg-black/20' : 'bg-white dark:bg-gray-800'}`}>
                    "{parsedData.text}"
                </div>
                <button 
                    onClick={() => navigate(`/ad/${parsedData.adId}`)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                    <ExternalLink className="w-3 h-3" /> Посмотреть на маркете
                </button>
            </div>
        );
    }

    // Рендеринг карточки вакансии
    if (parsedData.type === 'vacancy_apply') {
        return (
            <div className={`flex flex-col gap-3 rounded-xl overflow-hidden border ${isSelf ? 'bg-white/10 border-white/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'} p-3 max-w-[280px]`}>
                <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <div className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Отклик на вакансию</div>
                </div>
                <div className="min-w-0">
                    <div className={`text-sm font-bold ${isSelf ? 'text-white' : 'dark:text-white'}`}>{parsedData.title}</div>
                    <div className="text-[11px] text-gray-400 font-bold uppercase">{parsedData.company}</div>
                </div>
                <div className={`text-xs p-2 rounded-lg italic ${isSelf ? 'bg-black/20' : 'bg-white dark:bg-gray-800'}`}>
                    "{parsedData.text}"
                </div>
            </div>
        );
    }

    // Рендеринг карточки поездки
    if (parsedData.type === 'ride_booking') {
        return (
            <div className={`flex flex-col gap-3 rounded-xl overflow-hidden border ${isSelf ? 'bg-white/10 border-white/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'} p-3 max-w-[280px]`}>
                <div className="flex items-center gap-2 mb-1">
                    <Car className="w-4 h-4 text-blue-500" />
                    <div className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Бронь поездки</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-black/5 dark:bg-white/5 p-1.5 rounded-lg">
                        <div className="text-[8px] font-black uppercase opacity-50">Дата</div>
                        <div className="text-[10px] font-bold">{parsedData.date}</div>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-1.5 rounded-lg">
                        <div className="text-[8px] font-black uppercase opacity-50">Места</div>
                        <div className="text-[10px] font-bold">{parsedData.requestedSeats}</div>
                    </div>
                </div>
                <div className={`text-[11px] font-bold flex items-center justify-between ${isSelf ? 'text-white' : 'dark:text-white'}`}>
                    <span>{parsedData.fromCity} → {parsedData.toCity}</span>
                    <span className="text-blue-600">{parsedData.price}</span>
                </div>
            </div>
        );
    }

    return <p className="text-sm font-medium opacity-50 italic">[Системное сообщение]</p>;
};

export const ChatPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlChatId = searchParams.get('id');
    
    const [activeChat, setActiveChat] = useState<string | null>(urlChatId);
    const [newMessage, setNewMessage] = useState('');
    const [chatFilter, setChatFilter] = useState<'personal' | 'business'>('personal');
    
    // Selection States
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const longPressTimer = useRef<any>(null);
    
    // Media States
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);
    const [viewerImage, setViewerImage] = useState<string | null>(null);
    
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: currentUser } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });

    const { data: conversations = [], isLoading: convosLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: api.getConversations,
        enabled: !!currentUser,
        refetchInterval: 5000 
    });

    const { data: activeConvoMetadata, isLoading: activeConvoLoading } = useQuery({
        queryKey: ['conversation', activeChat],
        queryFn: () => api.getConversationById(activeChat!),
        enabled: !!activeChat
    });

    const activeConvo = useMemo(() => {
        const found = conversations.find(c => c.id === activeChat);
        return found || activeConvoMetadata;
    }, [conversations, activeChat, activeConvoMetadata]);

    const isActingAsBusiness = useMemo(() => {
        return activeConvo?.businessId && activeConvo?.businessOwnerId === currentUser?.id;
    }, [activeConvo, currentUser]);

    // Read logic
    useEffect(() => {
        if (activeChat && currentUser) {
            api.markMessagesAsRead(activeChat).then(() => {
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                queryClient.invalidateQueries({ queryKey: ['chatUnread'] });
            });
        }
    }, [activeChat, queryClient, currentUser]);

    const handleSelectChat = (id: string) => {
        setActiveChat(id);
        setIsSelectMode(false);
        setSelectedIds([]);
        setSearchParams({ id });
    };

    const { data: messages = [] } = useQuery({
        queryKey: ['messages', activeChat],
        queryFn: () => api.getMessages(activeChat!),
        enabled: !!activeChat,
        refetchInterval: 3000 
    });

    // --- Selection & Long Press Logic ---
    const startLongPress = (id: string) => {
        if (isSelectMode) return;
        longPressTimer.current = setTimeout(() => {
            setIsSelectMode(true);
            toggleSelectMessage(id);
            if (window.navigator.vibrate) window.navigator.vibrate(50);
        }, 500);
    };

    const clearLongPress = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const toggleSelectMessage = (mid: string) => {
        setSelectedIds(prev => {
            const next = prev.includes(mid) ? prev.filter(i => i !== mid) : [...prev, mid];
            if (next.length === 0) setIsSelectMode(false);
            return next;
        });
    };

    const handleDeleteSelected = async (mode: 'forMe' | 'forEveryone') => {
        if (selectedIds.length === 0) return;
        
        const myMessagesInSelection = mode === 'forEveryone' 
            ? messages.filter(m => selectedIds.includes(m.id) && m.senderId === currentUser?.id)
            : selectedIds;

        if (mode === 'forEveryone' && myMessagesInSelection.length === 0) {
            alert("Вы можете удалять 'Для всех' только свои сообщения.");
            return;
        }

        const confirmMsg = mode === 'forEveryone' 
            ? `Удалить ${myMessagesInSelection.length} ваших сообщ. для всех?`
            : `Скрыть ${selectedIds.length} сообщ. у себя?`;

        if (confirm(confirmMsg)) {
            try {
                const idsToDelete = mode === 'forEveryone' 
                    ? (myMessagesInSelection as any[]).map((m: any) => m.id)
                    : selectedIds;
                
                await api.deleteMessages(idsToDelete, mode);
                queryClient.invalidateQueries({ queryKey: ['messages', activeChat] });
                setIsSelectMode(false);
                setSelectedIds([]);
            } catch (e: any) { alert(e.message); }
        }
    };

    const handleCopy = () => {
        const text = messages
            .filter(m => selectedIds.includes(m.id))
            .map(m => m.text)
            .filter(Boolean)
            .join('\n');
        
        if (text) {
            navigator.clipboard.writeText(text);
            setIsSelectMode(false);
            setSelectedIds([]);
            alert("Текст скопирован");
        }
    };

    const handleForward = () => {
        alert("Функция пересылки будет доступна в следующем обновлении Простора!");
        setIsSelectMode(false);
        setSelectedIds([]);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeChat) return;
        setIsUploadingMedia(true);
        try {
            const url = await api.uploadChatFile(file);
            await api.sendMessage(activeChat, '', url);
            queryClient.invalidateQueries({ queryKey: ['messages', activeChat] });
        } catch (e: any) { alert(e.message); }
        finally { setIsUploadingMedia(false); }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeChat || !newMessage.trim()) return;
        const text = newMessage;
        setNewMessage('');
        try {
            await api.sendMessage(activeChat, text);
            queryClient.invalidateQueries({ queryKey: ['messages', activeChat] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        } catch (e: any) { alert(e.message); }
    };

    const handleDeleteConversation = async (e: React.MouseEvent, cid: string) => {
        e.stopPropagation();
        if (confirm("Скрыть этот диалог из вашего списка? История сообщений будет удалена для вас.")) {
            try {
                await api.deleteConversation(cid);
                if (activeChat === cid) {
                    setActiveChat(null);
                    setSearchParams({});
                }
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            } catch (e: any) { alert(e.message); }
        }
    };

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages, activeChat]);

    const filteredConversations = useMemo(() => {
        return conversations.filter(c => chatFilter === 'personal' ? !c.businessId : !!c.businessId);
    }, [conversations, chatFilter]);

    return (
        <div className="flex-1 flex bg-white dark:bg-gray-900 overflow-hidden h-[calc(100vh-64px)] lg:h-full relative">
            <ImageViewer isOpen={!!viewerImage} onClose={() => setViewerImage(null)} src={viewerImage || ''} />

            {/* Sidebar (List of Chats) */}
            <div className={`absolute inset-0 md:relative md:flex w-full md:w-80 border-r dark:border-gray-800 flex flex-col h-full bg-white dark:bg-gray-900 transition-transform duration-300 z-20 ${activeChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                <div className="p-6 border-b dark:border-gray-800 shrink-0">
                    <h2 className="font-black text-2xl dark:text-white tracking-tighter uppercase mb-4">Сообщения</h2>
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                        <button onClick={() => setChatFilter('personal')} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${chatFilter === 'personal' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}>Личные</button>
                        <button onClick={() => setChatFilter('business')} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${chatFilter === 'business' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}>Бизнес</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {convosLoading ? (
                        <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 opacity-20">
                            <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Диалогов нет</p>
                        </div>
                    ) : (
                        filteredConversations.map(c => (
                            <div key={c.id} onClick={() => handleSelectChat(c.id)} className={`p-5 border-b dark:border-gray-800 cursor-pointer hover:bg-blue-50/50 flex items-center gap-4 transition-all group/item ${activeChat === c.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                <div className="relative shrink-0">
                                    <img src={c.partnerAvatar || 'https://ui-avatars.com/api/?name=U'} className="w-12 h-12 rounded-2xl object-cover bg-gray-100 shadow-sm" />
                                    {c.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black border-2 border-white dark:border-gray-900">{c.unreadCount}</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-sm font-black dark:text-white truncate uppercase tracking-tight">{c.partnerName}</h4>
                                        <span className="text-[8px] font-black text-gray-400 uppercase shrink-0">{c.lastMessageDate}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <p className="text-xs truncate text-gray-500 font-medium">{c.lastMessageText}</p>
                                        <button 
                                            onClick={(e) => handleDeleteConversation(e, c.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-all shrink-0 bg-gray-50 dark:bg-gray-800 rounded-lg md:opacity-0 group-hover/item:opacity-100"
                                            title="Удалить диалог"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area (Active Window) */}
            <div className={`absolute inset-0 md:relative md:flex w-full md:flex-1 flex flex-col h-full bg-white dark:bg-gray-900 transition-transform duration-300 z-30 ${activeChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                {activeChat ? (
                    <>
                        <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shrink-0 z-10">
                            <div className="flex items-center gap-3">
                                <button className="md:hidden p-2 -ml-2" onClick={() => { setActiveChat(null); setSearchParams({}); }}><ChevronLeft className="w-6 h-6 text-gray-400"/></button>
                                <div className="flex items-center gap-3">
                                    <img src={activeConvo?.partnerAvatar || 'https://ui-avatars.com/api/?name=U'} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                                    <div className="flex flex-col">
                                        <div className="font-black text-sm uppercase dark:text-white leading-none truncate max-w-[150px]">{activeConvo?.partnerName || '...'}</div>
                                        {isActingAsBusiness && <div className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1">Клиент компании</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isSelectMode ? (
                                    <button 
                                        onClick={() => { setIsSelectMode(false); setSelectedIds([]); }}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-[10px] font-black uppercase rounded-xl dark:text-white hover:bg-gray-200 transition-colors"
                                    >
                                        Отмена
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setIsSelectMode(true)}
                                        className="px-4 py-2 text-blue-600 text-[10px] font-black uppercase hover:bg-blue-50 rounded-xl transition-all"
                                    >
                                        Выбрать
                                    </button>
                                )}
                            </div>
                        </div>

                        <div 
                            ref={messageContainerRef} 
                            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#F8FAFC] dark:bg-gray-950"
                        >
                            {messages.map(m => {
                                const isSelf = m.senderId === currentUser?.id;
                                const isSelected = selectedIds.includes(m.id);
                                return (
                                    <div 
                                        key={m.id} 
                                        onMouseDown={() => startLongPress(m.id)}
                                        onMouseUp={clearLongPress}
                                        onMouseLeave={clearLongPress}
                                        onTouchStart={() => startLongPress(m.id)}
                                        onTouchEnd={clearLongPress}
                                        onContextMenu={(e) => e.preventDefault()}
                                        onClick={() => isSelectMode && toggleSelectMessage(m.id)}
                                        className={`flex gap-3 ${isSelf ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 ${isSelectMode ? 'cursor-pointer' : ''}`}
                                    >
                                        {!isSelf && isSelectMode && (
                                            <div className="flex items-center pr-1">
                                                {isSelected ? <CheckCircle2 className="w-5 h-5 text-blue-600" /> : <Circle className="w-5 h-5 text-gray-300" />}
                                            </div>
                                        )}
                                        <div className={`max-w-[90%] md:max-w-[75%] p-3.5 rounded-2xl relative shadow-sm transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-950 scale-95 opacity-80' : ''} ${isSelf ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 dark:text-white rounded-tl-none border dark:border-gray-700'}`}>
                                            
                                            {m.imageUrl && (
                                                <div 
                                                    className="mb-3 rounded-xl overflow-hidden border dark:border-gray-700 max-w-full cursor-zoom-in active:scale-95 transition-transform"
                                                    onClick={(e) => { e.stopPropagation(); !isSelectMode && setViewerImage(m.imageUrl || null); }}
                                                >
                                                    <img src={m.imageUrl} className="w-full h-auto object-cover max-h-[300px]" alt="" />
                                                </div>
                                            )}

                                            <MessageContent text={m.text} isSelf={isSelf} />
                                            
                                            <div className="flex items-center justify-end gap-1 mt-1.5">
                                                <div className={`text-[8px] font-black uppercase opacity-40`}>
                                                    {new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </div>
                                                {isSelf && (
                                                    <div className="flex items-center">
                                                        {m.isRead ? (
                                                            <CheckCheck className="w-3 h-3 text-blue-100" />
                                                        ) : (
                                                            <Check className="w-3 h-3 text-blue-100 opacity-50" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {isSelf && isSelectMode && (
                                            <div className="flex items-center pl-1">
                                                {isSelected ? <CheckCircle2 className="w-5 h-5 text-blue-600" /> : <Circle className="w-5 h-5 text-gray-300" />}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {isSelectMode ? (
                            <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-2 animate-in slide-in-from-bottom-4 shadow-2xl relative z-20 overflow-x-auto pb-safe">
                                <button onClick={handleCopy} className="flex-1 min-w-[70px] bg-gray-50 dark:bg-gray-800 rounded-2xl py-3 flex flex-col items-center justify-center gap-1 disabled:opacity-30" disabled={selectedIds.length === 0}>
                                    <Copy className="w-4 h-4 text-gray-500" /><span className="text-[8px] font-black uppercase text-gray-400">Копир.</span>
                                </button>
                                <button onClick={handleForward} className="flex-1 min-w-[70px] bg-gray-50 dark:bg-gray-800 rounded-2xl py-3 flex flex-col items-center justify-center gap-1 disabled:opacity-30" disabled={selectedIds.length === 0}>
                                    <Forward className="w-4 h-4 text-gray-500" /><span className="text-[8px] font-black uppercase text-gray-400">Пересл.</span>
                                </button>
                                <button onClick={() => handleDeleteSelected('forMe')} className="flex-1 min-w-[70px] bg-orange-50 dark:bg-orange-900/20 rounded-2xl py-3 flex flex-col items-center justify-center gap-1 disabled:opacity-30" disabled={selectedIds.length === 0}>
                                    <Trash2 className="w-4 h-4 text-orange-600" /><span className="text-[8px] font-black uppercase text-orange-600">Скрыть</span>
                                </button>
                                <button onClick={() => handleDeleteSelected('forEveryone')} className="flex-1 min-w-[70px] bg-red-600 rounded-2xl py-3 flex flex-col items-center justify-center gap-1 disabled:opacity-30" disabled={selectedIds.length === 0}>
                                    <Trash2 className="w-4 h-4 text-white" /><span className="text-[8px] font-black uppercase text-white">Всем</span>
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 pb-safe">
                                <form onSubmit={handleSend} className="flex items-end gap-2">
                                    <div className="relative shrink-0 mb-1">
                                        <button type="button" className="p-3 text-gray-400 hover:text-blue-600 transition-colors"><ImageIcon className="w-6 h-6"/></button>
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                                    </div>

                                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-[1.5rem] px-5 py-3.5 flex items-end">
                                        <textarea 
                                            rows={1}
                                            className="flex-1 bg-transparent border-none outline-none dark:text-white font-medium text-base md:text-sm py-0.5 resize-none max-h-32 custom-scrollbar" 
                                            placeholder="Сообщение..." 
                                            value={newMessage} 
                                            onChange={e => {
                                                setNewMessage(e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                                            }}
                                        />
                                    </div>

                                    <button type="submit" disabled={!newMessage.trim() || isUploadingMedia} className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-500/30 active:scale-90 transition-all mb-0.5 disabled:opacity-50">
                                        {isUploadingMedia ? <Loader2 className="w-6 h-6 animate-spin"/> : <Send className="w-6 h-6"/>}
                                    </button>
                                </form>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="hidden md:flex flex-1 flex flex-col items-center justify-center text-gray-400 h-full">
                        <MessageCircle className="w-20 h-20 opacity-10 mb-4"/>
                        <p className="font-black uppercase text-[10px] tracking-widest">Выберите диалог для общения</p>
                    </div>
                )}
            </div>
        </div>
    );
};
