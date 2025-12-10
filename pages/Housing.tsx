
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { UtilityBill } from '../types';
import { Button } from '../components/ui/Common';
import { Home, Zap, Droplets, Receipt, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const HousingPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'meters' | 'bills'>('meters');
    const queryClient = useQueryClient();
    
    // Meters Form
    const [readings, setReadings] = useState({
        hot: '',
        cold: '',
        electricity: ''
    });
    
    // Queries
    const { data: bills = [], isLoading: loading } = useQuery({
        queryKey: ['utilityBills'],
        queryFn: api.getUtilityBills
    });

    // Mutations
    const submitMeterMutation = useMutation({
        mutationFn: async () => {
            if (readings.hot) await api.submitMeterReading('hot_water', Number(readings.hot));
            if (readings.cold) await api.submitMeterReading('cold_water', Number(readings.cold));
            if (readings.electricity) await api.submitMeterReading('electricity', Number(readings.electricity));
        },
        onSuccess: () => {
            alert("Показания успешно переданы!");
            setReadings({ hot: '', cold: '', electricity: '' });
        },
        onError: (e: any) => alert(e.message)
    });

    const payBillMutation = useMutation({
        mutationFn: (bill: UtilityBill) => api.payUtilityBill(bill.id, bill.amount),
        onSuccess: () => {
            alert("Счет оплачен!");
            queryClient.invalidateQueries({ queryKey: ['utilityBills'] });
        },
        onError: (e: any) => alert(e.message)
    });

    const handleSubmitMeters = (e: React.FormEvent) => {
        e.preventDefault();
        submitMeterMutation.mutate();
    };

    const handlePayBill = (bill: UtilityBill) => {
        if (!confirm(`Оплатить счет "${bill.serviceName}" на сумму ${bill.amount} ₽?`)) return;
        payBillMutation.mutate(bill);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-3 dark:text-white">
                <Home className="w-8 h-8 text-blue-600" /> Мой Дом (ЖКХ)
            </h1>

            <div className="flex border-b dark:border-gray-700 mb-6">
                <button 
                    onClick={() => setActiveTab('meters')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'meters' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Zap className="w-4 h-4" /> Счетчики
                </button>
                <button 
                    onClick={() => setActiveTab('bills')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'bills' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Receipt className="w-4 h-4" /> Квитанции
                </button>
            </div>

            {activeTab === 'meters' ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 max-w-lg">
                    <h2 className="text-lg font-bold mb-4 dark:text-white">Передача показаний</h2>
                    <p className="text-sm text-gray-500 mb-6">Текущий период: Май 2024</p>
                    
                    <form onSubmit={handleSubmitMeters} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <Droplets className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Горячая вода</label>
                                <input 
                                    type="number" 
                                    className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2" 
                                    placeholder="00000"
                                    value={readings.hot}
                                    onChange={e => setReadings({...readings, hot: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Droplets className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Холодная вода</label>
                                <input 
                                    type="number" 
                                    className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2" 
                                    placeholder="00000"
                                    value={readings.cold}
                                    onChange={e => setReadings({...readings, cold: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Электроэнергия</label>
                                <input 
                                    type="number" 
                                    className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2" 
                                    placeholder="00000"
                                    value={readings.electricity}
                                    onChange={e => setReadings({...readings, electricity: e.target.value})}
                                />
                            </div>
                        </div>

                        <Button className="w-full" disabled={submitMeterMutation.isPending}>
                            {submitMeterMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : 'Передать показания'}
                        </Button>
                    </form>
                </div>
            ) : (
                <div className="space-y-4">
                    {loading ? <div className="text-center py-10"><Loader2 className="animate-spin w-8 h-8 text-blue-600 mx-auto" /></div> : 
                    bills.length === 0 ? <p className="text-center py-10 text-gray-400">Счетов нет</p> :
                    bills.map(bill => (
                        <div key={bill.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bill.isPaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {bill.isPaid ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white">{bill.serviceName}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{bill.period}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                <span className="text-xl font-bold dark:text-white">{bill.amount} ₽</span>
                                {bill.isPaid ? (
                                    <span className="text-green-600 font-medium px-4 py-2 bg-green-50 rounded-lg">Оплачено</span>
                                ) : (
                                    <Button onClick={() => handlePayBill(bill)} disabled={payBillMutation.isPending}>
                                        {payBillMutation.isPending ? '...' : 'Оплатить'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
