
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Common';
import { X, Type, Link as LinkIcon, Trash2, Check, ZoomIn, ZoomOut, Upload, Loader2, MousePointer2, Palette, Maximize2 } from 'lucide-react';
import { api } from '../services/api';
import { StoryElement, StoryConfig } from '../types';

interface StoryEditorProps {
    initialMedia?: string;
    initialCaption?: string;
    initialConfig?: StoryConfig;
    onSave: (media: string, caption: string, config: StoryConfig) => Promise<void>;
    onClose: () => void;
}

const PRESET_COLORS = [
    { bg: 'rgba(0,0,0,0.6)', color: 'white', label: 'Тёмный' },
    { bg: 'white', color: 'black', label: 'Светлый' },
    { bg: 'rgba(37, 99, 235, 0.8)', color: 'white', label: 'Синий' },
    { bg: 'rgba(239, 68, 68, 0.8)', color: 'white', label: 'Красный' },
    { bg: 'transparent', color: 'white', label: 'Прозр.' },
];

export const StoryEditor: React.FC<StoryEditorProps> = ({ initialMedia, initialCaption, initialConfig, onSave, onClose }) => {
    const [media, setMedia] = useState(initialMedia || '');
    const [uploading, setUploading] = useState(false);
    
    const [transform, setTransform] = useState(initialConfig?.transform || { x: 0, y: 0, scale: 1 });
    const [isDraggingBg, setIsDraggingBg] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const bgRef = useRef<HTMLDivElement>(null);

    const [elements, setElements] = useState<StoryElement[]>(initialConfig?.elements || []);
    const [activeElementId, setActiveElementId] = useState<string | null>(null);
    const [isDraggingEl, setIsDraggingEl] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    const [showTextOptions, setShowTextOptions] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [showLinkOptions, setShowLinkOptions] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkLabel, setLinkLabel] = useState('');
    
    const [caption, setCaption] = useState(initialCaption || '');
    const [saving, setSaving] = useState(false);

    const [lastY, setLastY] = useState(0);
    const [isOverTrash, setIsOverTrash] = useState(false);

    const activeElement = elements.find(e => e.id === activeElementId);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setMedia(url);
            setTransform({ x: 0, y: 0, scale: 1 });
        } catch (e: any) { alert(e.message); } finally { setUploading(false); }
    };

    const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
        const scale = parseFloat(e.target.value);
        if (activeElementId) {
            setElements(prev => prev.map(el => 
                el.id === activeElementId ? { ...el, scale } : el
            ));
        } else {
            setTransform(prev => ({ ...prev, scale }));
        }
    };

    const startPan = (e: React.MouseEvent | React.TouchEvent) => {
        if ('target' in e && (e.target as HTMLElement).closest('.story-element')) return;
        setIsDraggingBg(true);
        setActiveElementId(null);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragStartRef.current = { x: clientX - transform.x, y: clientY - transform.y };
    };

    const movePan = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDraggingBg) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setTransform(prev => ({ ...prev, x: clientX - dragStartRef.current.x, y: clientY - dragStartRef.current.y }));
    };

    const endPan = () => setIsDraggingBg(false);

    const addText = () => {
        if (!textInput.trim()) return;
        const newEl: StoryElement = {
            id: Date.now().toString(),
            type: 'text',
            x: 50, y: 50,
            content: textInput,
            color: 'white',
            bg: 'rgba(0,0,0,0.6)',
            scale: 1
        };
        setElements(prev => [...prev, newEl]);
        setTextInput('');
        setShowTextOptions(false);
        setActiveElementId(newEl.id);
    };

    const addLink = () => {
        if (!linkUrl.trim() || !linkLabel.trim()) return;
        const newEl: StoryElement = {
            id: Date.now().toString(),
            type: 'link',
            x: 50, y: 50,
            content: linkLabel,
            url: linkUrl,
            color: 'black',
            bg: 'white',
            scale: 1
        };
        setElements(prev => [...prev, newEl]);
        setLinkUrl(''); setLinkLabel('');
        setShowLinkOptions(false);
        setActiveElementId(newEl.id);
    };

    const deleteElement = (id: string) => {
        setElements(prev => prev.filter(e => e.id !== id));
        setActiveElementId(null);
    };

    const changeElementStyle = (style: typeof PRESET_COLORS[0]) => {
        if (!activeElementId) return;
        setElements(prev => prev.map(el => 
            el.id === activeElementId ? { ...el, bg: style.bg, color: style.color } : el
        ));
    };

    const startDragElement = (e: React.MouseEvent | React.TouchEvent, id: string) => {
        e.stopPropagation();
        const el = elements.find(item => item.id === id);
        if (!el || !bgRef.current) return;

        setActiveElementId(id);
        setIsDraggingEl(true);

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const rect = bgRef.current.getBoundingClientRect();
        
        // Calculate where inside the element we clicked (in percentages)
        const xPct = ((clientX - rect.left) / rect.width) * 100;
        const yPct = ((clientY - rect.top) / rect.height) * 100;
        
        setDragOffset({
            x: xPct - el.x,
            y: yPct - el.y
        });
    };

    useEffect(() => {
        const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
            if (!isDraggingEl || !activeElementId || !bgRef.current) return;
            
            // Prevent scrolling/refresh on mobile while dragging
            if (e.cancelable) e.preventDefault();
            
            const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
            const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
            
            const rect = bgRef.current.getBoundingClientRect();
            const xPct = ((clientX - rect.left) / rect.width) * 100;
            const yPct = ((clientY - rect.top) / rect.height) * 100;
            
            const newX = xPct - dragOffset.x;
            const newY = yPct - dragOffset.y;
            
            setLastY(newY);
            setIsOverTrash(newY > 90);
            
            setElements(prev => prev.map(el => 
                el.id === activeElementId 
                    ? { ...el, x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) } 
                    : el
            ));
        };

        const handleGlobalUp = () => {
            if (isDraggingEl) {
                endDragElement();
            }
        };

        if (isDraggingEl) {
            window.addEventListener('mousemove', handleGlobalMove);
            window.addEventListener('mouseup', handleGlobalUp);
            window.addEventListener('touchmove', handleGlobalMove, { passive: false });
            window.addEventListener('touchend', handleGlobalUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMove);
            window.removeEventListener('mouseup', handleGlobalUp);
            window.removeEventListener('touchmove', handleGlobalMove);
            window.removeEventListener('touchend', handleGlobalUp);
        };
    }, [isDraggingEl, activeElementId, dragOffset]);

    const endDragElement = () => {
        if (isDraggingEl && activeElementId && lastY > 90) {
            deleteElement(activeElementId);
        }
        setIsDraggingEl(false);
        setIsOverTrash(false);
    };

    const handleSave = async () => {
        if (!media) return;
        setSaving(true);
        try {
            await onSave(media, caption, { transform, elements });
            onClose();
        } catch (e: any) { alert("Error: " + e.message); } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black text-white flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-[60] bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X className="w-6 h-6" /></button>
                <div className="flex gap-2">
                    <button onClick={() => setShowTextOptions(true)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 flex items-center gap-2 transition-all active:scale-95"><Type className="w-5 h-5" /><span className="text-[10px] font-black uppercase hidden sm:inline">Текст</span></button>
                    <button onClick={() => setShowLinkOptions(true)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 flex items-center gap-2 transition-all active:scale-95"><LinkIcon className="w-5 h-5" /><span className="text-[10px] font-black uppercase hidden sm:inline">Ссылка</span></button>
                </div>
                <Button onClick={handleSave} disabled={!media || saving} className="bg-blue-600 text-white hover:bg-blue-700 border-none font-black uppercase text-xs tracking-widest px-8 py-3 rounded-2xl shadow-xl shadow-blue-500/20">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Готово'}</Button>
            </div>

            <div 
                ref={bgRef}
                className="relative w-full max-w-md aspect-[9/16] bg-gray-900 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] my-auto select-none"
                onMouseDown={startPan}
                onTouchStart={startPan}
                onMouseMove={(e) => { movePan(e); }}
                onTouchMove={(e) => { movePan(e); }}
                onMouseUp={() => { endPan(); }}
                onTouchEnd={() => { endPan(); }}
                onMouseLeave={() => { endPan(); }}
            >
                {media ? (
                    <div 
                        className="w-full h-full origin-center pointer-events-none"
                        style={{
                            backgroundImage: `url(${media})`,
                            backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                            willChange: 'transform'
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                        {uploading ? <Loader2 className="w-12 h-12 animate-spin text-blue-500" /> : <><div className="p-8 bg-white/5 rounded-[2.5rem]"><Upload className="w-16 h-16 opacity-20" /></div><p className="font-black uppercase tracking-widest text-[10px]">Загрузите фото для истории</p><input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} /></>}
                    </div>
                )}

                {elements.map(el => (
                    <div
                        key={el.id}
                        onMouseDown={(e) => startDragElement(e, el.id)}
                        onTouchStart={(e) => startDragElement(e, el.id)}
                        className={`story-element absolute cursor-move select-none transform -translate-x-1/2 -translate-y-1/2 px-5 py-3 rounded-2xl text-sm font-black shadow-2xl flex items-center gap-2 ${isDraggingEl && activeElementId === el.id ? 'transition-none z-[100] scale-110 ring-4 ring-blue-500 shadow-blue-500/20' : 'transition-all z-40'} ${activeElementId === el.id && !isDraggingEl ? 'ring-4 ring-blue-500 scale-105' : ''}`}
                        style={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            backgroundColor: el.bg,
                            color: el.color,
                            transform: `translate(-50%, -50%) scale(${el.scale || 1})`,
                        }}
                    >
                        {el.type === 'link' && <LinkIcon className="w-3 h-3" />}
                        {el.content}
                    </div>
                ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-[70] flex flex-col items-center gap-6 pointer-events-none">
                <div className="w-full max-w-md flex flex-col items-center pointer-events-auto">
                    {isDraggingEl && (
                        <div className={`mb-4 flex flex-col items-center transition-all duration-200 ${isOverTrash ? 'text-red-500 scale-125' : 'text-white/40 scale-100'}`}>
                            <div className={`p-4 rounded-full transition-all ${isOverTrash ? 'bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-white/5'}`}>
                                <Trash2 className={`w-10 h-10 ${isOverTrash ? 'animate-pulse' : ''}`} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest mt-2">{isOverTrash ? 'Отпустите для удаления' : 'Перетащите сюда для удаления'}</span>
                        </div>
                    )}

                    {activeElementId ? (
                        <div className="w-full max-w-sm bg-white/10 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 animate-in slide-in-from-bottom-6 duration-300 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Настройки элемента</span>
                                <button onClick={() => deleteElement(activeElementId)} className="p-2.5 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 className="w-4 h-4"/></button>
                            </div>
                            
                            <div className="space-y-6">
                                {activeElement?.type === 'text' ? (
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Текст</label>
                                        <input 
                                            className="w-full bg-white/5 border-none rounded-xl p-3 text-white font-bold focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" 
                                            value={activeElement.content} 
                                            onChange={(e) => setElements(prev => prev.map(el => el.id === activeElementId ? { ...el, content: e.target.value } : el))}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Текст кнопки</label>
                                            <input 
                                                className="w-full bg-white/5 border-none rounded-xl p-3 text-white font-bold focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" 
                                                value={activeElement?.content} 
                                                onChange={(e) => setElements(prev => prev.map(el => el.id === activeElementId ? { ...el, content: e.target.value } : el))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Ссылка</label>
                                            <input 
                                                className="w-full bg-white/5 border-none rounded-xl p-3 text-blue-400 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" 
                                                value={activeElement?.url} 
                                                onChange={(e) => setElements(prev => prev.map(el => el.id === activeElementId ? { ...el, url: e.target.value } : el))}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Maximize2 className="w-4 h-4 text-gray-400 shrink-0" />
                                    <input type="range" min="0.5" max="3" step="0.1" value={activeElement?.scale || 1} onChange={handleZoom} className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-full" />
                                    <span className="text-[10px] font-black w-8 text-right">{(activeElement?.scale || 1).toFixed(1)}x</span>
                                </div>

                                <div className="flex justify-between gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    {PRESET_COLORS.map((style, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => changeElementStyle(style)}
                                            className="flex-1 flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-lg border border-white/20 shadow-sm" style={{ backgroundColor: style.bg }} />
                                            <span className="text-[8px] font-black uppercase text-gray-400">{style.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <input className="bg-transparent border-b-2 border-white/20 text-white placeholder-white/30 w-full max-w-md text-center py-3 mb-4 focus:border-blue-500 outline-none transition-all font-bold" placeholder="Добавить подпись истории..." value={caption} onChange={e => setCaption(e.target.value)} />
                            {media && (
                                <div className="flex items-center gap-4 w-full max-w-xs">
                                    <ZoomOut className="w-4 h-4 text-gray-500" />
                                    <input type="range" min="0.1" max="3" step="0.1" value={transform.scale} onChange={handleZoom} className="flex-1 accent-white h-1 bg-white/10 rounded-full" />
                                    <ZoomIn className="w-4 h-4 text-gray-500" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {showTextOptions && (
                <div className="absolute inset-0 bg-black/90 z-[130] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-sm text-center">
                        <textarea autoFocus className="w-full bg-transparent text-white text-3xl font-black text-center border-none outline-none placeholder-white/20 mb-8 resize-none" placeholder="Введите текст..." value={textInput} onChange={e => setTextInput(e.target.value)} rows={3} />
                        <div className="flex gap-4">
                            <button className="flex-1 py-4 bg-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/20" onClick={() => setShowTextOptions(false)}>Отмена</button>
                            <Button className="flex-1 py-4 rounded-2xl uppercase tracking-widest" onClick={addText}>Добавить</Button>
                        </div>
                    </div>
                </div>
            )}

            {showLinkOptions && (
                <div className="absolute inset-0 bg-black/90 z-[130] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-gray-800 p-8 rounded-[2.5rem] w-full max-w-sm space-y-6 shadow-2xl border border-white/5">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-lg uppercase tracking-tight">Кнопка-ссылка</h3>
                            <div className="p-2 bg-blue-500/20 text-blue-500 rounded-xl"><LinkIcon className="w-5 h-5" /></div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Название кнопки</label>
                                <input className="w-full bg-gray-900 border-none rounded-2xl p-4 text-white font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Напр: Заказать / Купить" value={linkLabel} onChange={e => setLinkLabel(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Адрес ссылки (URL)</label>
                                <input className="w-full bg-gray-900 border-none rounded-2xl p-4 text-blue-400 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="https://..." value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button className="flex-1 py-4 bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-gray-400" onClick={() => setShowLinkOptions(false)}>Отмена</button>
                            <Button className="flex-1 py-4 rounded-2xl" onClick={addLink}>Создать</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
