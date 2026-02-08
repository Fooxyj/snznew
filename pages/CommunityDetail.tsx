
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Button } from '../components/ui/Common';
import { Loader2, Users, ChevronLeft, Image as ImageIcon, Send, LogOut, MessageSquare, Layout, Trash2, Heart, Shield, MoreVertical, Crown, X, User as UserIcon, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import { ImageViewer } from '../components/ImageViewer';

// Отдельный компонент для комментариев под постом
const PostComments: React.FC<{ postId: string; isMember: boolean }> = ({ postId, isMember }) => {
    const queryClient = useQueryClient();
    const [isExpanded, setIsExpanded] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['postComments', postId],
        queryFn: () => api.getCommunityPostComments(postId)
    });

    const visibleComments = isExpanded ? comments : comments.slice(0, 3);
    const hasMore = comments.length > 3;

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await api.addCommunityPostComment(postId, newComment);
            setNewComment('');
            // Мгновенно обновляем список комментов
            await queryClient.invalidateQueries({ queryKey: ['postComments', postId] });
        } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
    };

    if (isLoading) return <div className="p-4 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-gray-300" /></div>;

    return (
        <div className="px-8 pb-8 space-y-4 border-t dark:border-gray-700 pt-6 bg-gray-50/30 dark:bg-gray-900/10">
            <div className="space-y-5">
                {visibleComments.map((c: any) => (
                    <div key={c.id} className="flex gap-4 items-start animate-in fade-in slide-in-from-left-2">
                        <Link to={`/user/${c.userId}`}>
                            <img src={c.userAvatar || 'https://ui-avatars.com/api/?name=U'} className="w-10 h-10 rounded-xl object-cover bg-white shadow-sm border dark:border-gray-700 hover:ring-2 hover:ring-blue-500 transition-all" />
                        </Link>
                        <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-1.5">
                                <Link to={`/user/${c.userId}`} className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 hover:underline">{c.userName}</Link>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-medium">{c.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && !isExpanded && (
                <button 
                    onClick={() => setIsExpanded(true)}
                    className="text-xs font-black uppercase text-blue-600 hover:text-blue-700 transition-colors pl-14 mt-2"
                >
                    Смотреть еще {comments.length - 3} коммент.
                </button>
            )}

            {isMember && (
                <form onSubmit={handleAddComment} className="flex gap-3 items-center mt-6 pl-14">
                    <input 
                        className="flex-1 bg-white dark:bg-gray-900 px-5 py-3 rounded-2xl text-sm border dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all shadow-inner"
                        placeholder="Написать ответ..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <button 
                        disabled={isSubmitting || !newComment.trim()} 
                        className="p-3.5 bg-blue-600 text-white rounded-2xl disabled:opacity-30 active:scale-90 transition-all shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            )}
        </div>
    );
};

export const CommunityDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { success, error: showError } = useToast();
    
    const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'members' | 'moderation'>('feed');
    const [postContent, setPostContent] = useState('');
    const [postImage, setPostImage] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [viewerImage, setViewerImage] = useState<string | null>(null);
    
    const chatEndRef = useRef<HTMLDivElement>(null);

    const { data: user } = useQuery({ queryKey: ['user'], queryFn: api.getCurrentUser });
    const { data: community, isLoading: commLoading } = useQuery({
        queryKey: ['community', id],
        queryFn: () => api.getCommunityById(id!),
        enabled: !!id
    });

    const { data: posts = [], isLoading: postsLoading } = useQuery({
        queryKey: ['communityPosts', id],
        queryFn: () => api.getCommunityPosts(id!, false),
        enabled: !!id && activeTab === 'feed',
        refetchInterval: 5000 
    });

    const { data: pendingPosts = [], isLoading: pendingLoading } = useQuery({
        queryKey: ['pendingCommunityPosts', id],
        queryFn: () => api.getCommunityPosts(id!, true).then(res => res.filter(p => p.status === 'pending')),
        enabled: !!id && (activeTab === 'moderation' || activeTab === 'feed'),
        refetchInterval: 10000
    });

    const { data: members = [], isLoading: membersLoading } = useQuery({
        queryKey: ['communityMembers', id],
        queryFn: () => api.getCommunityMembers(id!),
        enabled: !!id && activeTab === 'members'
    });

    const { data: chatMessages = [], isLoading: chatLoading } = useQuery({
        queryKey: ['communityChat', id],
        queryFn: () => api.getCommunityChatMessages(id!),
        enabled: !!id && activeTab === 'chat',
        refetchInterval: 3000
    });

    const isLeader = user && community && community.authorId === user.id;

    useEffect(() => {
        if (activeTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, activeTab]);

    const joinMutation = useMutation({
        mutationFn: () => api.joinCommunity(id!),
        onSuccess: () => {
            success("Вы вступили в клуб!");
            queryClient.invalidateQueries({ queryKey: ['community', id] });
            queryClient.invalidateQueries({ queryKey: ['communityMembers', id] });
        }
    });

    const leaveMutation = useMutation({
        mutationFn: () => api.leaveCommunity(id!),
        onSuccess: () => {
            success("Вы вышли из клуба");
            queryClient.invalidateQueries({ queryKey: ['community', id] });
            queryClient.invalidateQueries({ queryKey: ['communityMembers', id] });
        }
    });

    const handleLike = async (postId: string) => {
        if (!user) return navigate('/auth');
        try {
            await api.likeCommunityPost(postId);
            await queryClient.invalidateQueries({ queryKey: ['communityPosts', id] });
        } catch (e) { console.error(e); }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setPostImage(url);
        } catch (e: any) { showError(e.message); } finally { setUploading(false); }
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !postContent.trim()) return;
        try {
            await api.createCommunityPost(id, postContent, postImage);
            setPostContent('');
            setPostImage('');
            if (isLeader) {
                await queryClient.invalidateQueries({ queryKey: ['communityPosts', id] });
                success("Пост опубликован");
            } else {
                success("Ваш пост отправлен на модерацию лидеру клуба");
            }
        } catch (e: any) { showError(e.message); }
    };

    const handleApprovePost = async (pid: string) => {
        try {
            await api.approveCommunityPost(pid);
            success("Пост одобрен");
            queryClient.invalidateQueries({ queryKey: ['communityPosts', id] });
            queryClient.invalidateQueries({ queryKey: ['pendingCommunityPosts', id] });
        } catch (e: any) { showError(e.message); }
    };

    const handleDeletePost = async (pid: string) => {
        if (confirm("Удалить этот пост?")) {
            await api.deleteCommunityPost(pid);
            queryClient.invalidateQueries({ queryKey: ['communityPosts', id] });
            queryClient.invalidateQueries({ queryKey: ['pendingCommunityPosts', id] });
        }
    };

    const handleSendChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !chatInput.trim()) return;
        const msg = chatInput;
        setChatInput('');
        try {
            await api.sendCommunityChatMessage(id, msg);
            await queryClient.invalidateQueries({ queryKey: ['communityChat', id] });
        } catch (e: any) { showError(e.message); }
    };

    if (commLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-12 h-12" /></div>;
    if (!community) return <div className="p-20 text-center font-black uppercase text-gray-400">Клуб не найден</div>;

    return (
        <div className="max-w-4xl mx-auto pb-32">
            <ImageViewer isOpen={!!viewerImage} onClose={() => setViewerImage(null)} src={viewerImage || ''} />

            {/* Header */}
            <div className="px-4 lg:px-0">
                <div className="mb-6 flex items-center justify-between">
                    <button onClick={() => navigate('/communities')} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">
                        <ChevronLeft className="w-5 h-5" /> Все клубы
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-sm overflow-hidden mb-8">
                    <div className="aspect-[3/1] w-full bg-gray-100 dark:bg-gray-900 relative">
                        <img src={community.image} className="w-full h-full object-cover" alt="" />
                    </div>

                    <div className="p-8 md:p-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                                        {community.category || 'Клуб'}
                                    </span>
                                    {isLeader && (
                                        <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                            <Crown className="w-3.5 h-3.5" /> Лидер
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-3">{community.name}</h1>
                                <p className="text-gray-500 dark:text-gray-400 font-medium text-base italic leading-relaxed">"{community.description}"</p>
                                
                                <div className="mt-4 flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-400">
                                    <button onClick={() => setActiveTab('members')} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"><Users className="w-4 h-4 text-blue-500" /> {community.membersCount || 0} участников</button>
                                </div>
                            </div>
                            
                            <div className="shrink-0">
                                {!community.isMember ? (
                                    <Button 
                                        className="rounded-2xl py-4 px-12 font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all" 
                                        onClick={() => joinMutation.mutate()}
                                        disabled={joinMutation.isPending}
                                    >
                                        {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Вступить'}
                                    </Button>
                                ) : (
                                    <button 
                                        onClick={() => leaveMutation.mutate()} 
                                        disabled={leaveMutation.isPending}
                                        className="bg-red-50 text-red-500 hover:bg-red-100 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-100"
                                    >
                                        {leaveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Выйти из клуба'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-[2rem] mb-10 shadow-inner overflow-x-auto scrollbar-hide">
                    <button onClick={() => setActiveTab('feed')} className={`flex-1 min-w-[100px] flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'feed' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-xl' : 'text-gray-400'}`}><Layout className="w-4 h-4" /> Стена</button>
                    <button onClick={() => setActiveTab('chat')} className={`flex-1 min-w-[100px] flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-xl' : 'text-gray-400'}`}><MessageSquare className="w-4 h-4" /> Чат</button>
                    <button onClick={() => setActiveTab('members')} className={`flex-1 min-w-[100px] flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'members' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-xl' : 'text-gray-400'}`}><Users className="w-4 h-4" /> Люди</button>
                    {isLeader && (
                        <button onClick={() => setActiveTab('moderation')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'moderation' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-xl' : 'text-gray-400'}`}>
                            <Shield className="w-4 h-4" /> Заявки
                            {pendingPosts.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]"></span>}
                        </button>
                    )}
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'feed' && (
                        <div className="space-y-8">
                            {community.isMember && (
                                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 p-8 shadow-sm">
                                    <form onSubmit={handlePost}>
                                        <div className="flex gap-4">
                                            <img src={user?.avatar || 'https://ui-avatars.com/api/?name=U'} className="w-12 h-12 rounded-2xl object-cover shrink-0" />
                                            <textarea 
                                                className="flex-1 bg-transparent border-none text-xl font-medium outline-none resize-none placeholder-gray-300 dark:text-white"
                                                placeholder="Напишите что-нибудь..."
                                                rows={2}
                                                value={postContent}
                                                onChange={e => setPostContent(e.target.value)}
                                            />
                                        </div>
                                        {postImage && (
                                            <div className="relative mt-4 inline-block">
                                                <img src={postImage} className="max-h-64 rounded-3xl border-4 border-gray-50 shadow-xl" />
                                                <button type="button" onClick={() => setPostImage('')} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg"><X className="w-4 h-4"/></button>
                                            </div>
                                        )}
                                        <div className="mt-6 pt-6 border-t dark:border-gray-700 flex justify-between items-center">
                                            <div className="relative flex items-center gap-2 cursor-pointer text-gray-400 hover:text-blue-600 transition-colors px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900">
                                                <ImageIcon className="w-5 h-5" />
                                                <span className="text-[10px] font-black uppercase">Фото</span>
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
                                            </div>
                                            <Button disabled={!postContent.trim() || uploading} className="rounded-2xl px-10 py-3 font-black">Опубликовать</Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {postsLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div> : (
                                posts.length === 0 ? (
                                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border-2 border-dashed dark:border-gray-800">
                                        <p className="font-black text-gray-400 uppercase text-xs tracking-widest">На стене пока пусто</p>
                                    </div>
                                ) : (
                                    posts.map(post => (
                                        <div key={post.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 shadow-sm overflow-hidden group">
                                            <div className="p-8 flex items-start justify-between">
                                                <Link to={`/user/${post.authorId}`} className="flex items-center gap-4 group/author">
                                                    <img src={post.authorAvatar || 'https://ui-avatars.com/api/?name=U'} className="w-12 h-12 rounded-2xl object-cover bg-gray-100 shadow-sm group/author:ring-2 ring-blue-500 transition-all" />
                                                    <div>
                                                        <h4 className="font-black text-sm uppercase dark:text-white group/author:text-blue-600 transition-colors">{post.authorName}</h4>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(post.createdAt).toLocaleString('ru-RU', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                                                    </div>
                                                </Link>
                                                {(isLeader || post.authorId === user?.id) && (
                                                    <button onClick={() => handleDeletePost(post.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="px-8 pb-4 text-lg text-gray-700 dark:text-gray-200 leading-relaxed font-medium whitespace-pre-wrap italic">
                                                "{post.content}"
                                            </div>
                                            {post.image && (
                                                <div className="p-4 pt-0">
                                                    <img 
                                                        src={post.image} 
                                                        className="w-full max-h-[600px] object-cover rounded-[2rem] shadow-sm cursor-zoom-in hover:opacity-95 transition-opacity" 
                                                        alt="" 
                                                        onClick={() => setViewerImage(post.image || null)}
                                                    />
                                                </div>
                                            )}
                                            
                                            <div className="px-8 py-6 flex gap-6 border-t dark:border-gray-700 mt-4">
                                                <button 
                                                    onClick={() => handleLike(post.id)}
                                                    className={`flex items-center gap-2 transition-all active:scale-90 group/btn ${post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                                >
                                                    <div className={`p-3 rounded-2xl transition-colors ${post.isLiked ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-900 group-hover/btn:bg-red-50'}`}>
                                                        <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                                                    </div>
                                                    <span className="font-black text-sm">{post.likes}</span>
                                                </button>
                                                
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                                                        <MessageCircle className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-black text-sm uppercase tracking-widest text-[10px]">Комменты</span>
                                                </div>
                                            </div>

                                            {/* Секция комментариев */}
                                            <PostComments postId={post.id} isMember={!!community.isMember} />
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    )}

                    {activeTab === 'moderation' && isLeader && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-black uppercase dark:text-white px-2">Предложенные записи ({pendingPosts.length})</h2>
                            {pendingLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div> : (
                                pendingPosts.length === 0 ? (
                                    <div className="text-center py-32 bg-gray-50 dark:bg-gray-900/50 rounded-[3rem] border-2 border-dashed dark:border-gray-800">
                                        <Shield className="w-16 h-16 mx-auto mb-4 opacity-10 text-indigo-500" />
                                        <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Нет записей на модерацию</p>
                                    </div>
                                ) : (
                                    pendingPosts.map(post => (
                                        <div key={post.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-900 shadow-xl overflow-hidden animate-in zoom-in-95">
                                            <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/20 border-b dark:border-indigo-900/50 flex justify-between items-center">
                                                <Link to={`/user/${post.authorId}`} className="flex items-center gap-3">
                                                    <img src={post.authorAvatar} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" />
                                                    <div>
                                                        <div className="font-black text-xs uppercase dark:text-white">{post.authorName}</div>
                                                        <div className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest">Предложил запись</div>
                                                    </div>
                                                </Link>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApprovePost(post.id)} className="p-3 bg-green-500 text-white rounded-xl shadow-lg hover:bg-green-600 active:scale-90 transition-all">
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDeletePost(post.id)} className="p-3 bg-red-500 text-white rounded-xl shadow-lg hover:bg-green-600 active:scale-90 transition-all">
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-8">
                                                <p className="text-lg font-medium text-gray-700 dark:text-gray-200 italic mb-6">"{post.content}"</p>
                                                {post.image && (
                                                    <img 
                                                        src={post.image} 
                                                        className="w-full h-48 object-cover rounded-2xl shadow-sm cursor-zoom-in" 
                                                        onClick={() => setViewerImage(post.image || null)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div className="bg-white dark:bg-gray-800 rounded-[3rem] border dark:border-gray-700 shadow-xl overflow-hidden h-[600px] flex flex-col relative">
                            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                <button onClick={() => setActiveTab('feed')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                                </button>
                                <div className="flex flex-col items-center">
                                    <div className="text-[10px] font-black uppercase text-indigo-600 tracking-widest leading-none mb-1">Чат Клуба</div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                        <span className="text-[8px] font-black uppercase text-gray-400 tracking-tighter">Онлайн</span>
                                    </div>
                                </div>
                                <div className="w-9"></div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#F8FAFC] dark:bg-gray-950">
                                {chatMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-300 italic opacity-50">
                                        <MessageSquare className="w-12 h-12 mb-4" />
                                        <p className="text-sm font-black uppercase">История сообщений пуста</p>
                                    </div>
                                ) : (
                                    chatMessages.map(m => (
                                        <div key={m.id} className={`flex gap-4 ${m.senderId === user?.id ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
                                            <Link to={`/user/${m.senderId}`}>
                                                <img src={m.senderAvatar || 'https://ui-avatars.com/api/?name=U'} className="w-10 h-10 rounded-xl object-cover shrink-0 mt-1 shadow-md hover:ring-2 ring-indigo-500 transition-all" />
                                            </Link>
                                            <div className={`max-w-[75%] ${m.senderId === user?.id ? 'text-right' : ''}`}>
                                                <Link to={`/user/${m.senderId}`} className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 hover:text-indigo-500 transition-colors block">{m.senderName} • {new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Link>
                                                <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium ${m.senderId === user?.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 dark:text-white rounded-tl-none'}`}>
                                                    {m.text}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {community.isMember ? (
                                <form onSubmit={handleSendChat} className="p-5 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex gap-4">
                                    <input 
                                        className="flex-1 bg-gray-50 dark:bg-gray-800 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white font-medium"
                                        placeholder="Напишите сообщение..."
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                    />
                                    <button className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-90 transition-all">
                                        <Send className="w-6 h-6" />
                                    </button>
                                </form>
                            ) : (
                                <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800">
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Нужно вступить в клуб, чтобы писать в чат</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 p-8 shadow-sm">
                            <h3 className="text-xl font-black uppercase tracking-tight dark:text-white mb-8">Участники клуба</h3>
                            {membersLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div> : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                    {members.map(member => (
                                        <Link key={member.id} to={`/user/${member.id}`} className="flex flex-col items-center gap-3 group text-center">
                                            <div className="relative">
                                                <img src={member.avatar || 'https://ui-avatars.com/api/?name=U'} className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 dark:border-gray-900 group-hover/border-blue-100 transition-all shadow-md" />
                                                {member.id === community.authorId && (
                                                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800" title="Лидер">
                                                        <Crown className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-sm truncate dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{member.name}</div>
                                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{member.xp} XP</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
