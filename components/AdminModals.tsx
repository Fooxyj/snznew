
import React, { useState, useEffect } from 'react';
import { X, Loader2, Upload, Trophy, Heart, ImageIcon, Bus, Clock, MapPin, Megaphone, Link as LinkIcon, Layout as LayoutIcon, Wand2, Sparkles, FileText, Trash2, Plus } from 'lucide-react';
import { Button, Badge } from './ui/Common';
import { api } from '../services/api';
import { aiService } from '../services/aiService';
import { Banner, PromoAd, ExclusivePage, PageBlock } from '../types';

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item?: any | null;
}

export const CreateExclusivePageModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSuccess, item }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'blocks' | 'ai'>('info');
    const [formData, setFormData] = useState({ 
        title: '', 
        description: '', 
        image_url: '', 
        phone: '', 
        website: '', 
        features: [],
        blocks_config: [] as PageBlock[]
    });
    const [rawAiText, setRawAiText] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (item && isOpen) {
            setFormData({
                title: item.title,
                description: item.description,
                image_url: item.image_url,
                phone: item.phone || '',
                website: item.website || '',
                features: item.features || [],
                blocks_config: item.blocks_config || []
            });
        }
    }, [item, isOpen]);

    if (!isOpen) return null;

    const handleAIParsing = async () => {
        if (!rawAiText.trim()) return;
        setIsAiLoading(true);
        try {
            const resultBlocks = await aiService.parseDocumentToBlocks(rawAiText);
            const blocksWithIds = resultBlocks.map((b: any) => ({ ...b, id: Math.random().toString(36).substring(7) }));
            setFormData(prev => ({ ...prev, blocks_config: [...prev.blocks_config, ...blocksWithIds] }));
            setActiveTab('blocks');
            setRawAiText('');
            alert("Снежик успешно разобрал текст и создал блоки!");
        } catch (e) {
            alert("Снежик не смог разобрать этот текст. Попробуйте более четко структурировать данные.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const addManualBlock = (type: 'grid' | 'pricing') => {
        const newBlock: PageBlock = {
            id: Math.random().toString(36).substring(7),
            type: type,
            title: type === 'grid' ? 'Каталог' : 'Прайс-лист',
            items: [{ name: 'Новая позиция', desc: 'Описание', price: '0' }]
        };
        setFormData(prev => ({ ...prev, blocks_config: [...prev.blocks_config, newBlock] }));
    };

    const removeBlock = (id: string) => {
        setFormData(prev => ({ ...prev, blocks_config: prev.blocks_config.filter(b => b.id !== id) }));
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image_url: url }));
        } catch (e: any) { alert(e.message); } finally { setUploading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (item) await api.updateEntity('exclusive_pages', item.id, formData);
            else await api.createExclusivePage(formData);
            onSuccess();
            onClose();
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black dark:text-white uppercase flex items-center gap-3"><LayoutIcon className="text-blue-500"/> {item ? 'Изменить лендинг' : 'Новый лендинг'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="text-gray-400"/></button>
                </div>

                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-2xl mb-8">
                    <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'info' ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' : 'text-gray-400'}`}>Общая инфо</button>
                    <button onClick={() => setActiveTab('blocks')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'blocks' ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' : 'text-gray-400'}`}>Блоки ({formData.blocks_config.length})</button>
                    <button onClick={() => setActiveTab('ai')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === 'ai' ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm' : 'text-gray-400'}`}>AI Снежик ✨</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {activeTab === 'info' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Название компании</label>
                                <input className="w-full border rounded-xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Короткий слоган</label>
                                <textarea className="w-full border rounded-xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-6 text-center relative hover:bg-gray-50">
                                    {formData.image_url ? <img src={formData.image_url} className="h-32 mx-auto rounded-2xl object-cover" /> : <div className="py-4"><ImageIcon className="w-8 h-8 text-gray-200 mx-auto mb-2" /><p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Главное фото (Обложка)</p></div>}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
                                </div>
                                <div className="space-y-4">
                                    <input className="w-full border rounded-xl p-3 text-sm" placeholder="Телефон" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                    <input className="w-full border rounded-xl p-3 text-sm" placeholder="Сайт" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'blocks' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex gap-2">
                                <Button type="button" size="sm" variant="outline" onClick={() => addManualBlock('grid')}><Plus className="w-4 h-4 mr-2"/> Сетка (Товары/Врачи)</Button>
                                <Button type="button" size="sm" variant="outline" onClick={() => addManualBlock('pricing')}><Plus className="w-4 h-4 mr-2"/> Список (Цены)</Button>
                            </div>

                            <div className="space-y-4">
                                {formData.blocks_config.map((block) => (
                                    <div key={block.id} className="p-4 border rounded-2xl bg-gray-50 dark:bg-gray-700 relative">
                                        <button type="button" onClick={() => removeBlock(block.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                                        <div className="text-[8px] font-black uppercase text-blue-500 mb-2">{block.type === 'grid' ? 'Сетка элементов' : 'Прайс-лист'}</div>
                                        <input className="font-bold text-sm bg-transparent border-none p-0 outline-none dark:text-white" value={block.title} onChange={e => {
                                            const newBlocks = formData.blocks_config.map(b => b.id === block.id ? {...b, title: e.target.value} : b);
                                            setFormData({...formData, blocks_config: newBlocks});
                                        }} />
                                        <div className="mt-4 text-[10px] text-gray-500 font-medium">Позиций в блоке: {block.items?.length || 0}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-2xl flex items-start gap-4 border border-purple-100">
                                <Sparkles className="w-8 h-8 text-purple-600 shrink-0" />
                                <div>
                                    <h4 className="font-black text-sm uppercase text-purple-700">Умный помощник Снежик</h4>
                                    <p className="text-xs text-purple-600/80 leading-relaxed mt-1">Просто скопируйте сюда любой текст: меню, список врачей из PDF, прайс-лист в Excel. Снежик сам создаст нужные блоки для сайта.</p>
                                </div>
                            </div>
                            
                            <textarea 
                                className="w-full border rounded-2xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm min-h-[250px] outline-none focus:ring-4 focus:ring-purple-500/10 transition-all"
                                placeholder="Вставьте текст документа здесь..."
                                value={rawAiText}
                                onChange={e => setRawAiText(e.target.value)}
                            />

                            <Button 
                                type="button"
                                className="w-full py-4 bg-purple-600 hover:bg-purple-700 border-none shadow-xl shadow-purple-500/20 font-black uppercase tracking-widest text-white"
                                onClick={handleAIParsing}
                                disabled={isAiLoading || !rawAiText.trim()}
                            >
                                {isAiLoading ? <Loader2 className="animate-spin" /> : <><Wand2 className="w-5 h-5 mr-2" /> Снежик, разбери документ</>}
                            </Button>
                        </div>
                    )}

                    <div className="pt-8 border-t dark:border-gray-700 flex gap-4">
                        <Button variant="ghost" type="button" className="flex-1" onClick={onClose}>Отмена</Button>
                        <Button className="flex-[2] py-4 font-black uppercase tracking-widest shadow-2xl" disabled={loading || uploading}>
                            {loading ? <Loader2 className="animate-spin" /> : item ? 'Сохранить изменения' : 'Опубликовать лендинг'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const CreatePromoAdModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSuccess, item }) => {
    const [formData, setFormData] = useState({ title: '', description: '', image_url: '', link_url: '', price: '', category: 'Партнеры', is_active: true });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (item && isOpen) setFormData({ title: item.title, description: item.description || '', image_url: item.image_url, link_url: item.link_url || '', price: item.price?.toString() || '', category: item.category || 'Партнеры', is_active: item.is_active });
        else if (!item && isOpen) setFormData({ title: '', description: '', image_url: '', link_url: '', price: '', category: 'Партнеры', is_active: true });
    }, [item, isOpen]);

    if (!isOpen) return null;

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image_url: url }));
        } catch (e: any) { alert(e.message); } finally { setUploading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, price: formData.price ? Number(formData.price) : undefined };
            if (item) await api.updatePromoAd(item.id, payload);
            else await api.createPromoAd(payload);
            onSuccess();
            onClose();
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in slide-in-from-top-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black dark:text-white uppercase flex items-center gap-3"><Megaphone className="text-orange-500"/> {item ? 'Изменить акцию' : 'Новое предложение'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="text-gray-400"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Название акции</label>
                        <input className="w-full border rounded-xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Описание предложения</label>
                        <textarea className="w-full border rounded-xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Цена "ОТ" (₽)</label>
                            <input type="number" className="w-full border rounded-xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Ссылка (URL)</label>
                            <input className="w-full border rounded-xl p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.link_url} onChange={e => setFormData({...formData, link_url: e.target.value})} placeholder="https://..." />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Рекламный креатив (Изображение)</label>
                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-6 text-center relative hover:bg-gray-50 transition-colors">
                            {formData.image_url ? (
                                <img src={formData.image_url} className="h-40 mx-auto rounded-2xl object-cover shadow-xl" />
                            ) : (
                                <div className="py-4">
                                    <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-gray-400 uppercase">Нажмите для загрузки</p>
                                </div>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
                        </div>
                    </div>
                    <Button className="w-full py-5 text-lg font-black bg-orange-500 hover:bg-orange-600 border-none shadow-2xl shadow-orange-500/20" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Опубликовать предложение'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export const CreateBannerModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSuccess, item }) => {
    const [formData, setFormData] = useState({ image_url: '', link_url: '', title: '', is_active: true, position: 'home_top' as string });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (item && isOpen) setFormData({ image_url: item.image_url, link_url: item.link_url || '', title: item.title || '', is_active: item.is_active, position: item.position || 'home_top' });
        else if (!item && isOpen) setFormData({ image_url: '', link_url: '', title: '', is_active: true, position: 'home_top' });
    }, [item, isOpen]);

    if (!isOpen) return null;

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image_url: url }));
        } catch (e: any) { alert(e.message); } finally { setUploading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (item) await api.updateBanner(item.id, formData);
            else await api.createBanner(formData);
            onSuccess();
            onClose();
        } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-top-4 max-h-[95vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black dark:text-white uppercase flex items-center gap-2"><ImageIcon className="text-purple-500"/> {item ? 'Изменить баннер' : 'Новый баннер'}</h2>
                    <button onClick={onClose}><X className="text-gray-400"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Заголовок</label>
                        <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Ссылка</label>
                        <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.link_url} onChange={e => setFormData({...formData, link_url: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Позиция (Страница)</label>
                        <select className="w-full border rounded-xl p-3 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
                            <option value="home_top_p1">Главная - Стр 1 - Верх</option>
                            <option value="home_mid_p1">Главная - Стр 1 - Центр</option>
                            <option value="home_top_p2">Главная - Стр 2 - Верх</option>
                            <option value="home_mid_p2">Главная - Стр 2 - Центр</option>
                            <option value="home_top_p3">Главная - Стр 3 - Верх</option>
                            <option value="home_mid_p3">Главная - Стр 3 - Центр</option>
                            <option value="classifieds_top">Объявления - Верх</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Изображение</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 text-center relative hover:bg-gray-50 transition-colors">
                            {formData.image_url ? (
                                <img src={formData.image_url} className="h-32 mx-auto rounded-lg object-cover shadow-sm" />
                            ) : (
                                <div className="py-8 flex flex-col items-center">
                                    <Upload className="w-8 h-8 text-gray-300 mb-2" />
                                    <div className="text-gray-400 text-xs font-bold uppercase">Загрузить файл</div>
                                </div>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
                        </div>
                    </div>

                    <Button className="w-full py-4 shadow-xl shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 border-none" disabled={loading || uploading}>Сохранить баннер</Button>
                </form>
            </div>
        </div>
    );
};

export const CreateTransportModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSuccess, item }) => {
    const [formData, setFormData] = useState({ type: 'city' as 'city' | 'intercity' | 'taxi', routeNumber: '', title: '', schedule: '', workHours: '', price: '', phone: '' });
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (item && isOpen) setFormData({ type: item.type, routeNumber: item.routeNumber || '', title: item.title, schedule: item.schedule, workHours: item.workHours || '', price: item.price?.toString() || '', phone: item.phone || '' });
        else if (!item && isOpen) setFormData({ type: 'city', routeNumber: '', title: '', schedule: '', workHours: '', price: '', phone: '' });
    }, [item, isOpen]);
    if (!isOpen) return null;
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try { if (item) await api.updateTransport(item.id, formData); else await api.createTransport(formData); onSuccess(); onClose(); } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]"><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black dark:text-white uppercase flex items-center gap-2"><Bus className="text-blue-600"/> {item ? 'Править рейс' : 'Новый рейс'}</h2><button onClick={onClose}><X className="text-gray-400"/></button></div><form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Тип</label><div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">{(['city', 'intercity', 'taxi'] as const).map((t) => (<button key={t} type="button" onClick={() => setFormData({ ...formData, type: t })} className={`py-2 text-[10px] font-black uppercase rounded-lg transition-all ${formData.type === t ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' : 'text-gray-400'}`}>{t === 'city' ? 'Город' : t === 'intercity' ? 'Межгород' : 'Такси'}</button>))}</div></div>
            <input className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Название / Маршрут" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            <textarea className="w-full border rounded-xl p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Расписание" rows={3} value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} required />
            <Button className="w-full py-4" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Сохранить'}</Button></form></div></div>
    );
};

export const CreateQuestModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSuccess, item }) => {
    const [formData, setFormData] = useState({ title: '', description: '', image: '', lat: '56.08', lng: '60.73', xpReward: '100' });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (item && isOpen) setFormData({ title: item.title, description: item.description, image: item.image, lat: item.lat.toString(), lng: item.lng.toString(), xpReward: item.xpReward.toString() });
        else if (!item && isOpen) setFormData({ title: '', description: '', image: '', lat: '56.08', lng: '60.73', xpReward: '100' });
    }, [item, isOpen]);
    if (!isOpen) return null;
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return; setUploading(true);
        try { const url = await api.uploadImage(file); setFormData(prev => ({ ...prev, image: url })); } catch (e: any) { alert(e.message); } finally { setUploading(false); }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try { if (item) await api.updateQuest(item.id, formData); else await api.createQuest(formData); onSuccess(); onClose(); } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-top-4 overflow-y-auto max-h-[90vh]"><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2 dark:text-white uppercase"><Trophy className="text-purple-600"/> {item ? 'Изменить квест' : 'Новый квест'}</h2><button onClick={onClose}><X className="text-gray-400"/></button></div><form onSubmit={handleSubmit} className="space-y-4"><input className="w-full border rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Название" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /><textarea className="w-full border rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none" placeholder="Описание" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required /><div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center relative hover:bg-gray-50 dark:hover:bg-gray-700">{formData.image ? <img src={formData.image} className="h-20 mx-auto rounded object-cover" /> : <div className="text-gray-400 text-sm">Фото локации</div>}<input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} /></div><Button className="w-full py-3" disabled={loading || uploading}>{loading ? <Loader2 className="animate-spin" /> : 'Сохранить'}</Button></form></div></div>
    );
};

export const CreateAdminCampaignModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSuccess, item }) => {
    const [formData, setFormData] = useState({ title: '', description: '', targetAmount: '', organizerName: '', image: '' });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (item && isOpen) setFormData({ title: item.title, description: item.description, targetAmount: item.targetAmount.toString(), organizerName: item.organizerName, image: item.image });
        else if (!item && isOpen) setFormData({ title: '', description: '', targetAmount: '', organizerName: '', image: '' });
    }, [item, isOpen]);
    if (!isOpen) return null;
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return; setUploading(true);
        try { const url = await api.uploadImage(file); setFormData(prev => ({ ...prev, image: url })); } catch (e: any) { alert(e.message); } finally { setUploading(false); }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try { if (item) await api.updateCampaign(item.id, formData); else await api.createCampaign(formData); onSuccess(); onClose(); } catch (e: any) { alert(e.message); } finally { setLoading(false); }
    };
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-top-4 overflow-y-auto max-h-[90vh]"><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2 dark:text-white uppercase"><Heart className="text-red-500 fill-current"/> {item ? 'Править сбор' : 'Новый сбор'}</h2><button onClick={onClose}><X className="text-gray-400"/></button></div><form onSubmit={handleSubmit} className="space-y-4"><input className="w-full border rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Название" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /><input className="w-full border rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Организатор" value={formData.organizerName} onChange={e => setFormData({...formData, organizerName: e.target.value})} required /><input type="number" className="w-full border rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Цель (₽)" value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: e.target.value})} required /><textarea className="w-full border rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none" placeholder="Описание" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required /><div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center relative hover:bg-gray-50 dark:hover:bg-gray-700">{formData.image ? <img src={formData.image} className="h-20 mx-auto rounded object-cover" /> : <div className="text-gray-400 text-sm">Обложка сбора</div>}<input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} /></div><Button className="w-full py-3" disabled={loading || uploading}>{loading ? <Loader2 className="animate-spin" /> : 'Сохранить'}</Button></form></div></div>
    );
};
