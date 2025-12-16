import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Ad, NewsItem, BusinessApplication } from '../types';
import { supabase } from '../services/supabaseClient';
import { api } from '../services/api';

interface AdminPanelProps {
    isOpen: boolean;
    onClose: () => void;
    ads: Ad[];
    onUpdateAdStatus: (adId: string, status: 'approved' | 'rejected') => void;
    onUpdateAdContent: (adId: string, updatedFields: Partial<Ad>) => void;
    onAddNews: (newsItem: NewsItem) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, ads, onUpdateAdStatus, onUpdateAdContent, onAddNews }) => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'moderation' | 'active_ads' | 'news' | 'business_apps' | 'manage_businesses' | 'stories'>('moderation');
    const [editingAdId, setEditingAdId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Ad>>({});
    const [businessApplications, setBusinessApplications] = useState<BusinessApplication[]>([]);
    const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
    const [isLoadingApps, setIsLoadingApps] = useState(false);
    const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
    const [businessImages, setBusinessImages] = useState<{ avatar?: string, header?: string }>({});
    const [isUploadingBusinessImage, setIsUploadingBusinessImage] = useState(false);

    // Stories State
    const [stories, setStories] = useState<any[]>([]);
    const [isLoadingStories, setIsLoadingStories] = useState(false);
    const [editingStory, setEditingStory] = useState<any | null>(null);
    const [isCreatingStory, setIsCreatingStory] = useState(false);
    const [storyForm, setStoryForm] = useState({
        shop_id: '',
        shop_name: '',
        avatar: '',
        image: '',
        text: '',
        expires_at: '',
        display_order: 0
    });
    const [isUploadingStoryImage, setIsUploadingStoryImage] = useState(false);

    // Business Editing State
    const [editingBusiness, setEditingBusiness] = useState<any>(null);
    const [businessEditForm, setBusinessEditForm] = useState({
        business_name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        hours: ''
    });

    // News Form State
    const [newsForm, setNewsForm] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        image: ''
    });
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isSubmittingNews, setIsSubmittingNews] = useState(false);


    // Fetch business applications when tab is opened
    useEffect(() => {
        if (activeTab === 'business_apps' && isOpen) {
            fetchBusinessApplications();
        }
        if (activeTab === 'manage_businesses' && isOpen) {
            fetchAllBusinesses();
        }
        if (activeTab === 'stories' && isOpen) {
            fetchStories();
        }
    }, [activeTab, isOpen]);

    const fetchBusinessApplications = async () => {
        setIsLoadingApps(true);
        try {
            const { data, error } = await supabase
                .from('business_applications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBusinessApplications(data || []);
        } catch (err) {
            console.error('Error fetching applications:', err);
        } finally {
            setIsLoadingApps(false);
        }
    };

    const fetchAllBusinesses = async () => {
        setIsLoadingBusinesses(true);
        try {
            const { data, error } = await supabase
                .from('managed_businesses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAllBusinesses(data || []);
        } catch (err) {
            console.error('Error fetching businesses:', err);
        } finally {
            setIsLoadingBusinesses(false);
        }
    };

    const fetchStories = async () => {
        setIsLoadingStories(true);
        try {
            const { data, error } = await supabase
                .from('stories')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setStories(data || []);
        } catch (err) {
            console.error('Error fetching stories:', err);
        } finally {
            setIsLoadingStories(false);
        }
    };

    const handleStoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'image') => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploadingStoryImage(true);
            try {
                const url = await api.uploadFile(file, 'story-images');
                setStoryForm(prev => ({ ...prev, [field]: url }));
            } catch (err: any) {
                console.error(err);
                let msg = 'Ошибка загрузки изображения';
                if (err.message && err.message.includes('BLOCKED_BY_CLIENT')) {
                    msg = 'Загрузка заблокирована браузером. Отключите AdBlock.';
                }
                alert(msg);
            } finally {
                setIsUploadingStoryImage(false);
            }
        }
    };

    const handleSaveStory = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Пользователь не авторизован');
                return;
            }

            const payload = {
                ...storyForm,
                created_by: user.id,
                expires_at: storyForm.expires_at || null
            };

            if (editingStory) {
                const { error } = await supabase
                    .from('stories')
                    .update(payload)
                    .eq('id', editingStory.id);

                if (error) throw error;
                alert('История обновлена!');
            } else {
                const { error } = await supabase
                    .from('stories')
                    .insert(payload);

                if (error) throw error;
                alert('История создана!');
            }

            setEditingStory(null);
            setIsCreatingStory(false);
            setStoryForm({
                shop_id: '',
                shop_name: '',
                avatar: '',
                image: '',
                text: '',
                expires_at: '',
                display_order: 0
            });
            fetchStories();
        } catch (err: any) {
            console.error('Error saving story:', err);
            alert('Ошибка сохранения: ' + err.message);
        }
    };

    const handleDeleteStory = async (storyId: string) => {
        if (!confirm('Удалить эту историю?')) return;

        try {
            const { error } = await supabase
                .from('stories')
                .delete()
                .eq('id', storyId);

            if (error) throw error;
            alert('История удалена!');
            fetchStories();
        } catch (err: any) {
            console.error('Error deleting story:', err);
            alert('Ошибка удаления: ' + err.message);
        }
    };

    const handleEditStory = (story: any) => {
        setEditingStory(story);
        setStoryForm({
            shop_id: story.shop_id || '',
            shop_name: story.shop_name,
            avatar: story.avatar,
            image: story.image,
            text: story.text || '',
            expires_at: story.expires_at || '',
            display_order: story.display_order
        });
    };



    const handleEditBusiness = (business: any) => {
        setEditingBusiness(business);
        setBusinessEditForm({
            business_name: business.business_name,
            description: business.business_data?.description || '',
            address: business.business_data?.address || '',
            phone: business.business_data?.phone || '',
            email: business.business_data?.email || '',
            hours: business.business_data?.hours || ''
        });
    };

    const handleSaveBusiness = async () => {
        if (!editingBusiness) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Пользователь не авторизован');
                return;
            }

            const { error } = await supabase
                .from('managed_businesses')
                .update({
                    business_name: businessEditForm.business_name,
                    business_data: {
                        ...editingBusiness.business_data,
                        description: businessEditForm.description,
                        address: businessEditForm.address,
                        phone: businessEditForm.phone,
                        email: businessEditForm.email,
                        hours: businessEditForm.hours
                    },
                    last_edited_by: user.id
                })
                .eq('id', editingBusiness.id);

            if (error) throw error;

            alert('Бизнес обновлён!');
            setEditingBusiness(null);
            fetchAllBusinesses();
        } catch (err: any) {
            console.error('Error updating business:', err);
            alert('Ошибка обновления: ' + err.message);
        }
    };

    const handleDeactivateBusiness = async (businessId: string) => {
        if (!confirm('Деактивировать этот бизнес? Он будет удалён из базы данных.')) return;

        try {
            const { error } = await supabase
                .from('managed_businesses')
                .delete()
                .eq('id', businessId);

            if (error) throw error;

            alert('Бизнес деактивирован!');
            fetchAllBusinesses();
        } catch (err: any) {
            console.error('Error deactivating business:', err);
            alert('Ошибка деактивации: ' + err.message);
        }
    };


    const handleApplicationAction = async (appId: string, newStatus: 'approved' | 'rejected', app: BusinessApplication) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Пользователь не авторизован');
                return;
            }

            if (newStatus === 'approved') {
                // Create managed business entry
                const { error: createError } = await supabase
                    .from('managed_businesses')
                    .insert({
                        user_id: app.user_id,
                        business_name: app.company_name,
                        business_type: app.business_type === 'Магазин / Ритейл' ? 'shop' :
                            app.business_type === 'Ресторан / Кафе' ? 'cafe' :
                                app.business_type === 'Услуги / Сервис' ? 'service' : 'other',
                        status: 'active',
                        business_data: {
                            description: app.comment || '',
                            phone: app.phone,
                            email: app.email,
                            contact_person: app.contact_person,
                            avatar: businessImages.avatar || '',
                            header: businessImages.header || '',
                            address: 'г. Снежинск' // Default
                        },
                        last_edited_by: user?.id
                    });

                if (createError) throw createError;
            }

            // Update application status
            const { error } = await supabase
                .from('business_applications')
                .update({
                    status: newStatus,
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: user?.id
                })
                .eq('id', appId);

            if (error) throw error;

            // Refresh list
            // fetchBusinessApplications(); // Can be slow, update local state instead
            setBusinessApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));

            // Invalidate managed businesses query to update the main app UI immediately
            queryClient.invalidateQueries({ queryKey: ['managed_businesses'] });

            // Clear images
            setBusinessImages({});

            if (newStatus === 'approved') {
                alert(`Заявка одобрена! Пользователь получил доступ к бизнес-кабинету.`);
            } else {
                alert('Заявка отклонена.');
            }
        } catch (err: any) {
            console.error('Error updating application:', err);
            alert('Ошибка: ' + err.message);
        }
    };

    if (!isOpen) return null;

    const pendingAds = ads.filter(ad => ad.status === 'pending');
    const approvedAds = ads.filter(ad => ad.status === 'approved');
    const pendingBusinessApps = businessApplications.filter(app => app.status === 'pending');

    const handleEditClick = (ad: Ad) => {
        setEditingAdId(ad.id);
        setEditForm({
            title: ad.title,
            description: ad.description,
            price: ad.price
        });
    };

    const handleSaveEdit = (adId: string) => {
        onUpdateAdContent(adId, editForm);
        setEditingAdId(null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploadingImage(true);
            try {
                const publicUrl = await api.uploadFile(file, 'images');
                setNewsForm({ ...newsForm, image: publicUrl });
            } catch (err: any) {
                console.error(err);
                let msg = 'Ошибка загрузки изображения';
                if (err.message && err.message.includes('BLOCKED_BY_CLIENT')) {
                    msg = 'Загрузка заблокирована браузером. Отключите AdBlock.';
                }
                alert(msg);
            } finally {
                setIsUploadingImage(false);
            }
        }
    };

    const handleNewsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingNews(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Пользователь не авторизован');
                return;
            }

            const { data, error } = await supabase
                .from('news')
                .insert({
                    title: newsForm.title,
                    excerpt: newsForm.excerpt,
                    content: newsForm.content,
                    category: newsForm.category,
                    image: newsForm.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
                    author_id: user?.id,
                    status: 'published'
                })
                .select()
                .single();

            if (error) throw error;

            // Also update local state for immediate UI update
            const newItem: NewsItem = {
                id: data.id,
                title: data.title,
                excerpt: data.excerpt,
                content: data.content,
                category: data.category,
                image: data.image,
                date: (() => {
                    const date = new Date(data.created_at);
                    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
                })()
            };
            onAddNews(newItem);

            setNewsForm({ title: '', excerpt: '', content: '', category: '', image: '' });
            alert('Новость успешно опубликована!');
        } catch (err: any) {
            console.error('Error creating news:', err);
            alert('Ошибка при публикации новости: ' + err.message);
        } finally {
            setIsSubmittingNews(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div
                className="bg-background w-full max-w-5xl rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up flex flex-col h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-5 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-red-600/20">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-dark">Админ-панель</h2>
                            <p className="text-xs text-secondary">Модерация и управление контентом</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('moderation')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                    ${activeTab === 'moderation' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                            Модерация
                            {pendingAds.length > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingAds.length}</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('active_ads')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                    ${activeTab === 'active_ads' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            Все объявления
                        </button>
                        <button
                            onClick={() => setActiveTab('news')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                    ${activeTab === 'news' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                            Новости
                        </button>
                        <button
                            onClick={() => setActiveTab('business_apps')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                            ${activeTab === 'business_apps' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Заявки на бизнес
                            {pendingBusinessApps.length > 0 && (
                                <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {pendingBusinessApps.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('manage_businesses')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                            ${activeTab === 'manage_businesses' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            Управление бизнесами
                            {allBusinesses.length > 0 && (
                                <span className="ml-auto bg-gray-200 text-xs px-2 py-0.5 rounded-full">
                                    {allBusinesses.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('stories')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                            ${activeTab === 'stories' ? 'bg-gray-100 text-dark font-bold' : 'text-secondary hover:bg-gray-50'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                            Истории
                            {stories.length > 0 && (
                                <span className="ml-auto bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                                    {stories.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar bg-gray-50">

                        {activeTab === 'moderation' && (
                            <div className="max-w-4xl mx-auto">
                                <h3 className="text-2xl font-bold text-dark mb-6">Ожидают проверки</h3>

                                {pendingAds.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-dark">Всё чисто!</h3>
                                        <p className="text-secondary">Нет новых объявлений для проверки.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {pendingAds.map(ad => (
                                            <div key={ad.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                                                <div className="w-full md:w-64 h-48 relative shrink-0 bg-gray-100">
                                                    <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                                                    {ad.isPremium && <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">VIP</span>}
                                                </div>
                                                <div className="p-6 flex-grow flex flex-col">

                                                    {editingAdId === ad.id ? (
                                                        <div className="space-y-3 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r-lg">
                                                            <h4 className="font-bold text-blue-800 text-sm">Режим редактирования</h4>
                                                            <input
                                                                className="w-full p-2 rounded border-gray-300 text-sm"
                                                                value={editForm.title || ''}
                                                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                                placeholder="Заголовок"
                                                            />
                                                            <textarea
                                                                className="w-full p-2 rounded border border-gray-300 text-sm"
                                                                value={editForm.description || ''}
                                                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                                placeholder="Описание"
                                                                rows={3}
                                                            />
                                                            <input
                                                                type="number"
                                                                className="w-full p-2 rounded border-gray-300 text-sm"
                                                                value={editForm.price || ''}
                                                                onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                                                placeholder="Цена"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleSaveEdit(ad.id)}
                                                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold"
                                                                >
                                                                    Сохранить
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingAdId(null)}
                                                                    className="text-gray-500 px-3 py-1 rounded text-sm font-medium"
                                                                >
                                                                    Отмена
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="text-lg font-bold text-dark">{ad.title}</h4>
                                                                <span className="text-primary font-bold">{ad.price} ₽</span>
                                                            </div>
                                                            <div className="text-xs text-secondary mb-3 flex gap-2">
                                                                <span className="bg-gray-100 px-2 py-1 rounded">{ad.category}</span>
                                                                <span className="bg-gray-100 px-2 py-1 rounded">{ad.subCategory}</span>
                                                                <span>{ad.date}</span>
                                                            </div>
                                                            <p className="text-sm text-secondary line-clamp-2 mb-4">{ad.description}</p>
                                                        </>
                                                    )}

                                                    <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100">
                                                        <button
                                                            onClick={() => onUpdateAdStatus(ad.id, 'approved')}
                                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                            Одобрить
                                                        </button>

                                                        {editingAdId !== ad.id && (
                                                            <button
                                                                onClick={() => handleEditClick(ad)}
                                                                className="px-4 bg-gray-100 hover:bg-gray-200 text-dark font-bold py-2 rounded-lg transition-colors"
                                                                title="Редактировать"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => onUpdateAdStatus(ad.id, 'rejected')}
                                                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            Отклонить
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'active_ads' && (
                            <div className="max-w-4xl mx-auto">
                                <h3 className="text-2xl font-bold text-dark mb-6">Активные объявления</h3>
                                <div className="space-y-6">
                                    {approvedAds.map(ad => (
                                        <div key={ad.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                                            <div className="w-full md:w-48 h-40 relative shrink-0 bg-gray-100">
                                                <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="p-4 flex-grow flex flex-col">
                                                {editingAdId === ad.id ? (
                                                    <div className="space-y-3 mb-2 bg-blue-50 p-4 rounded-xl">
                                                        <input
                                                            className="w-full p-2 rounded border-gray-300 text-sm"
                                                            value={editForm.title || ''}
                                                            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                        />
                                                        <textarea
                                                            className="w-full p-2 rounded border border-gray-300 text-sm"
                                                            value={editForm.description || ''}
                                                            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                            rows={2}
                                                        />
                                                        <input
                                                            type="number"
                                                            className="w-full p-2 rounded border-gray-300 text-sm"
                                                            value={editForm.price || ''}
                                                            onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => setEditingAdId(null)} className="text-gray-500 text-sm font-medium">Отмена</button>
                                                            <button onClick={() => handleSaveEdit(ad.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">Сохранить</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h4 className="font-bold text-dark">{ad.title}</h4>
                                                        <p className="text-sm text-secondary line-clamp-1 mb-2">{ad.description}</p>
                                                        <div className="flex justify-between items-center mt-auto">
                                                            <span className="font-bold text-primary">{ad.price} ₽</span>
                                                            <div className="flex gap-2">
                                                                {!editingAdId && (
                                                                    <button
                                                                        onClick={() => handleEditClick(ad)}
                                                                        className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-100"
                                                                    >
                                                                        Редактировать
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => { if (confirm('Удалить объявление?')) onUpdateAdStatus(ad.id, 'rejected'); }}
                                                                    className="text-red-600 bg-red-50 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-100"
                                                                >
                                                                    Удалить
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'news' && (
                            <div className="max-w-2xl mx-auto">
                                <h3 className="text-2xl font-bold text-dark mb-6">Создание новости</h3>
                                <form onSubmit={handleNewsSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">

                                    <div>
                                        <label className="block text-sm font-bold text-dark mb-2">Заголовок</label>
                                        <input
                                            type="text"
                                            required
                                            value={newsForm.title}
                                            onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                                            placeholder="Громкий заголовок"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-2">Категория</label>
                                            <select
                                                required
                                                value={newsForm.category}
                                                onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                                            >
                                                <option value="">Выберите...</option>
                                                <option value="Город">Город</option>
                                                <option value="Спорт">Спорт</option>
                                                <option value="Культура">Культура</option>
                                                <option value="ЖКХ">ЖКХ</option>
                                                <option value="Происшествия">Происшествия</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-dark mb-2">Изображение</label>
                                            <div className="space-y-2">
                                                {newsForm.image && (
                                                    <div className="relative w-full h-40 bg-gray-100 rounded-xl overflow-hidden">
                                                        <img src={newsForm.image} alt="Preview" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewsForm({ ...newsForm, image: '' })}
                                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                )}
                                                <label className="block">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        disabled={isUploadingImage}
                                                        className="hidden"
                                                    />
                                                    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                                                        {isUploadingImage ? 'Загрузка...' : newsForm.image ? 'Изменить изображение' : 'Загрузить изображение'}
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-dark mb-2">Краткое описание (Анонс)</label>
                                        <textarea
                                            required
                                            rows={2}
                                            value={newsForm.excerpt}
                                            onChange={e => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                                            placeholder="Пара предложений для превью..."
                                            className="w-full bg-gray-50 border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-dark mb-2">Полный текст новости</label>
                                        <textarea
                                            required
                                            rows={6}
                                            value={newsForm.content}
                                            onChange={e => setNewsForm({ ...newsForm, content: e.target.value })}
                                            placeholder="Основной текст статьи..."
                                            className="w-full bg-gray-50 border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmittingNews || isUploadingImage}
                                        className="w-full bg-dark text-white font-bold text-lg py-3 rounded-xl hover:bg-black shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmittingNews ? 'Публикация...' : 'Опубликовать'}
                                    </button>

                                </form>
                            </div>
                        )}

                        {activeTab === 'business_apps' && (
                            <div className="max-w-4xl mx-auto">
                                <h3 className="text-2xl font-bold text-dark mb-6">Заявки на подключение бизнеса</h3>

                                {isLoadingApps ? (
                                    <div className="text-center py-20">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                        <p className="text-secondary mt-4">Загрузка...</p>
                                    </div>
                                ) : businessApplications.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                                        <p className="text-secondary">Нет заявок</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {businessApplications.map(app => (
                                            <div key={app.id} className={`bg-white rounded-2xl p-6 border-2 transition-all ${app.status === 'pending' ? 'border-blue-200 shadow-md' :
                                                app.status === 'approved' ? 'border-green-200' : 'border-gray-200 opacity-60'
                                                }`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-dark">{app.company_name}</h4>
                                                        <p className="text-sm text-secondary">{app.business_type}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                                                        app.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {app.status === 'pending' ? 'Ожидает' : app.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                    <div>
                                                        <span className="text-secondary">Контактное лицо:</span>
                                                        <p className="font-medium text-dark">{app.contact_person}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-secondary">Телефон:</span>
                                                        <p className="font-medium text-dark">{app.phone}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-secondary">Email:</span>
                                                        <p className="font-medium text-dark">{app.email}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-secondary">Дата подачи:</span>
                                                        <p className="font-medium text-dark">
                                                            {(() => {
                                                                const date = new Date(app.created_at);
                                                                return date.toLocaleDateString('ru-RU');
                                                            })()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {app.comment && (
                                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                        <span className="text-xs text-secondary font-bold">Комментарий:</span>
                                                        <p className="text-sm text-dark mt-1">{app.comment}</p>
                                                    </div>
                                                )}

                                                {app.status === 'pending' && (
                                                    <>
                                                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                            <h5 className="text-sm font-bold text-dark mb-3">Загрузить изображения для бизнеса</h5>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs text-secondary mb-1">Аватар (логотип)</label>
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                setIsUploadingBusinessImage(true);
                                                                                try {
                                                                                    const { data: { user } } = await supabase.auth.getUser();
                                                                                    if (!user) {
                                                                                        alert('Пользователь не авторизован');
                                                                                        return;
                                                                                    }
                                                                                    const url = await api.uploadFile(file, 'business-images');
                                                                                    setBusinessImages(prev => ({ ...prev, avatar: url }));
                                                                                } catch (err) {
                                                                                    alert('Ошибка загрузки');
                                                                                } finally {
                                                                                    setIsUploadingBusinessImage(false);
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="text-xs"
                                                                        disabled={isUploadingBusinessImage}
                                                                    />
                                                                    {businessImages.avatar && (
                                                                        <img src={businessImages.avatar} alt="Avatar" className="mt-2 w-20 h-20 object-cover rounded-lg" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-secondary mb-1">Шапка магазина</label>
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                setIsUploadingBusinessImage(true);
                                                                                try {
                                                                                    const { data: { user } } = await supabase.auth.getUser();
                                                                                    if (!user) {
                                                                                        alert('Пользователь не авторизован');
                                                                                        return;
                                                                                    }
                                                                                    const url = await api.uploadFile(file, 'business-images');
                                                                                    setBusinessImages(prev => ({ ...prev, header: url }));
                                                                                } catch (err) {
                                                                                    alert('Ошибка загрузки');
                                                                                } finally {
                                                                                    setIsUploadingBusinessImage(false);
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="text-xs"
                                                                        disabled={isUploadingBusinessImage}
                                                                    />
                                                                    {businessImages.header && (
                                                                        <img src={businessImages.header} alt="Header" className="mt-2 w-full h-16 object-cover rounded-lg" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                                                            <button
                                                                onClick={() => handleApplicationAction(app.id, 'approved', app)}
                                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-colors"
                                                            >
                                                                Одобрить
                                                            </button>
                                                            <button
                                                                onClick={() => handleApplicationAction(app.id, 'rejected', app)}
                                                                className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-2 rounded-lg transition-colors"
                                                            >
                                                                Отклонить
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'manage_businesses' && (
                            <div className="max-w-4xl mx-auto">
                                <h3 className="text-2xl font-bold text-dark mb-6">Управление бизнесами</h3>

                                {isLoadingBusinesses ? (
                                    <div className="text-center py-20">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                        <p className="text-secondary mt-4">Загрузка...</p>
                                    </div>
                                ) : allBusinesses.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                                        <p className="text-secondary">Нет зарегистрированных бизнесов</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Business Edit Form */}
                                        {editingBusiness && (
                                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
                                                <h4 className="text-lg font-bold text-dark mb-4">Редактирование бизнеса</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-bold text-dark mb-2">Название</label>
                                                        <input
                                                            type="text"
                                                            value={businessEditForm.business_name}
                                                            onChange={e => setBusinessEditForm({ ...businessEditForm, business_name: e.target.value })}
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-dark mb-2">Телефон</label>
                                                        <input
                                                            type="text"
                                                            value={businessEditForm.phone}
                                                            onChange={e => setBusinessEditForm({ ...businessEditForm, phone: e.target.value })}
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-dark mb-2">Email</label>
                                                        <input
                                                            type="email"
                                                            value={businessEditForm.email}
                                                            onChange={e => setBusinessEditForm({ ...businessEditForm, email: e.target.value })}
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-dark mb-2">Адрес</label>
                                                        <input
                                                            type="text"
                                                            value={businessEditForm.address}
                                                            onChange={e => setBusinessEditForm({ ...businessEditForm, address: e.target.value })}
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-dark mb-2">Часы работы</label>
                                                        <input
                                                            type="text"
                                                            value={businessEditForm.hours}
                                                            onChange={e => setBusinessEditForm({ ...businessEditForm, hours: e.target.value })}
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                            placeholder="Пн-Пт: 9:00-18:00"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-bold text-dark mb-2">Описание</label>
                                                        <textarea
                                                            value={businessEditForm.description}
                                                            onChange={e => setBusinessEditForm({ ...businessEditForm, description: e.target.value })}
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                            rows={3}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 mt-4">
                                                    <button
                                                        onClick={handleSaveBusiness}
                                                        className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors"
                                                    >
                                                        Сохранить
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingBusiness(null)}
                                                        className="bg-gray-100 text-dark px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                                                    >
                                                        Отмена
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            {allBusinesses.map(business => (
                                                <div key={business.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="text-lg font-bold text-dark">{business.business_name}</h4>
                                                            <p className="text-sm text-secondary capitalize">{business.business_type}</p>
                                                        </div>
                                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                            Активен
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                                        {business.business_data?.phone && (
                                                            <div>
                                                                <span className="text-secondary">Телефон:</span>
                                                                <p className="font-medium text-dark">{business.business_data.phone}</p>
                                                            </div>
                                                        )}
                                                        {business.business_data?.email && (
                                                            <div>
                                                                <span className="text-secondary">Email:</span>
                                                                <p className="font-medium text-dark">{business.business_data.email}</p>
                                                            </div>
                                                        )}
                                                        {business.business_data?.address && (
                                                            <div>
                                                                <span className="text-secondary">Адрес:</span>
                                                                <p className="font-medium text-dark">{business.business_data.address}</p>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="text-secondary">Дата создания:</span>
                                                            <p className="font-medium text-dark">
                                                                {(() => {
                                                                    const date = new Date(business.created_at);
                                                                    return date.toLocaleDateString('ru-RU');
                                                                })()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {business.business_data?.description && (
                                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                            <span className="text-xs text-secondary font-bold">Описание:</span>
                                                            <p className="text-sm text-dark mt-1">{business.business_data.description}</p>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                                                        <button
                                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition-colors"
                                                            onClick={() => handleEditBusiness(business)}
                                                        >
                                                            Редактировать
                                                        </button>
                                                        <button
                                                            className="px-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition-colors"
                                                            onClick={() => handleDeactivateBusiness(business.id)}
                                                        >
                                                            Деактивировать
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Stories Tab */}
                        {activeTab === 'stories' && (
                            <div className="max-w-6xl mx-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-dark">Управление историями</h3>
                                    <button
                                        onClick={() => {
                                            setEditingStory(null);
                                            setIsCreatingStory(true);
                                            setStoryForm({
                                                shop_id: '',
                                                shop_name: '',
                                                avatar: '',
                                                image: '',
                                                text: '',
                                                expires_at: '',
                                                display_order: 0
                                            });
                                        }}
                                        className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors"
                                    >
                                        + Создать историю
                                    </button>
                                </div>

                                {/* Story Form */}
                                {(editingStory !== null || isCreatingStory) && (
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
                                        <h4 className="text-lg font-bold text-dark mb-4">
                                            {editingStory ? 'Редактировать историю' : 'Новая история'}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-dark mb-2">Название магазина</label>
                                                <input
                                                    type="text"
                                                    value={storyForm.shop_name}
                                                    onChange={e => setStoryForm({ ...storyForm, shop_name: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                    placeholder="Название магазина"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-dark mb-2">ID магазина (опционально)</label>
                                                <input
                                                    type="text"
                                                    value={storyForm.shop_id}
                                                    onChange={e => setStoryForm({ ...storyForm, shop_id: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                    placeholder="ID из managed_businesses"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-dark mb-2">Аватар магазина</label>
                                                <div className="space-y-2">
                                                    {storyForm.avatar && (
                                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                                                            <img src={storyForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <label className="block">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={e => handleStoryImageUpload(e, 'avatar')}
                                                            disabled={isUploadingStoryImage}
                                                            className="hidden"
                                                        />
                                                        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-4 text-center cursor-pointer hover:bg-gray-100 transition-colors text-sm">
                                                            {isUploadingStoryImage ? 'Загрузка...' : 'Загрузить аватар'}
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-dark mb-2">Изображение истории</label>
                                                <div className="space-y-2">
                                                    {storyForm.image && (
                                                        <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100">
                                                            <img src={storyForm.image} alt="Story" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <label className="block">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={e => handleStoryImageUpload(e, 'image')}
                                                            disabled={isUploadingStoryImage}
                                                            className="hidden"
                                                        />
                                                        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-4 text-center cursor-pointer hover:bg-gray-100 transition-colors text-sm">
                                                            {isUploadingStoryImage ? 'Загрузка...' : 'Загрузить изображение'}
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-dark mb-2">Текст (опционально)</label>
                                                <textarea
                                                    value={storyForm.text}
                                                    onChange={e => setStoryForm({ ...storyForm, text: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                    placeholder="Текст на истории"
                                                    rows={3}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-dark mb-2">Порядок отображения</label>
                                                <input
                                                    type="number"
                                                    value={storyForm.display_order}
                                                    onChange={e => setStoryForm({ ...storyForm, display_order: Number(e.target.value) })}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={handleSaveStory}
                                                className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors"
                                            >
                                                {editingStory ? 'Сохранить' : 'Создать'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingStory(null);
                                                    setIsCreatingStory(false);
                                                    setStoryForm({
                                                        shop_id: '',
                                                        shop_name: '',
                                                        avatar: '',
                                                        image: '',
                                                        text: '',
                                                        expires_at: '',
                                                        display_order: 0
                                                    });
                                                }}
                                                className="bg-gray-100 text-dark px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Stories List */}
                                {isLoadingStories ? (
                                    <div className="text-center py-20">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                        <p className="text-secondary mt-4">Загрузка историй...</p>
                                    </div>
                                ) : stories.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                                        <p className="text-secondary">Нет созданных историй</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {stories.map(story => (
                                            <div key={story.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                                                        {story.avatar ? (
                                                            <img src={story.avatar} alt={story.shop_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                                                {story.shop_name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h4 className="font-bold text-dark">{story.shop_name}</h4>
                                                        <p className="text-xs text-secondary">Порядок: {story.display_order}</p>
                                                    </div>
                                                </div>
                                                {story.image && (
                                                    <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 mb-3">
                                                        <img src={story.image} alt="Story" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                {story.text && (
                                                    <p className="text-sm text-dark mb-3 line-clamp-2">{story.text}</p>
                                                )}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditStory(story)}
                                                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors text-sm"
                                                    >
                                                        Редактировать
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteStory(story.id)}
                                                        className="px-4 bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600 transition-colors text-sm"
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};