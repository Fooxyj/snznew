
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Common';
import { X, Type, Link as LinkIcon, Trash2, Check, ZoomIn, ZoomOut, Upload, Loader2, MousePointer2 } from 'lucide-react';
import { api } from '../services/api';
import { StoryElement, StoryConfig } from '../types';

interface StoryEditorProps {
    initialMedia?: string;
    onSave: (media: string, caption: string, config: StoryConfig) => Promise<void>;
    onClose: () => void;
}

export const StoryEditor: React.FC<StoryEditorProps> = ({ initialMedia, onSave, onClose }) => {
    // Media State
    const [media, setMedia] = useState(initialMedia || '');
    const [uploading, setUploading] = useState(false);
    
    // Transform State (Zoom/Pan)
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isDraggingBg, setIsDraggingBg] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const bgRef = useRef<HTMLDivElement>(null);

    // Elements State
    const [elements, setElements] = useState<StoryElement[]>([]);
    const [activeElementId, setActiveElementId] = useState<string | null>(null);
    const [isDraggingEl, setIsDraggingEl] = useState(false);
    
    // UI State for Editing Elements
    const [showTextOptions, setShowTextOptions] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [showLinkOptions, setShowLinkOptions] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkLabel, setLinkLabel] = useState('');
    
    const [caption, setCaption] = useState(''); // Simple caption fallback
    const [saving, setSaving] = useState(false);

    // --- Media Handler ---
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setMedia(url);
            // Reset transform when new image loads
            setTransform({ x: 0, y: 0, scale: 1 });
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUploading(false);
        }
    };

    // --- Background Pan/Zoom Logic ---
    const handleZoom = (e: React.ChangeEvent<HTMLInputElement>) => {
        const scale = parseFloat(e.target.value);
        setTransform(prev => ({ ...prev, scale }));
    };

    const startPan = (e: React.MouseEvent | React.TouchEvent) => {
        // Only pan if we are not clicking an element
        if (activeElementId) return;
        setIsDraggingBg(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragStartRef.current = { x: clientX - transform.x, y: clientY - transform.y };
    };

    const movePan = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDraggingBg) return;
        e.preventDefault();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        setTransform(prev => ({
            ...prev,
            x: clientX - dragStartRef.current.x,
            y: clientY - dragStartRef.current.y
        }));
    };

    const endPan = () => setIsDraggingBg(false);

    // --- Elements Logic ---
    const addText = () => {
        if (!textInput.trim()) return;
        const newEl: StoryElement = {
            id: Date.now().toString(),
            type: 'text',
            x: 50, y: 50, // Center
            content: textInput,
            color: 'white',
            bg: 'rgba(0,0,0,0.5)'
        };
        setElements(prev => [...prev, newEl]);
        setTextInput('');
        setShowTextOptions(false);
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
            bg: 'white'
        };
        setElements(prev => [...prev, newEl]);
        setLinkUrl('');
        setLinkLabel('');
        setShowLinkOptions(false);
    };

    const deleteElement = (id: string) => {
        setElements(prev => prev.filter(e => e.id !== id));
        setActiveElementId(null);
    };

    // --- Element Drag Logic ---
    const startDragElement = (e: React.MouseEvent | React.TouchEvent, id: string) => {
        e.stopPropagation(); // Stop background pan
        setActiveElementId(id);
        setIsDraggingEl(true);
        // We don't need drag offset for simple center-based positioning logic relative to container
    };

    const moveDragElement = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDraggingEl || !activeElementId || !bgRef.current) return;
        e.preventDefault(); // Prevent scroll
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        // Calculate new position as percentage of container
        const rect = bgRef.current.getBoundingClientRect();
        const xPct = ((clientX - rect.left) / rect.width) * 100;
        const yPct = ((clientY - rect.top) / rect.height) * 100;

        // Clamp to 0-100
        const clampedX = Math.max(0, Math.min(100, xPct));
        const clampedY = Math.max(0, Math.min(100, yPct));

        setElements(prev => prev.map(el => 
            el.id === activeElementId ? { ...el, x: clampedX, y: clampedY } : el
        ));
    };

    const endDragElement = () => setIsDraggingEl(false);

    // --- Saving ---
    const handleSave = async () => {
        if (!media) return;
        setSaving(true);
        try {
            const config: StoryConfig = {
                transform,
                elements
            };
            await onSave(media, caption, config);
            onClose();
        } catch (e: any) {
            alert("Error saving story: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black text-white flex flex-col items-center justify-center">
            
            {/* Top Toolbar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-[60] bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X className="w-6 h-6" /></button>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowTextOptions(true)} 
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 flex items-center gap-2"
                    >
                        <Type className="w-5 h-5" />
                        <span className="text-xs font-bold hidden sm:inline">Текст</span>
                    </button>
                    <button 
                        onClick={() => setShowLinkOptions(true)} 
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 flex items-center gap-2"
                    >
                        <LinkIcon className="w-5 h-5" />
                        <span className="text-xs font-bold hidden sm:inline">Ссылка</span>
                    </button>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={!media || saving}
                    className="bg-white text-black hover:bg-gray-200 border-none font-bold"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Опубликовать'}
                </Button>
            </div>

            {/* Main Stage */}
            <div 
                ref={bgRef}
                className="relative w-full max-w-md aspect-[9/16] bg-gray-900 overflow-hidden shadow-2xl my-auto select-none"
                onMouseDown={startPan}
                onTouchStart={startPan}
                onMouseMove={(e) => { movePan(e); moveDragElement(e); }}
                onTouchMove={(e) => { movePan(e); moveDragElement(e); }}
                onMouseUp={() => { endPan(); endDragElement(); }}
                onTouchEnd={() => { endPan(); endDragElement(); }}
                onMouseLeave={() => { endPan(); endDragElement(); }}
            >
                {/* Background Layer */}
                {media ? (
                    <div 
                        className="w-full h-full origin-center pointer-events-none"
                        style={{
                            backgroundImage: `url(${media})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                            willChange: 'transform'
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        {uploading ? (
                            <Loader2 className="w-12 h-12 animate-spin mb-2" />
                        ) : (
                            <>
                                <Upload className="w-12 h-12 mb-2" />
                                <p>Загрузите фото</p>
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
                            </>
                        )}
                    </div>
                )}

                {/* Elements Layer */}
                {elements.map(el => (
                    <div
                        key={el.id}
                        onMouseDown={(e) => startDragElement(e, el.id)}
                        onTouchStart={(e) => startDragElement(e, el.id)}
                        className={`absolute cursor-move select-none transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 ${activeElementId === el.id ? 'ring-2 ring-blue-500 z-50' : 'z-40'}`}
                        style={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            backgroundColor: el.bg,
                            color: el.color,
                            maxWidth: '80%'
                        }}
                    >
                        {el.type === 'link' && <LinkIcon className="w-3 h-3" />}
                        {el.content}
                        {activeElementId === el.id && (
                            <button 
                                onMouseDown={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                                onTouchStart={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                                className="ml-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent z-20 flex flex-col items-center">
                {/* Trash Zone Indicator (Visual only, simple implementation) */}
                {isDraggingEl && (
                    <div className="mb-4 text-red-500 flex flex-col items-center animate-pulse">
                        <Trash2 className="w-8 h-8" />
                        <span className="text-xs font-bold">Удалить</span>
                    </div>
                )}

                {/* Caption Input */}
                <input 
                    className="bg-transparent border-b border-white/30 text-white placeholder-white/50 w-full max-w-md text-center py-2 mb-4 focus:border-white outline-none"
                    placeholder="Добавить подпись (для скринридеров)..."
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                />

                {/* Zoom Slider */}
                <div className="flex items-center gap-4 w-full max-w-xs">
                    <ZoomOut className="w-4 h-4 text-gray-400" />
                    <input 
                        type="range" 
                        min="0.5" 
                        max="3" 
                        step="0.1" 
                        value={transform.scale} 
                        onChange={handleZoom}
                        className="flex-1 accent-white"
                    />
                    <ZoomIn className="w-4 h-4 text-gray-400" />
                </div>
            </div>

            {/* Input Overlays */}
            {showTextOptions && (
                <div className="absolute inset-0 bg-black/80 z-[130] flex items-center justify-center p-4">
                    <div className="w-full max-w-sm">
                        <input 
                            autoFocus
                            className="w-full bg-transparent text-white text-3xl font-bold text-center border-none outline-none placeholder-white/30 mb-4"
                            placeholder="Введите текст..."
                            value={textInput}
                            onChange={e => setTextInput(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button variant="secondary" className="flex-1" onClick={() => setShowTextOptions(false)}>Отмена</Button>
                            <Button className="flex-1" onClick={addText}>Добавить</Button>
                        </div>
                    </div>
                </div>
            )}

            {showLinkOptions && (
                <div className="absolute inset-0 bg-black/80 z-[130] flex items-center justify-center p-4">
                    <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-sm space-y-4">
                        <h3 className="font-bold text-lg">Добавить кнопку-ссылку</h3>
                        <div>
                            <label className="text-xs text-gray-400">Текст на кнопке</label>
                            <input 
                                className="w-full bg-gray-700 rounded p-2 text-white border border-gray-600"
                                placeholder="Например: Купить билет"
                                value={linkLabel}
                                onChange={e => setLinkLabel(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400">Адрес ссылки</label>
                            <input 
                                className="w-full bg-gray-700 rounded p-2 text-white border border-gray-600"
                                placeholder="https://..."
                                value={linkUrl}
                                onChange={e => setLinkUrl(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button variant="secondary" className="flex-1 bg-gray-700 text-white border-none" onClick={() => setShowLinkOptions(false)}>Отмена</Button>
                            <Button className="flex-1" onClick={addLink}>Добавить</Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
