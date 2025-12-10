
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Button } from '../components/ui/Common';
import { Loader2, Plus, Send, History, CreditCard, ArrowUpRight, ArrowDownLeft, QrCode } from 'lucide-react';

const TopUpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [amount, setAmount] = useState('');
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (amt: number) => api.topUpWallet(amt),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            alert("Баланс пополнен!");
            onClose();
            setAmount('');
        },
        onError: (e: any) => alert(e.message)
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(Number(amount));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-6 shadow-2xl">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Пополнить кошелек</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="number" 
                        placeholder="Сумма (₽)" 
                        className="w-full border rounded-lg p-3 text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                    />
                    <Button className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Пополнить'}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={onClose} type="button">Отмена</Button>
                </form>
            </div>
        </div>
    );
};

const TransferModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [contact, setContact] = useState('');
    const [amount, setAmount] = useState('');
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ contact, amount }: { contact: string; amount: number }) => api.transferMoney(contact, amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            alert("Перевод успешно отправлен!");
            onClose();
            setContact('');
            setAmount('');
        },
        onError: (e: any) => alert(e.message)
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ contact, amount: Number(amount) });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-6 shadow-2xl">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Перевод средств</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Email или телефон получателя" 
                        className="w-full border rounded-lg p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={contact}
                        onChange={e => setContact(e.target.value)}
                        required
                    />
                    <input 
                        type="number" 
                        placeholder="Сумма (₽)" 
                        className="w-full border rounded-lg p-3 text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                    />
                    <Button className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Перевести'}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={onClose} type="button">Отмена</Button>
                </form>
            </div>
        </div>
    );
};

export const WalletPage: React.FC = () => {
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['user'],
        queryFn: api.getCurrentUser
    });

    const { data: transactions = [], isLoading: txLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: api.getTransactions,
        enabled: !!user
    });

    if (userLoading || txLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!user) return <div className="p-10 text-center">Войдите в систему</div>;

    return (
        <div className="max-w-2xl mx-auto p-4 lg:p-8">
            <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
            <TransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />

            <h1 className="text-2xl font-bold mb-6 flex items-center gap-3 dark:text-white">
                <CreditCard className="w-8 h-8 text-blue-600" /> Мой Кошелек
            </h1>

            {/* Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10">
                    <p className="opacity-80 mb-1">Текущий баланс</p>
                    <h2 className="text-4xl font-bold mb-8">{(user.balance || 0).toLocaleString()} ₽</h2>
                    
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs opacity-70 mb-1">Владелец</p>
                            <p className="font-medium tracking-wide uppercase">{user.name}</p>
                        </div>
                        <QrCode className="w-10 h-10 opacity-80" />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                    onClick={() => setIsTopUpOpen(true)}
                    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Пополнить</span>
                </button>
                <button 
                    onClick={() => setIsTransferOpen(true)}
                    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                        <Send className="w-6 h-6 ml-1" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Перевести</span>
                </button>
            </div>

            {/* History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white">История операций</h3>
                </div>
                <div className="divide-y dark:divide-gray-700">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">История пуста</div>
                    ) : (
                        transactions.map(t => (
                            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                        t.type === 'topup' ? 'bg-green-100 text-green-600' : 
                                        t.type === 'purchase' ? 'bg-orange-100 text-orange-600' :
                                        t.isIncoming ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {t.type === 'topup' ? <Plus className="w-5 h-5" /> :
                                         t.type === 'purchase' ? <CreditCard className="w-5 h-5" /> :
                                         t.isIncoming ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{t.description}</p>
                                        <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                    </div>
                                </div>
                                <div className={`font-bold ${t.isIncoming || t.type === 'topup' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                                    {t.isIncoming || t.type === 'topup' ? '+' : '-'}{t.amount} ₽
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
