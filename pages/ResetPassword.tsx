
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Common';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

export const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) return showError("Пароль слишком короткий");
        if (password !== confirm) return showError("Пароли не совпадают");

        setLoading(true);
        try {
            await api.updatePassword(password);
            setDone(true);
            success("Пароль успешно изменен!");
            setTimeout(() => navigate('/profile'), 3000);
        } catch (err: any) {
            showError(err.message || "Ошибка обновления пароля");
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 w-full max-w-md p-12 rounded-[2.5rem] shadow-2xl text-center animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black uppercase dark:text-white mb-2">Готово!</h2>
                    <p className="text-gray-500 text-sm mb-8">Ваш пароль был успешно изменен. Через пару секунд вы будете перенаправлены в профиль.</p>
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
