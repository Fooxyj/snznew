
import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, ChatMessage } from '../types';
import { supabase } from '../services/supabaseClient';
import { api } from '../services/api'; // Use optimized API
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface ChatPageProps {
    session: ChatSession;
    onBack: () => void;
    currentUserId?: string;
}

export const ChatPage: React.FC<ChatPageProps> = ({ session, onBack, currentUserId }) => {
    const [inputText, setInputText] = useState('');
    const [chatId, setChatId] = useState<string | null>(null);
    const [partnerProfile, setPartnerProfile] = useState<{ name: string, avatar: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // 1. Fetch Chat ID and Messages
    const { data: serverMessages, refetch } = useQuery({
        queryKey: ['chat', session.adId, currentUserId],
        queryFn: async () => {
            if (!supabase || !currentUserId || !session.adId) return [];

            try {
                // Get Chat ID
                const { data: chats } = await supabase
                    .from('chats')
                    .select('id, buyer_id')
                    .eq('ad_id', session.adId)
                    .eq('buyer_id', currentUserId)
                    .maybeSingle();

                // If chat exists, set ID
                if (chats) {
                    setChatId(chats.id);

                    // Optimized Fetch Messages
                    const msgs = await api.chats.getMessages(chats.id);

                    if (msgs) {
                        return msgs.map((m: any) => ({
                            id: m.id,
                            senderId: m.sender_id,
                            text: m.text,
                            created_at: new Date(m.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                            isMe: m.sender_id === currentUserId
                        }));
                    }
                }
                return [];
            } catch (err) {
                console.error("Error loading chat:", err);
                return [];
            }
        },
        staleTime: Infinity, // Keep data fresh indefinitely, rely on Realtime
        enabled: !!currentUserId && !!session.adId
    });

    // 2. Fetch Partner Profile
    useEffect(() => {
        const fetchPartner = async () => {
            if (!supabase || !currentUserId || !session.adId) return;

            // Get the ad author.
            const { data: adData } = await supabase.from('ads').select('user_id').eq('id', session.adId).maybeSingle();

            if (adData) {
                if (currentUserId !== adData.user_id) {
                    // I am buyer, partner is Seller. Fetch seller's profile.
                    const { data: sellerProfile } = await supabase
                        .from('profiles')
                        .select('full_name, name, avatar_url')
                        .eq('id', adData.user_id)
                        .maybeSingle();

                    setPartnerProfile({
                        name: sellerProfile?.full_name || sellerProfile?.name || session.authorName || 'Продавец',
                        avatar: sellerProfile?.avatar_url || session.authorAvatar || ''
                    });
                } else {
                    // I am seller, partner is Buyer.
                    if (chatId) { // Use chatId from state, which might be set by the queryFn
                        const { data: chatData } = await supabase
                            .from('chats')
                            .select('buyer_id')
                            .eq('id', chatId)
                            .maybeSingle();

                        if (chatData && chatData.buyer_id) {
                            const { data: buyerProfile } = await supabase
                                .from('profiles')
                                .select('full_name, name, avatar_url')
                                .eq('id', chatData.buyer_id)
                                .maybeSingle();

                            setPartnerProfile({
                                name: buyerProfile?.full_name || buyerProfile?.name || 'Покупатель',
                                avatar: buyerProfile?.avatar_url || ''
                            });
                        } else {
                            setPartnerProfile({ name: 'Покупатель', avatar: '' });
                        }
                    } else {
                        setPartnerProfile({ name: 'Покупатель', avatar: '' });
                    }
                }
            } else {
                // Ad not found or error, fallback to session data
                setPartnerProfile({
                    name: session.authorName || 'Собеседник',
                    avatar: session.authorAvatar || ''
                });
            }
        };

        fetchPartner();
    }, [session.adId, currentUserId, chatId, session.authorName, session.authorAvatar]);


    // 3. Realtime Subscription
    useEffect(() => {
        if (!chatId) return;

        const channel = supabase.channel(`chat:${chatId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
                (payload) => {
                    const newMsg = payload.new;
                    // Only add if not already in list (deduplication) and not from me (optimistic update handles my own)
                    // Actually, we should add it if it's from partner. If it's from me, we might have already added it optimistically.
                    // But since we don't have complex optimistic logic yet, let's just append if not exists.

                    queryClient.setQueryData(['chat', session.adId, currentUserId], (oldData: any[]) => {
                        if (!oldData) return [];
                        // Check if message already exists (e.g. from optimistic update)
                        if (oldData.some((m: any) => m.id === newMsg.id)) return oldData;

                        return [...oldData, {
                            id: newMsg.id,
                            senderId: newMsg.sender_id,
                            text: newMsg.text,
                            created_at: new Date(newMsg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                            isMe: newMsg.sender_id === currentUserId
                        }];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [chatId, queryClient, session.adId, currentUserId]);


    const messages = serverMessages || [];

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const sendMessage = async (text: string) => {
        if (!inputText.trim() && !text) return;
        const msgText = text || inputText;
        const tempId = crypto.randomUUID();
        const now = new Date();

        // Optimistic Update
        const optimisticMsg = {
            id: tempId,
            senderId: currentUserId || 'me',
            text: msgText,
            created_at: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setInputText(''); // Clear input immediately

        queryClient.setQueryData(['chat', session.adId, currentUserId], (oldData: any[]) => {
            return [...(oldData || []), optimisticMsg];
        });

        try {
            let activeChatId = chatId;

            // If chat doesn't exist, create it first
            if (!activeChatId) {
                const { data: newChat, error } = await supabase
                    .from('chats')
                    .insert({ ad_id: session.adId, buyer_id: currentUserId })
                    .select()
                    .single();

                if (error) throw error;
                if (newChat) {
                    activeChatId = newChat.id;
                    setChatId(newChat.id);
                }
            }

            if (activeChatId) {
                // We let the server generate the ID to ensure uniqueness and consistency
                // But we could also pass the tempId if the DB supports it. 
                // Safest is to let server generate, then update our local cache.
                const { data: sentMsg, error } = await supabase.from('messages').insert({
                    chat_id: activeChatId,
                    sender_id: currentUserId,
                    text: msgText
                }).select().single();

                if (error) throw error;

                // Update the optimistic message with the real one
                queryClient.setQueryData(['chat', session.adId, currentUserId], (oldData: any[]) => {
                    if (!oldData) return [];
                    return oldData.map((m: any) => m.id === tempId ? {
                        ...m,
                        id: sentMsg.id,
                        created_at: new Date(sentMsg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                    } : m);
                });
            }
        } catch (err) {
            console.error("Failed to send message", err);
            alert("Ошибка отправки сообщения");
            // Revert optimistic update
            queryClient.setQueryData(['chat', session.adId, currentUserId], (oldData: any[]) => {
                if (!oldData) return [];
                return oldData.filter((m: any) => m.id !== tempId);
            });
            setInputText(msgText); // Restore text
        }
    };

    const getQuickReplies = (): string[] => {
        if (session.category === 'services') return ["Какая цена?", "Когда свободны?", "Работаете в выходные?"];
        if (session.category === 'rent') return ["Ещё сдаётся?", "На длительный срок?", "Можно с животными?"];
        return ["Ещё актуально?", "Когда можно посмотреть?", "Торг уместен?"];
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputText);
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-background flex justify-center items-center h-[100dvh] w-full">
            <div className="w-full h-full md:max-w-2xl md:h-[90vh] bg-surface flex flex-col md:rounded-3xl md:shadow-2xl overflow-hidden relative">

                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3 shrink-0 safe-top">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm shrink-0 overflow-hidden">
                        {partnerProfile?.avatar ? (
                            <img src={partnerProfile.avatar} className="w-full h-full object-cover" />
                        ) : (
                            (partnerProfile?.name || session.adTitle).charAt(0).toUpperCase()
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-dark leading-none truncate">{partnerProfile?.name || 'Загрузка...'}</h3>
                        <p className="text-xs text-secondary truncate mt-1">{session.adTitle}</p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                    <div className="text-center text-xs text-gray-400 my-2">Чат защищен</div>

                    {messages.length === 0 && (
                        <div className="mt-auto mb-4">
                            <p className="text-center text-secondary text-sm mb-3">Быстрые вопросы:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {getQuickReplies().map((reply, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => sendMessage(reply)}
                                        className="bg-white border border-gray-200 text-dark text-xs px-3 py-2 rounded-full hover:border-primary hover:text-primary transition-colors"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex w-full ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative shadow-sm
                            ${msg.isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white text-dark border border-gray-100 rounded-bl-none'}`}>
                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                <span className={`text-[10px] block text-right mt-1 opacity-70 ${msg.isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {msg.created_at}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-gray-200 shrink-0 safe-bottom">
                    <div className="flex items-end gap-2">
                        <textarea
                            className="flex-grow bg-gray-100 border-transparent focus:bg-white focus:border-primary border rounded-2xl py-3 px-4 text-dark outline-none transition-all placeholder:text-gray-400 resize-none max-h-32 min-h-[48px] text-sm"
                            placeholder="Написать сообщение..."
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            rows={1}
                            onInput={(e) => {
                                e.currentTarget.style.height = 'auto';
                                e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 120) + 'px';
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim()}
                            className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all disabled:opacity-50 disabled:shadow-none shrink-0 mb-px active:scale-95"
                        >
                            <svg className="w-5 h-5 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
