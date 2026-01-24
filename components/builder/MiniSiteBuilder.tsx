import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { PageBlock, ExclusivePage } from '../../types';
// Comment above fix: Added missing Badge import from Common components to resolve build errors in block headers
import { Button, Badge } from '../ui/Common';
import { 
    Plus, Trash2, ChevronUp, ChevronDown, Save, 
    Layout, Image as ImageIcon, CreditCard, 
    Type, Loader2, Wand2, Monitor, Smartphone, Check,
    Type as TypeIcon, AlignLeft, DollarSign, Camera
} from 'lucide-react';
import { useToast } from '../ToastProvider';

export const MiniSiteBuilder: React.FC<{ businessId: string }> = ({ businessId }) => {
    const { success, error: showError } = useToast();
    const [blocks, setBlocks] = useState<PageBlock[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

    const { data: page, isLoading } = useQuery({
        queryKey: ['businessMinisite', businessId],
        queryFn: () => api.getMiniSiteByBusiness(businessId),
    });

    useEffect(() => {
        if (page?.blocks_config) setBlocks(page.blocks_config);
    }, [page]);

    const addBlock = (type: 'hero' | 'grid' | 'pricing') => {
        const newBlock: PageBlock = {
            id: Math.random().toString(36).substring(7),
            type,
            title: type === 'hero' ? 'Добро пожаловать!' : type === 'grid' ? 'Наши услуги' : 'Прайс-лист',
            subtitle: type === 'hero' ? 'Мы делаем мир лучше каждый день' : '',
            items: type === 'hero' ? [] : [{ name: 'Новая позиция', desc: 'Описание', price: '1000' }],
            config: type === 'hero' ? { bg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200' } : {}
        };
        setBlocks([...blocks, newBlock]);
    };

    const removeBlock = (id: string) => setBlocks(blocks.filter(b => b.id !== id));
    
    const moveBlock = (index: number, dir: 'up' | 'down') => {
        const newBlocks = [...blocks];
        const nextIndex = dir === 'up' ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= blocks.length) return;
        [newBlocks[index], newBlocks[nextIndex]] = [newBlocks[nextIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const updateBlock = (id: string, updates: Partial<PageBlock>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.saveMiniSite(businessId, {
                title: page?.title || 'Моя страница',
                description: page?.description || '',
                image_url: page?.image_url || blocks.find(b => b.type === 'hero')?.config?.bg || '',
                blocks_config: blocks
            });
            success("Сайт успешно опубликован!");
        } catch (e: any) {
            showError(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="flex flex-col lg:flex-row h-full gap-6 animate-in fade-in">
            {/* Панель настроек */}
            <div className="w-full lg:w-[450px] flex flex-col h-full bg-white dark:bg-gray-800 rounded-3xl border dark:border-gray-700 shadow-sm overflow-hidden shrink-0">
                <div className="p-5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-xs uppercase tracking-widest text-gray-500">Снежинск Билдер</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Визуальный редактор</p>
                    </div>
                    <div className="flex gap-1.5">
                        <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-xl transition-all ${previewMode === 'desktop' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:bg-gray-100'}`}><Monitor className="w-4 h-4" /></button>
                        <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-xl transition-all ${previewMode === 'mobile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:bg-gray-100'}`}><Smartphone className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                    {blocks.map((block, idx) => (
                        <div key={block.id} className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-gray-100 dark:border-gray-700 relative group animate-in slide-in-from-left-2">
                            <div className="flex justify-between items-center mb-5">
                                <Badge color={block.type === 'hero' ? 'blue' : 'gray'} className="px-2 py-0.5">{block.type.toUpperCase()}</Badge>
                                <div className="flex gap-1">
                                    <button onClick={() => moveBlock(idx, 'up')} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><ChevronUp className="w-4 h-4"/></button>
                                    <button onClick={() => moveBlock(idx, 'down')} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><ChevronDown className="w-4 h-4"/></button>
                                    <button onClick={() => removeBlock(block.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors ml-2"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Общие поля для всех блоков */}
                                <div className="relative">
                                    <TypeIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input 
                                        className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 font-bold text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={block.title}
                                        onChange={e => updateBlock(block.id, { title: e.target.value })}
                                        placeholder="Заголовок блока"
                                    />
                                </div>

                                {/* Специфичные поля HERO */}
                                {block.type === 'hero' && (
                                    <div className="space-y-4 animate-in fade-in">
                                        <div className="relative">
                                            <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <input 
                                                className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm dark:text-white outline-none"
                                                value={block.subtitle}
                                                onChange={e => updateBlock(block.id, { subtitle: e.target.value })}
                                                placeholder="Подзаголовок (слоган)"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Camera className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <input 
                                                className="w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs dark:text-white outline-none"
                                                value={block.config?.bg}
                                                onChange={e => updateBlock(block.id, { config: { ...block.config, bg: e.target.value } })}
                                                placeholder="Ссылка на фото фона (URL)"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Элементы для GRID и PRICING */}
                                {(block.type === 'grid' || block.type === 'pricing') && (
                                    <div className="space-y-3 pt-2">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Элементы списка</div>
                                        {block.items?.map((item, itemIdx) => (
                                            <div key={itemIdx} className="bg-white dark:bg-gray-800 p-3 rounded-xl border dark:border-gray-700 space-y-2 relative group/item">
                                                <button 
                                                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                                                    onClick={() => {
                                                        const newItems = block.items?.filter((_, i) => i !== itemIdx);
                                                        updateBlock(block.id, { items: newItems });
                                                    }}
                                                >
                                                    <XCircleIcon className="w-4 h-4" />
                                                </button>
                                                <input 
                                                    className="w-full text-xs font-bold bg-transparent border-b dark:border-gray-700 pb-1 outline-none focus:border-blue-500" 
                                                    value={item.name} 
                                                    placeholder="Название"
                                                    onChange={e => {
                                                        const newItems = [...(block.items || [])];
                                                        newItems[itemIdx] = { ...item, name: e.target.value };
                                                        updateBlock(block.id, { items: newItems });
                                                    }}
                                                />
                                                <div className="flex gap-2">
                                                    <input 
                                                        className="flex-1 text-[10px] bg-transparent outline-none" 
                                                        value={item.desc} 
                                                        placeholder="Краткое описание"
                                                        onChange={e => {
                                                            const newItems = [...(block.items || [])];
                                                            newItems[itemIdx] = { ...item, desc: e.target.value };
                                                            updateBlock(block.id, { items: newItems });
                                                        }}
                                                    />
                                                    <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded text-[10px] font-black text-blue-600">
                                                        <input 
                                                            className="w-12 bg-transparent text-right outline-none" 
                                                            value={item.price} 
                                                            onChange={e => {
                                                                const newItems = [...(block.items || [])];
                                                                newItems[itemIdx] = { ...item, price: e.target.value };
                                                                updateBlock(block.id, { items: newItems });
                                                            }}
                                                        /> 
                                                        <span>₽</span>
                                                    </div>
                                                </div>
                                                {block.type === 'grid' && (
                                                    <input 
                                                        className="w-full text-[9px] text-gray-400 bg-transparent outline-none" 
                                                        value={item.img} 
                                                        placeholder="Ссылка на картинку (URL)"
                                                        onChange={e => {
                                                            const newItems = [...(block.items || [])];
                                                            newItems[itemIdx] = { ...item, img: e.target.value };
                                                            updateBlock(block.id, { items: newItems });
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        <button 
                                            className="w-full py-2 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-all"
                                            onClick={() => {
                                                const newItems = [...(block.items || []), { name: 'Новая позиция', desc: '', price: '0', img: '' }];
                                                updateBlock(block.id, { items: newItems });
                                            }}
                                        >
                                            + Добавить позицию
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="grid grid-cols-1 gap-2 pt-4">
                        <button onClick={() => addBlock('hero')} className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
                            <ImageIcon className="w-4 h-4" /> Добавить обложку
                        </button>
                        <button onClick={() => addBlock('grid')} className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
                            <Layout className="w-4 h-4" /> Добавить витрину
                        </button>
                        <button onClick={() => addBlock('pricing')} className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
                            <CreditCard className="w-4 h-4" /> Добавить прайс
                        </button>
                    </div>
                </div>

                <div className="p-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving || blocks.length === 0}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-4 h-4 mr-2" /> Опубликовать сайт</>}
                    </Button>
                </div>
            </div>

            {/* Live Preview Container */}
            <div className="flex-1 flex flex-col h-full bg-gray-200 dark:bg-black rounded-[2.5rem] overflow-hidden border-8 border-white dark:border-gray-800 shadow-2xl relative transition-all duration-700">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-5 py-2 bg-black/40 backdrop-blur-2xl text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-full border border-white/10 shadow-2xl">
                    Live Preview • {previewMode === 'desktop' ? 'Desktop' : 'Mobile'}
                </div>

                <div className={`h-full mx-auto bg-white dark:bg-gray-950 transition-all duration-500 overflow-y-auto custom-scrollbar ${previewMode === 'mobile' ? 'w-[375px] my-12 rounded-[3.5rem] border-[14px] border-gray-900 shadow-[0_0_0_4px_#374151]' : 'w-full'}`}>
                    {blocks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-blue-100 dark:border-blue-900/30 animate-pulse">
                                <Wand2 className="w-12 h-12 text-blue-500" />
                            </div>
                            <h4 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Начните творить</h4>
                            <p className="text-sm mt-3 font-bold text-gray-400 uppercase tracking-widest">Добавьте первый блок слева</p>
                        </div>
                    ) : (
                        <div className="w-full">
                            {blocks.map((block) => (
                                <section key={block.id} className="animate-in fade-in duration-700">
                                    {block.type === 'hero' && (
                                        <div className="relative h-[450px] w-full flex items-center justify-center overflow-hidden">
                                            {block.config?.bg && <img src={block.config.bg} className="absolute inset-0 w-full h-full object-cover animate-fade-in" alt="" />}
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
                                            <div className="relative z-10 text-center px-10 max-w-2xl">
                                                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-none">{block.title}</h1>
                                                <p className="text-base md:text-lg text-blue-100/70 uppercase tracking-[0.2em] font-medium leading-relaxed">{block.subtitle}</p>
                                                <div className="mt-10 h-1 w-20 bg-blue-500 mx-auto rounded-full"></div>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'grid' && (
                                        <div className="py-20 px-8">
                                            <div className="max-w-4xl mx-auto">
                                                <h2 className="text-3xl font-black uppercase border-l-8 border-blue-600 pl-6 mb-12 dark:text-white tracking-tighter">{block.title}</h2>
                                                <div className={`grid gap-6 ${previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
                                                    {block.items?.map((item, i) => (
                                                        <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-[2rem] border dark:border-gray-800 overflow-hidden group">
                                                            <div className="aspect-square bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                                                {item.img ? <img src={item.img} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-400" /></div>}
                                                            </div>
                                                            <div className="p-6">
                                                                <h4 className="font-black text-sm uppercase dark:text-white mb-2">{item.name}</h4>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-4 leading-relaxed">{item.desc}</p>
                                                                <div className="font-black text-blue-600 text-lg">{item.price} ₽</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {block.type === 'pricing' && (
                                        <div className="py-20 px-8 bg-gray-50 dark:bg-gray-900/30">
                                            <div className="max-w-2xl mx-auto">
                                                <h2 className="text-3xl font-black uppercase text-center mb-12 dark:text-white tracking-tighter">{block.title}</h2>
                                                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border dark:border-gray-700 shadow-xl overflow-hidden divide-y dark:divide-gray-800">
                                                    {block.items?.map((item, i) => (
                                                        <div key={i} className="flex justify-between items-center p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                                            <div>
                                                                <span className="text-sm font-black uppercase dark:text-gray-100">{item.name}</span>
                                                                {item.desc && <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{item.desc}</p>}
                                                            </div>
                                                            <span className="font-black text-blue-600 text-xl tracking-tighter">{item.price} ₽</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const XCircleIcon: React.FC<any> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
);