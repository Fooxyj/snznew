
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Story, User, UserRole, Business } from '../types';
import { Plus, X, Loader2, ChevronLeft, ChevronRight, Eye, Users, User as UserIcon, Building2, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/Common';
import { StoryEditor } from './StoryEditor';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastProvider';

const StoryViewer: React.FC<{ 
    allStories: Story[]; 
    initialAuthorId: string;
    currentUser: User | null;
    onClose: () => void 
}> = ({ allStories, initialAuthorId, currentUser, onClose }) => {
    const navigate = useNavigate();
    
    const authorIds = useMemo(() => {
        const ids: string[] = [];
        allStories.forEach(s => {
            if (!ids.includes(s.authorId)) ids.push(s.authorId);
        });
        return ids;
    }, [allStories]);

    const [currentAuthorId, setCurrentAuthorId] = useState(initialAuthorId);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    
    const [progress, setProgress] = useState(0);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const timerRef = useRef<any>(null);
    const touchStartRef = useRef<number | null>(null);

    const currentAuthorStories = useMemo(() => 
        allStories.filter(s => s.authorId === currentAuthorId),
    [allStories, currentAuthorId]);

    const activeStory = currentAuthorStories[currentStoryIndex];

    const handleNext = useCallback(() => {
        if (currentStoryIndex < currentAuthorStories.length - 1) {
            setIsImageLoaded(false);
            setCurrentStoryIndex(prev => prev + 1);
            setProgress(0);
        } else {
            const currentAuthorIdx = authorIds.indexOf(currentAuthorId);
            if (currentAuthorIdx < authorIds.length - 1) {
                setIsImageLoaded(false);
                setCurrentAuthorId(authorIds[currentAuthorIdx + 1]);
                setCurrentStoryIndex(0);
                setProgress(0);
            } else {
                onClose();
            }
        }
        setShowStats(false);
    }, [currentStoryIndex, currentAuthorStories.length, currentAuthorId, authorIds, onClose]);

    const handlePrev = useCallback(() => {
        if (currentStoryIndex > 0) {
            setIsImageLoaded(false);
            setCurrentStoryIndex(prev => prev - 1);
            setProgress(0);
        } else {
            const currentAuthorIdx = authorIds.indexOf(currentAuthorId);
            if (currentAuthorIdx > 0) {
                const prevAuthorId = authorIds[currentAuthorIdx - 1];
                const prevAuthorStories = allStories.filter(s => s.authorId === prevAuthorId);
                setIsImageLoaded(false);
                setCurrentAuthorId(prevAuthorId);
                setCurrentStoryIndex(prevAuthorStories.length - 1);
                setProgress(0);
            }
        }
        setShowStats(false);
    }, [currentStoryIndex, currentAuthorId, authorIds, allStories]);

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStartRef.current - touchEnd;

        if (Math.abs(diff) > 50) { 
            if (diff > 0) handleNext(); 
            else handlePrev(); 
        }
        touchStartRef.current = null;
    };

    useEffect(() => {
        if (activeStory) {
            api.viewStory(activeStory.id);
        }
    }, [activeStory?.id]);

    useEffect(() => {
        if (!activeStory || !isImageLoaded || showStats) return;
        
        setProgress(0);
        const duration = 5000;
        const intervalTime = 50;
        const step = 100 / (duration / intervalTime);

        timerRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    handleNext();
                    return 100;
                }
                return prev + step;
            });
        }, intervalTime);

        return () => clearInterval(timerRef.current);
    }, [activeStory?.id, isImageLoaded, handleNext, showStats]);

    if (!activeStory) return null;

    const isMyStory = currentUser && activeStory.userId === currentUser.id;
    const storyTransform = activeStory.contentConfig?.transform || { x: 0, y: 0, scale: 1 };

    return (
        <div 
            className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {!showStats && (
                <>
                    <div className="absolute inset-y-0 left-0 w-1/3 z-40 cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePrev(); }}></div>
                    <div className="absolute inset-y-0 right-0 w-1/3 z-40 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleNext(); }}></div>
                </>
            )}

            <div className="relative w-full max-w-lg h-full bg-black flex flex-col overflow-hidden">
                <div className="absolute top-4 left-0 right-0 px-4 flex gap-1.5 z-50">
                    {currentAuthorStories.map((_, idx) => (
                        <div key={idx} className="h-1 bg-white/20 flex-1 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-white transition-all duration-75"
                                style={{ width: idx < currentStoryIndex ? '100%' : idx === currentStoryIndex ? `${progress}%` : '0%' }}
                            ></div>
                        </div>
                    ))}
                </div>

                <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-50 pointer-events-none">
                    <div className="flex items-center gap-3 pointer-events-auto cursor-pointer" onClick={() => { onClose(); navigate(`/user/${activeStory.userId}`); }}>
                        <img src={activeStory.authorAvatar} className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-lg" alt="" />
                        <div className="flex flex-col text-left">
                            <span className="text-white font-black text-sm drop-shadow-md">{activeStory.authorName}</span>
                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-tighter">Снежинск Онлайн</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white p-2 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-colors z-50 pointer-events-auto">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
                    {!isImageLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                            <Loader2 className="w-10 h-10 text-white/20 animate-spin" />
                        </div>
                    )}
                    <div 
                        className={`w-full h-full transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        style={{
                            backgroundImage: `url(${activeStory.media})`,
                            backgroundSize: 'contain', 
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            transform: `translate(${storyTransform.x}px, ${storyTransform.y}px) scale(${storyTransform.scale})`,
                            transformOrigin: 'center'
                        }}
                    >
                        <img 
                            src={activeStory.media} 
                            onLoad={() => setIsImageLoaded(true)}
                            className="hidden"
                            alt=""
                        />
                    </div>
                    
                    {activeStory.contentConfig?.elements?.map((el: any) => (
                        <div 
                            key={el.id} 
                            className="absolute p-3 rounded-xl text-sm font-black shadow-2xl z-30 select-none whitespace-nowrap" 
                            style={{ 
                                left: `${el.x}%`, 
                                top: `${el.y}%`, 
                                backgroundColor: el.bg, 
                                color: el.color, 
                                transform: 'translate(-50%, -50%)' 
                            }}
                        >
                            {el.content}
                        </div>
                    ))}
                </div>

                {activeStory.caption && (
                    <div className="absolute bottom-24 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent text-white text-center italic z-30 text-sm pointer-events-none">
                        {activeStory.caption}
                    </div>
                )}

                {isMyStory && (
                    <div className="absolute bottom-8 left-0 right-0 px-6 z-50 flex justify-center">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowStats(true); }}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-full transition-all text-white active:scale-95 shadow-xl"
                        >
                            <Eye className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-tighter">{activeStory.viewers?.length || 0} просмотров</span>
                        </button>
                    </div>
                )}

                {showStats && (
                    <div className="absolute inset-0 bg-white dark:bg-gray-900 z-[100] p-6 animate-in slide-in-from-bottom duration-300 flex flex-col rounded-t-[2.5rem] mt-16 sm:mt-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex flex-col">
                                <h3 className="text-gray-900 dark:text-white font-black text-xl flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-500" /> Жители
                                </h3>
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Просмотрели историю</span>
                            </div>
                            <button onClick={() => setShowStats(false)} className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                            {activeStory.viewers && activeStory.viewers.length > 0 ? (
                                activeStory.viewers.map((v: any, idx: number) => (
                                    <div 
                                        key={v.id || idx} 
                                        onClick={() => {
                                            onClose();
                                            navigate(`/user/${v.id}`);
                                        }}
                                        className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                                    >
                                        <img 
                                            src={v.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name)}&background=random`} 
                                            className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm" 
                                            alt="" 
                                        />
                                        <div className="flex-1">
                                            <span className="text-gray-900 dark:text-white font-bold text-base group-hover:text-blue-600 transition-colors">{v.name}</span>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Смотрел(а) историю</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                    <Eye className="w-16 h-16 opacity-10 mb-4" />
                                    <p className="italic text-sm font-bold uppercase tracking-widest opacity-50">Здесь пока пусто</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t dark:border-gray-800">
                             <Button variant="outline" className="w-full py-4 rounded-2xl border-gray-200 dark:border-gray-700 text-gray-500" onClick={() => setShowStats(false)}>
                                Закрыть список
                             </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const StoriesRail: React.FC = () => {
    const queryClient = useQueryClient();
    const { success, error: showError } = useToast();
    const [viewAuthorId, setViewAuthorId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedBusinessId, setSelectedBusinessId] = useState<string | undefined>(undefined);
    const [showAuthorPicker, setShowAuthorPicker] = useState(false);

    const { data: user } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });
    const { data: myBusinesses = [] } = useQuery({ 
        queryKey: ['myBusinesses'], 
        queryFn: api.getMyBusinesses, 
        enabled: !!user 
    });
    
    const { data: stories = [], isLoading } = useQuery({ 
        queryKey: ['stories'], 
        queryFn: api.getStories,
        refetchInterval: 30000 
    });

    const groupedStoriesByAuthor = useMemo(() => {
        const authors = new Map();
        if (!Array.isArray(stories)) return [];
        
        stories.forEach(s => {
            const authorData = authors.get(s.authorId) || { ...s, isAllViewed: true };
            
            // Если текущий пользователь НЕ смотрел хотя бы одну историю этого автора,
            // то помечаем автора как "есть непросмотренное"
            const hasViewedThis = user && s.viewers?.some(v => v.id === user.id);
            if (!hasViewedThis) {
                authorData.isAllViewed = false;
            }

            authors.set(s.authorId, authorData);
        });
        return Array.from(authors.values());
    }, [stories, user]);

    const handleCreateClick = () => {
        if (!user || user.role !== UserRole.ADMIN) return;
        if (myBusinesses.length > 0) {
            setShowAuthorPicker(true);
        } else {
            setIsCreating(true);
            setSelectedBusinessId(undefined);
        }
    };

    const startCreating = (bizId?: string) => {
        setSelectedBusinessId(bizId);
        setShowAuthorPicker(false);
        setIsCreating(true);
    };

    const onSaveStory = async (media: string, caption: string, config: any) => {
        try {
            await api.createStory(media, caption, selectedBusinessId, config);
            success("История отправлена!");
            setIsCreating(false);
            queryClient.invalidateQueries({ queryKey: ['stories'] });
        } catch (err: any) {
            console.error("Story Save Error:", err);
            showError(`Не удалось опубликовать: ${err.message}`);
        }
    };

    return (
        <div className="mb-2 relative">
            {viewAuthorId && stories.length > 0 && (
                <StoryViewer 
                    allStories={stories} 
                    initialAuthorId={viewAuthorId}
                    currentUser={user || null}
                    onClose={() => {
                        setViewAuthorId(null);
                        // Инвалидируем кэш, чтобы рамка истории обновилась сразу после просмотра
                        queryClient.invalidateQueries({ queryKey: ['stories'] });
                    }} 
                />
            )}

            {isCreating && (
                <div className="fixed inset-0 z-[10000] bg-black">
                    <StoryEditor 
                        onSave={onSaveStory} 
                        onClose={() => setIsCreating(false)} 
                    />
                </div>
            )}

            {showAuthorPicker && (
                <div className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setShowAuthorPicker(false)}>
                    <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b dark:border-gray-700">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">Автор истории</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">От чьего имени публикация?</p>
                        </div>
                        <div className="p-4 space-y-2">
                            <button 
                                onClick={() => startCreating(undefined)}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                            >
                                <img src={user?.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" alt="" />
                                <div className="text-left">
                                    <div className="font-bold text-gray-900 dark:text-white">{user?.name}</div>
                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Личный профиль</div>
                                </div>
                            </button>
                            {myBusinesses.map(biz => (
                                <button 
                                    key={biz.id}
                                    onClick={() => startCreating(biz.id)}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                                >
                                    <img src={biz.image} className="w-12 h-12 rounded-full object-cover border-2 border-blue-100" alt="" />
                                    <div className="text-left">
                                        <div className="font-bold text-gray-900 dark:text-white">{biz.name}</div>
                                        <div className="text-[10px] text-blue-500 font-black uppercase tracking-tighter">Бизнес-аккаунт</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30">
                            <Button variant="ghost" className="w-full text-gray-400 font-black uppercase text-xs tracking-widest" onClick={() => setShowAuthorPicker(false)}>
                                Отмена
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide px-1">
                {/* Кнопка создания видна только админам */}
                {user?.role === UserRole.ADMIN && (
                    <div className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group" onClick={handleCreateClick}>
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center group-hover:border-blue-500 transition-colors bg-white dark:bg-gray-800 shadow-sm">
                            <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-50" />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Создать</span>
                    </div>
                )}

                {isLoading && stories.length === 0 ? (
                    [1,2,3].map(i => (
                        <div key={i} className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0" />
                    ))
                ) : (
                    groupedStoriesByAuthor.map((authorStory) => (
                        <div key={authorStory.authorId} className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0" onClick={() => setViewAuthorId(authorStory.authorId)}>
                            <div className={`w-16 h-16 rounded-full p-[2.5px] shadow-md transform active:scale-90 transition-all duration-500 ${
                                (authorStory as any).isAllViewed 
                                ? 'bg-gray-200 dark:bg-gray-700' 
                                : 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600'
                            }`}>
                                <div className="w-full h-full rounded-full border-2 border-white dark:border-gray-900 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    <img src={authorStory.authorAvatar} className="w-full h-full object-cover" alt={authorStory.authorName} />
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold truncate w-16 text-center transition-colors ${
                                (authorStory as any).isAllViewed ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                                {authorStory.authorName}
                            </span>
                        </div>
                    ))
                )}
                
                {stories.length === 0 && !isLoading && !user && (
                    <div className="py-4 px-2 text-xs text-gray-400 font-medium italic">Историй пока нет</div>
                )}
            </div>
        </div>
    );
};
