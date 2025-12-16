import { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';

/**
 * Хук для подсчета непрочитанных сообщений текущего пользователя
 * Использует Supabase Realtime для обновления в реальном времени
 */
export function useUnreadMessages(userId: string | undefined) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setUnreadCount(0);
            setIsLoading(false);
            return;
        }

        // Функция для подсчета непрочитанных сообщений
        const fetchUnreadCount = async () => {
            try {
                // Получаем все чаты пользователя
                // 1. Чаты где пользователь - покупатель
                const { data: buyerChats } = await supabase
                    .from('chats')
                    .select('id')
                    .eq('buyer_id', userId);

                // 2. Чаты где пользователь - продавец (через объявления)
                const { data: myAds } = await supabase
                    .from('ads')
                    .select('id')
                    .eq('user_id', userId);

                const myAdIds = myAds?.map(ad => ad.id) || [];

                let sellerChatIds: string[] = [];
                if (myAdIds.length > 0) {
                    const { data: sellerChats } = await supabase
                        .from('chats')
                        .select('id')
                        .in('ad_id', myAdIds);
                    sellerChatIds = sellerChats?.map(chat => chat.id) || [];
                }

                // Объединяем все ID чатов
                const allChatIds = [
                    ...(buyerChats?.map(chat => chat.id) || []),
                    ...sellerChatIds
                ];

                if (allChatIds.length === 0) {
                    setUnreadCount(0);
                    setIsLoading(false);
                    return;
                }

                // Подсчитываем непрочитанные сообщения в этих чатах
                // (сообщения, которые НЕ от текущего пользователя и НЕ прочитаны)
                const { count, error } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .in('chat_id', allChatIds)
                    .neq('sender_id', userId)
                    .eq('read', false);

                if (error) throw error;

                setUnreadCount(count || 0);
            } catch (err) {
                console.error('Error fetching unread count:', err);
                setUnreadCount(0);
            } finally {
                setIsLoading(false);
            }
        };

        // Первоначальная загрузка
        fetchUnreadCount();

        // Подписка на изменения в таблице messages
        const channel = supabase
            .channel('unread-messages')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages'
                },
                () => {
                    // При любом изменении в messages пересчитываем
                    fetchUnreadCount();
                }
            )
            .subscribe();

        // Очистка подписки при размонтировании
        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return { unreadCount, isLoading };
}
