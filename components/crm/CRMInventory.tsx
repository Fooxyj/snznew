import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/Common';

interface CRMInventoryProps {
    items: any[];
    type: 'products' | 'services' | 'events' | 'rentals';
    label: string;
    onAdd: () => void;
    onDelete: (id: string) => void;
}

export const CRMInventory: React.FC<CRMInventoryProps> = ({ items, type, label, onAdd, onDelete }) => {
    return (
        <div className="animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">{label}</h1>
                <Button onClick={onAdd} size="sm">
                    <Plus className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden md:inline">Добавить</span>
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {items.map((item: any) => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex gap-4">
                        {item.image && <img src={item.image} className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg object-cover bg-gray-100" alt="" />}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold dark:text-white truncate text-sm lg:text-base">{item.name || item.title}</h3>
                                <button onClick={() => onDelete(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.price || item.pricePerDay} ₽</p>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <div className="col-span-full text-center text-gray-400 py-10">Список пуст</div>}
            </div>
        </div>
    );
};