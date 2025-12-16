import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { ChatSession } from '../types';
import { useQueryClient } from '@tanstack/react-query';

interface ChatListProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
    onSelectChat: (session: ChatSession) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ isOpen, onClose, currentUserId, onSelectChat }) => {
    const [chats, setChats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (isOpen && currentUserId) {
            fetchChats();
        }
    }, [isOpen, currentUserId]);

    // Real-time subscription for new messages
    useEffect(() => {
        if (!isOpen || !currentUserId) return;

        const channel = supabase
            .channel('chat-list-updates')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages'
            }, () => {
                console.log('📨 New message received, refreshing chat list');
                fetchChats();
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'user_chats'
            }, () => {
                console.log('💬 User chat updated, refreshing chat list');
                fetchChats();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen, currentUserId]);

    const fetchChats = async () => {
        setIsLoading(true);
        try {
            // Validate UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!currentUserId || !uuidRegex.test(currentUserId)) {
                console.log('Invalid user ID for chat fetch:', currentUserId);
                setChats([]);
                setIsLoading(false);
                return;
            }

            console.log('Fetching user chats for:', currentUserId);

            // Fetch all user_chats where current user is involved
            const { data: userChats, error: chatsError } = await supabase
                .from('user_chats')
                .select('id, user1_id, user2_id, created_at, updated_at')
                .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
                .order('updated_at', { ascending: false });

            if (chatsError) {
                console.error('❌ Error fetching user chats:', chatsError);
                setIsLoading(false);
                return;
            }

            console.log('✅ Found user chats:', userChats?.length);

            if (!userChats || userChats.length === 0) {
                setChats([]);
                setIsLoading(false);
                return;
            }

            // Get partner IDs
            const partnerIds = userChats.map(chat =>
                chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id
            );

            // Fetch partner profiles
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', partnerIds);

            const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

            // Fetch last message for each chat
            const chatIds = userChats.map(c => c.id);
            const { data: lastMessages } = await supabase
                .from('messages')
                .select('user_chat_id, text, created_at, sender_id, context, ad_id')
                .in('user_chat_id', chatIds)
                .order('created_at', { ascending: false });

            // Group messages by chat and get the last one
            const lastMessageMap = new Map();
            (lastMessages || []).forEach(msg => {
                if (!lastMessageMap.has(msg.user_chat_id)) {
                    lastMessageMap.set(msg.user_chat_id, msg);
                }
            });

            // Format chats for display
            const formattedChats = userChats.map(chat => {
                const partnerId = chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id;
                const partner = profilesMap.get(partnerId);
                const lastMsg = lastMessageMap.get(chat.id);

                return {
                    id: chat.id,
                    chatId: chat.id,
                    partnerId: partnerId,
                    partnerName: partner?.full_name || 'Пользователь',
                    partnerAvatar: partner?.avatar_url,
                    lastMessage: lastMsg ? (
                        lastMsg.sender_id === currentUserId
                            ? `Вы: ${lastMsg.text}`
                            : lastMsg.text
                    ) : 'Нет сообщений',
                    context: lastMsg?.context || '',
                    date: lastMsg ? new Date(lastMsg.created_at).toLocaleDateString('ru-RU') : new Date(chat.created_at).toLocaleDateString('ru-RU'),
                    adId: lastMsg?.ad_id || null,
                    // For compatibility with ChatPage
                    adTitle: lastMsg?.context?.replace('По объявлению: ', '') || 'Общий чат',
                    authorName: partner?.full_name || 'Пользователь',
                    authorAvatar: partner?.avatar_url,
                    category: 'all'
                };
            });

            console.log('📊 Formatted chats:', formattedChats.length);
            setChats(formattedChats);
        } catch (err) {
            console.error('Error in fetchChats:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-surface w-full max-w-md h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h3 className="font-bold text-lg text-dark">Сообщения</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-secondary">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="text-center py-10 text-secondary">
                            <p>У вас пока нет диалогов</p>
                        </div>
                    ) : (
                        chats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => {
                                    onSelectChat({
                                        chatId: chat.id,
                                        adId: chat.adId,
                                        adTitle: chat.adTitle,
                                        authorName: chat.partnerName,
                                        authorAvatar: chat.partnerAvatar,
                                        category: chat.category
                                    });
                                    onClose();
                                }}
                                className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                    {chat.partnerAvatar ? (
                                        <img src={chat.partnerAvatar} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg">
                                            {chat.partnerName[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-dark text-sm truncate">{chat.partnerName}</h4>
                                        <span className="text-[10px] text-gray-400">{chat.date}</span>
                                    </div>
                                    {chat.context && (
                                        <p className="text-xs text-primary font-medium truncate mb-0.5">{chat.context}</p>
                                    )}
                                    <p className="text-xs text-secondary truncate">{chat.lastMessage}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
