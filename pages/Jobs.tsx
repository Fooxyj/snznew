

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Vacancy, Resume } from '../types';
import { Button } from '../components/ui/Common';
import { Briefcase, MapPin, User, Search, Plus, Phone, Loader2, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateVacancyModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        companyName: '',
        salaryMin: '',
        salaryMax: '',
        description: '',
        contactPhone: '',
        schedule: 'full'
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createVacancy({
                ...formData,
                salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
                salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
                schedule: formData.schedule as any
            });
            onSuccess();
            onClose();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Разместить вакансию</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Должность</label>
                        <input className="w-full border rounded-lg p-2" placeholder="Продавец-консультант" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Компания</label>
                        <input className="w-full border rounded-lg p-2" placeholder="ООО Ромашка" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Зарплата от</label>
                            <input type="number" className="w-full border rounded-lg p-2" value={formData.salaryMin} onChange={e => setFormData({...formData, salaryMin: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Зарплата до</label>
                            <input type="number" className="w-full border rounded-lg p-2" value={formData.salaryMax} onChange={e => setFormData({...formData, salaryMax: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">График</label>
                        <select className="w-full border rounded-lg p-2 bg-white" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})}>
                            <option value="full">Полный день</option>
                            <option value="shift">Сменный</option>
                            <option value="remote">Удаленка</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Описание</label>
                        <textarea rows={4} className="w-full border rounded-lg p-2 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Телефон для связи</label>
                        <input className="w-full border rounded-lg p-2" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} required />
                    </div>
                    <Button className="w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Разместить'}</Button>
                </form>
            </div>
        </div>
    );
};

const CreateResumeModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        profession: '',
        salaryExpectation: '',
        experience: '',
        about: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createResume({
                ...formData,
                salaryExpectation: formData.salaryExpectation ? Number(formData.salaryExpectation) : undefined,
            });
            onSuccess();
            onClose();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Создать резюме</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Желаемая должность</label>
                        <input className="w-full border rounded-lg p-2" placeholder="Водитель" value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Ваше имя</label>
                        <input className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Ожидаемая зарплата</label>
                        <input type="number" className="w-full border rounded-lg p-2" value={formData.salaryExpectation} onChange={e => setFormData({...formData, salaryExpectation: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Опыт работы</label>
                        <input className="w-full border rounded-lg p-2" placeholder="5 лет, работал в такси" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">О себе (навыки)</label>
                        <textarea rows={4} className="w-full border rounded-lg p-2 resize-none" value={formData.about} onChange={e => setFormData({...formData, about: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Телефон</label>
                        <input className="w-full border rounded-lg p-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                    </div>
                    <Button className="w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Опубликовать'}</Button>
                </form>
            </div>
        </div>
    );
};

export const JobsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'vacancies' | 'resumes'>('vacancies');
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    
    const navigate = useNavigate();

    const loadData = async () => {
        setLoading(true);
        try {
            const [v, r] = await Promise.all([api.getVacancies(), api.getResumes()]);
            setVacancies(v);
            setResumes(r);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChat = async (userId: string) => {
        try {
            const chatId = await api.startChat(userId);
            navigate(`/chat?id=${chatId}`);
        } catch (e: any) {
            alert(e.message);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
            <CreateVacancyModal isOpen={isVacancyModalOpen} onClose={() => setIsVacancyModalOpen(false)} onSuccess={loadData} />
            <CreateResumeModal isOpen={isResumeModalOpen} onClose={() => setIsResumeModalOpen(false)} onSuccess={loadData} />

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Briefcase className="text-blue-600" /> Работа и Карьера
                </h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsResumeModalOpen(true)}>Создать резюме</Button>
                    <Button onClick={() => setIsVacancyModalOpen(true)}>Разместить вакансию</Button>
                </div>
            </div>

            <div className="flex border-b mb-6">
                <button 
                    onClick={() => setActiveTab('vacancies')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'vacancies' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Briefcase className="w-4 h-4" /> Вакансии
                </button>
                <button 
                    onClick={() => setActiveTab('resumes')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'resumes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <User className="w-4 h-4" /> Резюме
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
            ) : (
                <div className="space-y-4">
                    {activeTab === 'vacancies' ? (
                        vacancies.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">Пока нет вакансий</div>
                        ) : (
                            vacancies.map(v => (
                                <div key={v.id} className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-blue-700">{v.title}</h3>
                                            <div className="text-gray-500 text-sm font-medium mb-2">{v.companyName}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg">
                                                {v.salaryMin ? `${v.salaryMin.toLocaleString()} ₽` : ''} 
                                                {v.salaryMax ? ` - ${v.salaryMax.toLocaleString()} ₽` : ''}
                                                {!v.salaryMin && !v.salaryMax && 'З/П не указана'}
                                            </div>
                                            <div className="text-xs bg-gray-100 px-2 py-1 rounded inline-block mt-1 text-gray-600">
                                                {v.schedule === 'full' ? 'Полный день' : v.schedule === 'shift' ? 'Сменный график' : 'Удаленно'}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mt-3 whitespace-pre-line">{v.description}</p>
                                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <Phone className="w-4 h-4" /> {v.contactPhone}
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => handleChat(v.authorId)}>Написать</Button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        resumes.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">Пока нет резюме</div>
                        ) : (
                            resumes.map(r => (
                                <div key={r.id} className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{r.profession}</h3>
                                            <div className="text-gray-500 text-sm font-medium mb-2">{r.name}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-green-600">
                                                {r.salaryExpectation ? `${r.salaryExpectation.toLocaleString()} ₽` : 'По договоренности'}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Опыт: {r.experience}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mt-2 mb-3">
                                        {r.about}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <Phone className="w-4 h-4" /> {r.phone}
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => handleChat(r.authorId)}>Написать</Button>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            )}
        </div>
    );
};