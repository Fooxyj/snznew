
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Common';
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import { supabase } from '../lib/supabase';

export const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [hasSession, setHasSession] = useState(false);
    const [done, setDone] = useState(false);
    
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    // Проверяем, есть ли временная сессия от Supabase (из ссылки в письме)
    useEffect(() => {
        const checkSession = async () => {
            if (!supabase) return;
            
            // Даем немного времени Supabase обработать токены из URL
            await new Promise(r => setTimeout(r, 1000));
            
            const { data } = await supabase.auth.getSession();
            if (data?.session) {
                setHasSession(true);
            } else {
                setHasSession(false);
            }
            setVerifying(false);
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) return showError("Пароль слишком короткий (минимум 6 символов)");
        if (password !== confirm) return showError("Пароли не совпадают");

        setLoading(true);
        try {
            await api.updatePassword(password);
            setDone(true);
            success("Пароль успешно изменен!");
            setTimeout(() => navigate('/profile'), 3000);
        } catch (err: any) {
            // Если сессия пропала в процессе
            if (err.message?.includes('session missing')) {
                showError("Ошибка: сессия истекла. Запросите восстановление еще раз.");
                setHasSession(false);
            } else {
                showError(err.message || "Ошибка обновления пароля");
            }
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Проверка ссылки безопасности...</p>
            </div>
        );
    }

    if (!hasSession && !done) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border-2 border-red-500/20 text-center animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black uppercase dark:text-white mb-4 leading-tight">Ссылка невалидна</h2>
                    <p className="text-gray-500 text-sm mb-10 leading-relaxed italic">
                        Похоже, срок действия ссылки для сброса пароля истек или она уже была использована.
                    </p>
                    <div className="space-y-4">
                        <Button onClick={() => navigate('/auth')} className="w-full py-4 rounded-2xl">
                            Запросить новую ссылку
                        </Button>
                        <button onClick={() => navigate('/')} className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 tracking-widest flex items-center justify-center gap-2 mx-auto">
                            <ArrowLeft className="w-3 h-3" /> На главную
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (done) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 w-full max-w-md p-12 rounded-[2.5rem] shadow-2xl text-center animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black uppercase dark:text-white mb-2">Готово!</h2>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">Ваш пароль был успешно изменен. Через пару секунд вы будете перенаправлены в профиль.</p>
                    <Button onClick={() => navigate('/profile')} className="w-full">Перейти сейчас</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="text-center mb-8 relative z-10">
                    <h1 className="text-3xl font-black text-blue-900 dark:text-blue-400 uppercase tracking-tighter">Новый пароль</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-3">Установите надежную защиту</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="password"
                            placeholder="Новый пароль"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white font-bold"
                            required
                            minLength={6}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="password"
                            placeholder="Повторите пароль"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white font-bold"
                            required
                            minLength={6}
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                        />
                    </div>

                    <Button 
                        className="w-full py-5 text-lg mt-4 shadow-2xl font-black uppercase tracking-widest rounded-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95" 
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Обновить пароль'}
                    </Button>
                </form>

                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>
        </div>
    );
};
