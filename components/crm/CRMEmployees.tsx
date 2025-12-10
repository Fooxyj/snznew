
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Button } from '../ui/Common';
import { Plus, Trash2, Users, Loader2 } from 'lucide-react';

interface CRMEmployeesProps {
    businessId: string;
}

export const CRMEmployees: React.FC<CRMEmployeesProps> = ({ businessId }) => {
    const queryClient = useQueryClient();

    const { data: employees = [], isLoading } = useQuery({
        queryKey: ['employees', businessId],
        queryFn: () => api.getBusinessEmployees(businessId)
    });

    const addMutation = useMutation({
        mutationFn: ({ email, role }: { email: string, role: 'manager' | 'staff' }) => 
            api.addEmployee(businessId, email, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees', businessId] });
        },
        onError: (e: any) => alert(e.message)
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => api.removeEmployee(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees', businessId] });
        }
    });

    const handleAddEmployee = () => {
        const email = prompt("Введите Email сотрудника:");
        if (!email) return;
        const role = confirm("Это менеджер? (OK - Менеджер, Cancel - Персонал)") ? 'manager' : 'staff';
        addMutation.mutate({ email, role });
    };

    const handleRemove = (id: string) => {
        if(confirm("Удалить сотрудника?")) {
            removeMutation.mutate(id);
        }
    };

    if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Сотрудники</h1>
                <Button onClick={handleAddEmployee} size="sm">
                    <Plus className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Добавить</span>
                </Button>
            </div>
            
            {employees.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed dark:border-gray-700">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Сотрудников пока нет</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {employees.map(emp => (
                        <div key={emp.id} className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex items-center gap-4 group">
                            <img src={emp.avatar} className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover bg-gray-200" alt="" />
                            <div className="flex-1">
                                <div className="font-bold text-gray-900 dark:text-white text-sm lg:text-base">{emp.name}</div>
                                <div className="text-xs lg:text-sm text-gray-500">{emp.role === 'manager' ? 'Менеджер' : 'Сотрудник'}</div>
                                <div className="text-[10px] text-gray-400 mt-1">{emp.email}</div>
                            </div>
                            <button 
                                onClick={() => handleRemove(emp.id)}
                                disabled={removeMutation.isPending}
                                className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
