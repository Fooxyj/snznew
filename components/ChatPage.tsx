
import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, ChatMessage } from '../types';
import { supabase } from '../services/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface ChatPageProps {
    session: ChatSession;
    onBack: () => void;
    currentUserId?: string;
}

export const ChatPage: React.FC<ChatPageProps> = ({ session, onBack, currentUserId }) => {
    const [inputText, setInputText] = useState('');
    const [userChatId, setUserChatId] = useState<string | null>(session.chatId || null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // 1. Fetch or create user_chat and load messages
    const { data: serverMessages } = useQuery({
        queryKey: ['user-chat-messages', userChatId, currentUserId],
        queryFn: async () => {
            if (!supabase || !currentUserId || currentUserId === 'guest') return [];

            try {
                let targetChatId = userChatId;

                // If we don't have a userChatId yet, try to find or create it
                if (!targetChatId && session.adId) {
                    // Get the ad to find the seller
                    const { data: adData } = await supabase
                        .from('ads')
                        .select('user_id')
                        .eq('id', session.adId)
                        .single();

                    if (adData) {
                        const sellerId = adData.user_id;
                        const buyerId = currentUserId;

                        // Find existing user_chat - try both combinations
                        let existingChat = null;

                        // Try first combination
                        const { data: chat1 } = await supabase
                            .from('user_chats')
                            .select('id')
                            .eq('user1_id', buyerId)
                            .eq('user2_id', sellerId)
                            .maybeSingle();

                        if (chat1) {
                            existingChat = chat1;
                        } else {
                            // Try second combination
                            const { data: chat2 } = await supabase
                                .from('user_chats')
                                .select('id')
                                .eq('user1_id', sellerId)
                                .eq('user2_id', buyerId)
                                .maybeSingle();

                            if (chat2) {
                                existingChat = chat2;
                            }
                        }

                        if (existingChat) {
                            targetChatId = existingChat.id;
                            setUserChatId(existingChat.id);
                        }
                    }
                }

                // If chat exists, fetch messages
                if (targetChatId) {
                    const { data: msgs, error } = await supabase
                        .from('messages')
                        .select('id, sender_id, text, created_at, context, ad_id')
                        .eq('user_chat_id', targetChatId)
                        .order('created_at', { ascending: true });

                    if (error) {
                        console.error('Error fetching messages:', error);
                        return [];
                    }

                    return (msgs || []).map((m: any) => ({
                        id: m.id,
                        senderId: m.sender_id,
                        text: m.text,
                        context: m.context,
                        created_at: new Date(m.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                        isMe: m.sender_id === currentUserId
                    }));
                }
                return [];
            } catch (err) {
                console.error("Error loading chat:", err);
                return [];
            }
        },
        staleTime: Infinity,
        enabled: !!currentUserId && (!!session.chatId || !!session.adId)
    });

    // 2. Realtime Subscription
    useEffect(() => {
        if (!userChatId) return;

        const channel = supabase.channel(`user-chat:${userChatId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_chat_id=eq.${userChatId}` },
                (payload) => {
                    const newMsg = payload.new;

                    // Use the SAME query key as in useQuery
                    queryClient.setQueryData(['user-chat-messages', userChatId, currentUserId], (oldData: any[]) => {
                        if (!oldData) return [];
                        // Check if message already exists (e.g. from optimistic update)
                        if (oldData.some((m: any) => m.id === newMsg.id)) return oldData;

                        // Play notification sound if message is from partner
                        if (newMsg.sender_id !== currentUserId) {
                            playNotificationSound();
                        }

                        return [...oldData, {
                            id: newMsg.id,
                            senderId: newMsg.sender_id,
                            text: newMsg.text,
                            context: newMsg.context,
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
    }, [userChatId, queryClient, currentUserId]);

    const messages = serverMessages || [];

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        const msgText = inputText.trim();
        if (!msgText || !currentUserId) return;

        const tempId = `temp-${Date.now()}`;
        const optimisticMsg = {
            id: tempId,
            senderId: currentUserId,
            text: msgText,
            context: session.adId ? `По объявлению: ${session.adTitle}` : null,
            created_at: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setInputText(''); // Clear input immediately

        // Use the SAME query key as in useQuery
        queryClient.setQueryData(['user-chat-messages', userChatId, currentUserId], (oldData: any[]) => {
            return [...(oldData || []), optimisticMsg];
        });

        try {
            let activeChatId = userChatId;

            // If chat doesn't exist, create it first
            if (!activeChatId && session.adId) {
                // Get the ad to find the seller
                const { data: adData } = await supabase
                    .from('ads')
                    .select('user_id')
                    .eq('id', session.adId)
                    .single();

                if (adData) {
                    const sellerId = adData.user_id;
                    const buyerId = currentUserId;
                    const user1 = buyerId < sellerId ? buyerId : sellerId;
                    const user2 = buyerId < sellerId ? sellerId : buyerId;

                    const { data: newChat, error } = await supabase
                        .from('user_chats')
                        .insert({ user1_id: user1, user2_id: user2 })
                        .select()
                        .single();

                    if (error) {
                        // Chat might already exist, try to find it
                        let existingChat = null;

                        // Try first combination
                        const { data: chat1, error: error1 } = await supabase
                            .from('user_chats')
                            .select('id')
                            .eq('user1_id', user1)
                            .eq('user2_id', user2)
                            .maybeSingle();

                        if (error1) {
                            console.error('Error searching for chat (combo 1):', error1);
                        } else if (chat1) {
                            existingChat = chat1;
                        } else {
                            // Try second combination (shouldn't be needed if user1 < user2, but just in case)
                            const { data: chat2, error: error2 } = await supabase
                                .from('user_chats')
                                .select('id')
                                .eq('user1_id', user2)
                                .eq('user2_id', user1)
                                .maybeSingle();

                            if (error2) {
                                console.error('Error searching for chat (combo 2):', error2);
                            } else if (chat2) {
                                existingChat = chat2;
                            }
                        }

                        if (existingChat) {
                            activeChatId = existingChat.id;
                            setUserChatId(existingChat.id);
                        } else {
                            console.error('Could not create or find user_chat:', error);
                            throw error;
                        }
                    } else if (newChat) {
                        activeChatId = newChat.id;
                        setUserChatId(newChat.id);
                    }
                }
            }

            if (activeChatId) {
                const { data: sentMsg, error } = await supabase.from('messages').insert({
                    user_chat_id: activeChatId,
                    sender_id: currentUserId,
                    text: msgText,
                    ad_id: session.adId || null,
                    context: session.adId ? `По объявлению: ${session.adTitle}` : null
                }).select().single();

                if (error) throw error;

                // Update the optimistic message with the real one
                queryClient.setQueryData(['user-chat-messages', activeChatId, currentUserId], (oldData: any[]) => {
                    if (!oldData) return [];
                    return oldData.map((m: any) => m.id === tempId ? {
                        ...m,
                        id: sentMsg.id,
                        created_at: new Date(sentMsg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                    } : m);
                });

                // Update user_chat timestamp
                await supabase
                    .from('user_chats')
                    .update({ updated_at: new Date().toISOString() })
                    .eq('id', activeChatId);
            }
        } catch (err) {
            console.error("Failed to send message", err);
            alert("Ошибка отправки сообщения");
            // Revert optimistic update
            queryClient.setQueryData(['user-chat-messages', userChatId, currentUserId], (oldData: any[]) => {
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
        handleSendMessage();
    };

    const playNotificationSound = () => {
        try {
            // Simple beep sound using Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Could not play notification sound:', e);
        }
    };

    return (
        <div className="fixed inset-0 bg-surface z-[70] flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-secondary">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    {session.authorAvatar ? (
                        <img src={session.authorAvatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                            {session.authorName?.[0] || 'U'}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-dark truncate">{session.authorName}</h3>
                    {session.adTitle && session.adTitle !== 'Общий чат' && (
                        <p className="text-xs text-secondary truncate">По объявлению: {session.adTitle}</p>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="text-center py-10 text-secondary">
                        <p>Начните переписку</p>
                    </div>
                ) : (
                    messages.map((msg: any) => (
                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] ${msg.isMe ? 'bg-primary text-white' : 'bg-white text-dark'} rounded-2xl px-4 py-2 shadow-sm`}>
                                {msg.context && !msg.isMe && (
                                    <p className="text-xs opacity-70 mb-1">{msg.context}</p>
                                )}
                                <p className="text-sm">{msg.text}</p>
                                <span className={`text-[10px] ${msg.isMe ? 'text-white/70' : 'text-gray-400'} mt-1 block`}>
                                    {msg.created_at}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length === 0 && (
                <div className="px-4 py-2 flex gap-2 overflow-x-auto">
                    {getQuickReplies().map((reply, idx) => (
                        <button
                            key={idx}
                            onClick={() => setInputText(reply)}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-secondary hover:bg-gray-50 whitespace-nowrap"
                        >
                            {reply}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleFormSubmit} className="bg-white border-t border-gray-100 p-4 flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Написать сообщение..."
                    className="flex-1 px-4 py-2 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            </form>
        </div>
    );
};
