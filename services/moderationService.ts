import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../config';
import { authService } from './authService';
import { ModerationLog } from '../types';

// Базовый список стоп-слов
const BANNED_PATTERNS = [
    /х[уу]й/i, /п[ии]зд/i, /еб[аа]т/i, /бл[яя]д/i, /с[уу]к[аа]/i, /г[оо]нд[оо]н/i, /п[ии]д[оо]р/i,
    /нарк[оо]т/i, /терр[оо]р/i, /взрыв/i, /оружие/i, /пр[оо]дам дурь/i
];

export const moderationService = {
    validateContent(text: string): { isValid: boolean; error?: string; cleanedText: string } {
        if (!text) return { isValid: true, cleanedText: '' };

        let isClean = true;
        let cleaned = text;

        BANNED_PATTERNS.forEach(pattern => {
            if (pattern.test(cleaned)) {
                isClean = false;
                cleaned = cleaned.replace(pattern, (match) => '*'.repeat(match.length));
            }
        });

        return {
            isValid: isClean,
            error: isClean ? undefined : "Текст был автоматически скорректирован из-за нарушений правил.",
            cleanedText: cleaned
        };
    },

    async logModerationAction(params: {
        targetId: string,
        targetType: string,
        action: 'deleted' | 'rejected' | 'edited',
        reason: string,
        contentSnapshot: any
    }) {
        if (!isSupabaseConfigured() || !supabase) return;

        try {
            const user = await authService.getCurrentUser();
            if (!user) return;

            const { error } = await supabase.from('moderation_logs').insert({
                moderator_id: user.id,
                target_id: params.targetId,
                target_type: params.targetType,
                action: params.action,
                reason: params.reason,
                content_snapshot: params.contentSnapshot
            });

            if (error) throw error;
        } catch (e: any) {
            console.error("Failed to log moderation action:", e?.message || e);
        }
    },

    async getModerationLogs(): Promise<ModerationLog[]> {
        if (!isSupabaseConfigured() || !supabase) return [];

        try {
            // Получаем логи без JOIN, чтобы избежать ошибки схемы
            const { data: logs, error } = await supabase
                .from('moderation_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            if (!logs || logs.length === 0) return [];

            // Собираем ID модераторов для получения их имен
            const moderatorIds = [...new Set(logs.map(l => l.moderator_id))];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name')
                .in('id', moderatorIds);

            const profileMap = new Map(profiles?.map(p => [p.id, p.name]));

            return logs.map((l: any) => ({
                id: l.id,
                moderatorId: l.moderator_id,
                moderatorName: profileMap.get(l.moderator_id) || 'Система',
                targetId: l.target_id,
                targetType: l.target_type,
                action: l.action,
                reason: l.reason,
                contentSnapshot: l.content_snapshot,
                createdAt: l.created_at
            }));
        } catch (e: any) {
            console.error("Failed to fetch moderation logs:", e?.message || e);
            return [];
        }
    }
};