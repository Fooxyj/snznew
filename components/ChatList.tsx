import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { ChatSession } from '../types';

interface ChatListProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
    onSelectChat: (session: ChatSession) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ isOpen, onClose, currentUserId, onSelectChat }) => {
    const [chats, setChats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && currentUserId) {
            fetchChats();
        }
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

            console.log('Fetching chats for user:', currentUserId);

            // Fetch all chats where user is buyer
            const { data: buyerChats, error: buyerError } = await supabase
                .from('chats')
                .select(`
                    id, 
                    ad_id, 
                    buyer_id,
                    created_at,
                    ads (
                        id,
                        title,
                        image,
                        category,
                        user_id,
                        author_name,
                        author_avatar
                    )
                `)
                .eq('buyer_id', currentUserId)
                .order('created_at', { ascending: false });

            if (buyerError) {
                console.error('Error fetching buyer chats:', buyerError);
            }

            // Fetch all chats and filter where user is seller (ads.user_id === currentUserId)
            const { data: allChats, error: allChatsError } = await supabase
                .from('chats')
                .select(`
                    id, 
                    ad_id, 
                    buyer_id,
                    created_at,
                    ads (
                        id,
                        title,
                        image,
                        category,
                        user_id,
                        author_name,
                        author_avatar
                    ),
                    buyer:buyer_id (
                        full_name,
                        avatar_url
                    )
                `)
                .order('created_at', { ascending: false });

            if (allChatsError) {
                console.error('Error fetching all chats:', allChatsError);
            }

            // Filter seller chats client-side
            const sellerChats = (allChats || []).filter((chat: any) =>
                chat.ads && chat.ads.user_id === currentUserId
            );

            const bChats = buyerChats || [];
            const sChats = sellerChats || [];

            console.log('Buyer chats:', bChats);
            console.log('Seller chats:', sChats);

            // Format Buyer Chats
            const formattedBuyerChats = bChats.map((c: any) => ({
                id: c.id,
                chatId: c.id,
                adId: c.ad_id,
                adTitle: c.ads?.title || 'Объявление удалено',
                adImage: c.ads?.image || 'https://via.placeholder.com/150',
                partnerName: c.ads?.author_name || 'Продавец',
                partnerAvatar: c.ads?.author_avatar,
                lastMessage: 'Вы: Интересует товар',
                date: new Date(c.created_at).toLocaleDateString(),
                isBuying: true,
                category: c.ads?.category
            }));

            // Format Seller Chats
            const formattedSellerChats = sChats.map((c: any) => ({
                id: c.id,
                chatId: c.id,
                adId: c.ad_id,
                adTitle: c.ads?.title || 'Объявление',
                adImage: c.ads?.image || 'https://via.placeholder.com/150',
                partnerName: c.buyer?.full_name || 'Покупатель',
                partnerAvatar: c.buyer?.avatar_url,
                lastMessage: 'Покупатель интересуется',
                date: new Date(c.created_at).toLocaleDateString(),
                isBuying: false,
                category: c.ads?.category
            }));

            // Merge and sort
            const allFormattedChats = [...formattedBuyerChats, ...formattedSellerChats].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            // Deduplicate by chat ID
            const uniqueChats = Array.from(new Map(allFormattedChats.map(c => [c.id, c])).values());

            console.log('Final chats:', uniqueChats);
            setChats(uniqueChats);
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
                                    <p className="text-xs text-primary font-medium truncate mb-0.5">{chat.adTitle}</p>
                                    <p className="text-xs text-secondary truncate">{chat.lastMessage}</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                    <img src={chat.adImage} className="w-full h-full object-cover" alt="" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
