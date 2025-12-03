
import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Story, User } from '../types';
import { Plus, X, Upload, Loader2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const ViewersList: React.FC<{ viewers: {name: string, avatar: string}[]; onClose: () => void }> = ({ viewers, onClose }) => {
    return (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl p-4 max-h-[60vh] overflow-y-auto pointer-events-auto animate-in slide-in-from-bottom-10">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2 border-b dark:border-gray-700">
                    <h3 className="font-bold text-lg dark:text-white">Просмотры ({viewers.length})</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="space-y-3">
                    {viewers.map((v, i) => (
                        <Link to="/profile" key={i} className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                            <img src={v.avatar} className="w-10 h-10 rounded-full object-cover bg-gray-200" alt="" />
                            <span className="font-medium text-gray-900 dark:text-white">{v.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StoryViewer: React.FC<{ 
    stories: Story[]; 
    initialIndex: number; 
    currentUser: User | null;
    onClose: () => void 
}> = ({ stories, initialIndex, currentUser, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const [showViewers, setShowViewers] = useState(false);
    const timerRef = useRef<any>(null);

    // Swipe handlers
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const activeStory = stories[currentIndex];
    const isOwner = currentUser && activeStory.authorId === currentUser.id;

    // Auto-advance
    useEffect(() => {
        if (!activeStory || showViewers) return; // Pause if viewing list
        setProgress(0);
        const duration = 5000; // 5 seconds per story
        const interval = 50;
        const step = 100 / (duration / interval);

        timerRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timerRef.current);
    }, [currentIndex, showViewers]);

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    // Swipe Logic
    const onTouchStartHandler = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientY);
    const onTouchMoveHandler = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientY);
    const onTouchEndHandler = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchEnd - touchStart;
        if (distance > 100) onClose(); // Swipe down to close
        setTouchStart(null); setTouchEnd(null);
    };

    // Mouse drag for desktop swipe simulation
    const onMouseDownHandler = (e: React.MouseEvent) => setTouchStart(e.clientY);
    const onMouseUpHandler = (e: React.MouseEvent) => {
        if (!touchStart) return;
        const distance = e.clientY - touchStart;
        if (distance > 100) onClose();
        setTouchStart(null);
    };

    if (!activeStory) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
            onTouchStart={onTouchStartHandler}
            onTouchMove={onTouchMoveHandler}
            onTouchEnd={onTouchEndHandler}
            onMouseDown={onMouseDownHandler}
            onMouseUp={onMouseUpHandler}
        >
            {/* Navigation Zones */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePrev(); }}></div>
            <div className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleNext(); }}></div>

            <div className="relative w-full max-w-md h-full md:h-[90vh] bg-gray-900 md:rounded-xl overflow-hidden shadow-2xl transition-transform" onClick={e => e.stopPropagation()}>
                {/* Progress Bar */}
                <div className="absolute top-4 left-0 right-0 px-2 flex gap-1 z-30">
                    {stories.map((s, idx) => (
                        <div key={s.id} className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-white transition-all duration-[50ms] ease-linear"
                                style={{ 
                                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                                }}
                            ></div>
                        </div>
                    ))}
                </div>

                {/* Header - Removed Time */}
                <div className="absolute top-8 left-4 flex items-center gap-3 z-30 pointer-events-none">
                    <img src={activeStory.authorAvatar} className="w-8 h-8 rounded-full border border-white/50 bg-gray-600" alt="" />
                    <span className="text-white font-bold text-sm shadow-black drop-shadow-md">{activeStory.authorName}</span>
                </div>
                
                <button onClick={onClose} className="absolute top-8 right-4 z-40 text-white hover:opacity-70 p-2">
                    <X className="w-6 h-6" />
                </button>

                {/* Content */}
                <img src={activeStory.media} className="w-full h-full object-cover" alt="" />
                
                {activeStory.caption && (
                    <div className="absolute bottom-20 left-0 right-0 p-4 text-center z-30 pointer-events-none">
                        <div className="inline-block bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm">
                            {activeStory.caption}
                        </div>
                    </div>
                )}

                {/* Viewers Eye (Only for Owner) */}
                {isOwner && (
                    <div className="absolute bottom-6 left-4 z-50">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowViewers(true); }}
                            className="flex items-center gap-2 text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full hover:bg-black/60 transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            <span className="text-xs font-bold">{activeStory.viewers?.length || 0}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Viewers Modal Overlay */}
            {showViewers && activeStory.viewers && (
                <ViewersList 
                    viewers={activeStory.viewers} 
                    onClose={() => setShowViewers(false)} 
                />
            )}
        </div>
    );
};

export const StoriesRail: React.FC = () => {
    const [groupedStories, setGroupedStories] = useState<Record<string, Story[]>>({});
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Viewing State
    const [activeAuthorId, setActiveAuthorId] = useState<string | null>(null);
    
    // Creating State
    const [isCreating, setIsCreating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newMedia, setNewMedia] = useState('');
    const [caption, setCaption] = useState('');

    const loadData = async () => {
        try {
            const [s, u] = await Promise.all([api.getStories(), api.getCurrentUser()]);
            setCurrentUser(u);
            
            // Group stories by author
            const grouped = s.reduce((acc, story) => {
                if (!acc[story.authorId]) {
                    acc[story.authorId] = [];
                }
                acc[story.authorId].push(story);
                return acc;
            }, {} as Record<string, Story[]>);
            setGroupedStories(grouped);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setNewMedia(url);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUploading(false);
        }
    };

    const submitStory = async () => {
        if (!newMedia) return;
        try {
            await api.createStory(newMedia, caption);
            setNewMedia('');
            setCaption('');
            setIsCreating(false);
            loadData();
        } catch (e: any) {
            alert(e.message);
        }
    };

    if (loading) return null;

    const authorIds = Object.keys(groupedStories);

    return (
        <div className="mb-6">
            {/* Viewer Modal */}
            {activeAuthorId && groupedStories[activeAuthorId] && (
                <StoryViewer 
                    stories={groupedStories[activeAuthorId]} 
                    initialIndex={0} 
                    currentUser={currentUser}
                    onClose={() => setActiveAuthorId(null)} 
                />
            )}

            {/* Creation Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-sm p-4 shadow-2xl relative">
                        <button onClick={() => setIsCreating(false)} className="absolute top-2 right-2 p-2"><X className="w-5 h-5" /></button>
                        <h3 className="font-bold text-lg mb-4 text-center">Создать историю</h3>
                        
                        <div className="aspect-[9/16] bg-gray-100 rounded-lg mb-4 relative overflow-hidden flex items-center justify-center">
                            {newMedia ? (
                                <img src={newMedia} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="text-center">
                                    <div className="relative cursor-pointer bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                                        {uploading ? <Loader2 className="animate-spin text-blue-500" /> : <Upload className="text-blue-500" />}
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleUpload} />
                                    </div>
                                    <p className="text-xs text-gray-500">Загрузить фото</p>
                                </div>
                            )}
                        </div>
                        
                        <input 
                            className="w-full border-b p-2 mb-4 text-sm outline-none" 
                            placeholder="Добавьте подпись..." 
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                        />
                        
                        <button 
                            onClick={submitStory}
                            disabled={!newMedia}
                            className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${!newMedia ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            Опубликовать
                        </button>
                    </div>
                </div>
            )}

            {/* Rail */}
            <div className="flex gap-4 overflow-x-auto pb-4 items-center">
                {/* Create Button */}
                {currentUser && (
                    <div className="flex flex-col items-center gap-1 cursor-pointer shrink-0" onClick={() => setIsCreating(true)}>
                        <div className="w-16 h-16 rounded-full border-2 border-gray-200 p-0.5 relative">
                            <img src={currentUser.avatar} className="w-full h-full rounded-full object-cover opacity-50" alt="" />
                            <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 border-2 border-white">
                                <Plus className="w-3 h-3 text-white" />
                            </div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">Вы</span>
                    </div>
                )}

                {/* Stories Grouped by Author */}
                {authorIds.map((aid) => {
                    const stories = groupedStories[aid];
                    const firstStory = stories[0];
                    return (
                        <div key={aid} className="flex flex-col items-center gap-1 cursor-pointer shrink-0" onClick={() => setActiveAuthorId(aid)}>
                            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600">
                                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-200">
                                    <img src={firstStory.authorAvatar} className="w-full h-full object-cover" alt="" />
                                </div>
                            </div>
                            <span className="text-xs font-medium text-gray-800 w-16 truncate text-center">{firstStory.authorName}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
