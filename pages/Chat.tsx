
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Message, Conversation } from '../types';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
    Send, Loader2, MessageCircle, ChevronLeft, Trash2, 
    Check, CheckCheck, Briefcase, Star, User, 
    Image as ImageIcon, Mic, X, Play, Pause, Square,
    CheckCircle2, Circle, MoreVertical, Copy, Reply, Share, Forward
} from 'lucide-react';
import { Img } from '../components/ui/Image';
import { ImageViewer } from '../components/ImageViewer';
import { Button } from '../components/ui/Common';

// --- Sub-component for Audio Messages ---
const AudioPlayer: React.FC<{ url: string; isSelf: boolean }> = ({ url, isSelf }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
    };

    return (
        <div className={`flex items-center gap-3 p-2 rounded-xl ${isSelf ? 'bg-white/10' : 'bg-gray-200 dark:bg-gray-700'} min-w-[180px]`}>
            <audio 
                ref={audioRef} 
                src={url} 
                onPlay={() => setIsPlaying(true)} 
                onPause={() => setIsPlaying(false)} 
                onTimeUpdate={() => setProgress(audioRef.current ? (audioRef.current.currentTime / audioRef.current.duration) * 100 : 0)}
            />
            <button onClick={togglePlay} className={`p-2 rounded-full ${isSelf ? 'bg-white text-blue-600' : 'bg-blue-600 text-white shadow-sm'}`}>
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full transition-all ${isSelf ? 'bg-white' : 'bg-blue-600'}`} style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-[10px] font-bold opacity-60">VOICE</span>
        </div>
    );
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
    const [isRecording, setIsRecording] = useState(false);
    const [recordTime, setRecordTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);
    const [viewerImage, setViewerImage] = useState<string | null>(null);
    
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const recordTimerRef = useRef<any>(null);
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
        
        // В режиме "для всех" можем удалять только свои сообщения
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

    // --- Audio Recording Logic ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setIsUploadingMedia(true);
                try {
                    const audioUrl = await api.uploadChatFile(blob, 'webm');
                    await api.sendMessage(activeChat!, '', undefined, audioUrl);
                    queryClient.invalidateQueries({ queryKey: ['messages', activeChat] });
                } catch (e: any) { alert(e.message); }
                finally { setIsUploadingMedia(false); }
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordTime(0);
            recordTimerRef.current = setInterval(() => setRecordTime(prev => prev + 1), 1000);
        } catch (e) {
            alert("Разрешите доступ к микрофону для записи голосовых сообщений.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
            clearInterval(recordTimerRef.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.onstop = () => {}; 
            mediaRecorder.stop();
            setIsRecording(false);
            clearInterval(recordTimerRef.current);
            setMediaRecorder(null);
        }
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
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
    }, [messages]);

    const filteredConversations = useMemo(() => {
        return conversations.filter(c => chatFilter === 'personal' ? !c.businessId : !!c.businessId);
    }, [conversations, chatFilter]);

    return (
        <div className="flex-1 flex bg-white dark:bg-gray-900 overflow-hidden h-full relative">
            <ImageViewer isOpen={!!viewerImage} onClose={() => setViewerImage(null)} src={viewerImage || ''} />

            {/* Sidebar */}
            <div className={`w-full md:w-80 border-r dark:border-gray-800 flex flex-col h-full bg-white dark:bg-gray-900 transition-transform ${activeChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
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

            {/* Chat Area */}
            <div className={`w-full md:flex-1 flex flex-col h-full bg-white dark:bg-gray-900 transition-transform ${activeChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                {activeChat ? (
                    <>
                        <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shrink-0 z-10">
                            <div className="flex items-center gap-4">
                                <button className="md:hidden p-2" onClick={() => { setActiveChat(null); setSearchParams({}); }}><ChevronLeft className="w-6 h-6 text-gray-400"/></button>
                                <div className="flex items-center gap-3">
                                    <img src={activeConvo?.partnerAvatar || 'https://ui-avatars.com/api/?name=U'} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                                    <div className="flex flex-col">
                                        <div className="font-black text-sm uppercase dark:text-white leading-none">{activeConvo?.partnerName || 'Загрузка...'}</div>
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
                                        <div className={`max-w-[85%] p-4 rounded-2xl relative shadow-sm transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-950 scale-95 opacity-80' : ''} ${isSelf ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 dark:text-white rounded-tl-none border dark:border-gray-700'}`}>
                                            
                                            {m.imageUrl && (
                                                <div 
                                                    className="mb-3 rounded-xl overflow-hidden border dark:border-gray-700 max-w-[240px] cursor-zoom-in active:scale-95 transition-transform"
                                                    onClick={(e) => { e.stopPropagation(); !isSelectMode && setViewerImage(m.imageUrl || null); }}
                                                >
                                                    <img src={m.imageUrl} className="w-full h-auto object-cover" />
                                                </div>
                                            )}

                                            {m.audioUrl && (
                                                <div className="mb-2" onClick={e => e.stopPropagation()}>
                                                    <AudioPlayer url={m.audioUrl} isSelf={isSelf} />
                                                </div>
                                            )}

                                            {m.text && <p className="text-sm leading-relaxed font-medium">{m.text}</p>}
                                            
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
                            <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-3 animate-in slide-in-from-bottom-4 shadow-2xl relative z-20">
                                <button 
                                    onClick={handleCopy}
                                    className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl py-4 flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition-all disabled:opacity-30"
                                    disabled={selectedIds.length === 0}
                                >
                                    <Copy className="w-4 h-4 text-gray-500" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Копировать</span>
                                </button>
                                <button 
                                    onClick={handleForward}
                                    className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl py-4 flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition-all disabled:opacity-30"
                                    disabled={selectedIds.length === 0}
                                >
                                    <Forward className="w-4 h-4 text-gray-500" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Переслать</span>
                                </button>
                                <button 
                                    onClick={() => handleDeleteSelected('forMe')}
                                    className="flex-1 bg-orange-50 dark:bg-orange-900/20 rounded-2xl py-4 flex flex-col items-center justify-center gap-1 hover:bg-orange-100 transition-all disabled:opacity-30"
                                    disabled={selectedIds.length === 0}
                                >
                                    <Trash2 className="w-4 h-4 text-orange-600" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-orange-600">У себя</span>
                                </button>
                                <button 
                                    onClick={() => handleDeleteSelected('forEveryone')}
                                    className="flex-1 bg-red-600 rounded-2xl py-4 flex flex-col items-center justify-center gap-1 hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-30 disabled:shadow-none"
                                    disabled={selectedIds.length === 0}
                                >
                                    <Trash2 className="w-4 h-4 text-white" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white">Для всех</span>
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
                                {isRecording ? (
                                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]"></div>
                                            <span className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-widest">{formatTime(recordTime)}</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={cancelRecording} className="text-gray-400 hover:text-gray-600 uppercase font-black text-[10px] tracking-widest">Отмена</button>
                                            <button onClick={stopRecording} className="bg-red-600 text-white p-3 rounded-xl shadow-lg"><Square className="w-4 h-4 fill-current"/></button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSend} className="flex items-end gap-2">
                                        <div className="relative shrink-0 mb-1">
                                            <button type="button" className="p-3 text-gray-400 hover:text-blue-600 transition-colors"><ImageIcon className="w-6 h-6"/></button>
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                                        </div>

                                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-[1.5rem] px-5 py-3.5 flex items-end">
                                            <textarea 
                                                rows={1}
                                                className="flex-1 bg-transparent border-none outline-none dark:text-white font-medium text-sm py-0.5 resize-none max-h-32" 
                                                placeholder="Сообщение..." 
                                                value={newMessage} 
                                                onChange={e => {
                                                    setNewMessage(e.target.value);
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = e.target.scrollHeight + 'px';
                                                }}
                                            />
                                        </div>

                                        {newMessage.trim() ? (
                                            <button type="submit" className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-500/30 active:scale-90 transition-all mb-0.5"><Send className="w-6 h-6"/></button>
                                        ) : (
                                            <button 
                                                type="button" 
                                                onClick={startRecording}
                                                className={`p-4 rounded-2xl transition-all shadow-lg mb-0.5 ${isUploadingMedia ? 'bg-gray-100 text-gray-300 animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30 active:scale-90'}`}
                                                disabled={isUploadingMedia}
                                            >
                                                {isUploadingMedia ? <Loader2 className="w-6 h-6 animate-spin"/> : <Mic className="w-6 h-6"/>}
                                            </button>
                                        )}
                                    </form>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageCircle className="w-20 h-20 opacity-10 mb-4"/>
                        <p className="font-black uppercase text-[10px] tracking-widest">Выберите диалог для общения</p>
                    </div>
                )}
            </div>
        </div>
    );
};
