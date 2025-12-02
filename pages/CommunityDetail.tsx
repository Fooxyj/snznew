
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Community, CommunityPost } from '../types';
import { Button } from '../components/ui/Common';
import { Loader2, Users, ChevronLeft, Image as ImageIcon, Send, LogOut } from 'lucide-react';

export const CommunityDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [community, setCommunity] = useState<Community | null>(null);
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Create Post
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [uploading, setUploading] = useState(false);

    const loadData = async () => {
        if (!id) return;
        try {
            // Need to fetch community details from list (mock/real mix)
            const allComms = await api.getCommunities();
            const comm = allComms.find(c => c.id === id);
            setCommunity(comm || null);
            
            if (comm) {
                const p = await api.getCommunityPosts(id);
                setPosts(p);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleLeave = async () => {
        if (!id || !confirm("Выйти из сообщества?")) return;
        await api.leaveCommunity(id);
        navigate('/communities');
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            setImage(url);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUploading(false);
        }
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !content.trim()) return;
        try {
            await api.createCommunityPost(id, content, image);
            setContent('');
            setImage('');
            loadData();
        } catch (e: any) {
            alert(e.message);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!community) return <div className="p-10 text-center">Сообщество не найдено</div>;

    return (
        <div className="max-w-4xl mx-auto p-0 lg:p-8">
            {/* Header */}
            <div className="relative h-48 lg:h-64 lg:rounded-2xl overflow-hidden mb-6">
                <img src={community.image} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-6 text-white">
                    <button onClick={() => navigate('/communities')} className="absolute top-4 left-4 text-white/80 hover:text-white flex items-center gap-1 text-sm bg-black/20 px-3 py-1 rounded-full backdrop-blur">
                        <ChevronLeft className="w-4 h-4" /> Все сообщества
                    </button>
                    <h1 className="text-3xl font-bold mb-1">{community.name}</h1>
                    <div className="flex items-center justify-between">
                        <span className="text-sm opacity-90">{community.membersCount} участников</span>
                        {community.isMember && (
                            <button onClick={handleLeave} className="text-xs text-white/70 hover:text-red-300 flex items-center gap-1">
                                <LogOut className="w-3 h-3" /> Покинуть
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 lg:px-0">
                {/* Feed */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Create Post Box */}
                    {community.isMember ? (
                        <div className="bg-white rounded-xl border p-4 shadow-sm">
                            <form onSubmit={handlePost}>
                                <textarea 
                                    className="w-full border-none resize-none focus:ring-0 text-gray-800 placeholder-gray-400 mb-2" 
                                    placeholder="Напишите что-нибудь..."
                                    rows={3}
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                />
                                {image && (
                                    <div className="relative mb-3 inline-block">
                                        <img src={image} className="h-20 rounded-lg border" alt="" />
                                        <button type="button" onClick={() => setImage('')} className="absolute -top-1 -right-1 bg-gray-200 rounded-full p-0.5"><Users className="w-3 h-3" /></button>
                                    </div>
                                )}
                                <div className="flex justify-between items-center border-t pt-3">
                                    <div className="relative cursor-pointer text-gray-400 hover:text-blue-600 transition-colors">
                                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
                                    </div>
                                    <Button size="sm" disabled={!content.trim() || uploading}>
                                        <Send className="w-3 h-3 mr-2" /> Опубликовать
                                    </Button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-blue-50 p-4 rounded-xl text-center text-blue-800 text-sm">
                            Вступите в сообщество, чтобы писать посты и комментировать.
                        </div>
                    )}

                    {/* Posts List */}
                    {posts.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">На стене пока пусто</div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="p-4 flex items-center gap-3">
                                    <img src={post.authorAvatar || 'https://ui-avatars.com/api/?name=User'} className="w-10 h-10 rounded-full bg-gray-100" alt="" />
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm">{post.authorName}</div>
                                        <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="px-4 pb-2 text-gray-800 whitespace-pre-wrap">
                                    {post.content}
                                </div>
                                {post.image && (
                                    <img src={post.image} className="w-full max-h-96 object-cover bg-gray-100 mt-2" alt="" />
                                )}
                                <div className="p-3 border-t flex items-center gap-4 text-gray-500 text-sm">
                                    {/* Likes placeholder */}
                                    <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                                        ❤️ {post.likes}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border p-5 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">О сообществе</h3>
                        <p className="text-sm text-gray-600">{community.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
