
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Vacancy, Resume, User } from '../types';
import { Button } from '../components/ui/Common';
import { Loader2, Briefcase, User as UserIcon, Phone, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PhoneInput } from '../components/ui/PhoneInput';

const CreateVacancyModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ title: '', companyName: '', description: '', contactPhone: '', salaryMin: '', salaryMax: '', schedule: 'full' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createVacancy({
                ...formData,
                salaryMin: Number(formData.salaryMin),
                salaryMax: Number(formData.salaryMax),
                schedule: formData.schedule as 'full' | 'shift' | 'remote'
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
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Разместить вакансию</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Должность</label>
                        <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Компания</label>
                        <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Мин. ЗП</label>
                            <input type="number" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.salaryMin} onChange={e => setFormData({...formData, salaryMin: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Макс. ЗП</label>
                            <input type="number" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.salaryMax} onChange={e => setFormData({...formData, salaryMax: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">График</label>
                        <select className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})}>
                            <option value="full">Полный день</option>
                            <option value="shift">Сменный</option>
                            <option value="remote">Удаленно</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Телефон</label>
                        <PhoneInput 
                            value={formData.contactPhone}
                            onChangeText={val => setFormData({...formData, contactPhone: val})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Описание</label>
                        <textarea className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                    </div>
                    <Button className="w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Разместить'}</Button>
                </form>
            </div>
        </div>
    );
};

const CreateResumeModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', profession: '', experience: '', salaryExpectation: '', about: '', phone: '' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createResume({
                ...formData,
                salaryExpectation: Number(formData.salaryExpectation)
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
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Создать резюме</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Имя</label>
                        <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Профессия</label>
                        <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Опыт</label>
                            <input className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="3 года" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Ожидаемая ЗП</label>
                            <input type="number" className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.salaryExpectation} onChange={e => setFormData({...formData, salaryExpectation: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Телефон</label>
                        <PhoneInput 
                            value={formData.phone}
                            onChangeText={val => setFormData({...formData, phone: val})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">О себе</label>
                        <textarea className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none" rows={4} value={formData.about} onChange={e => setFormData({...formData, about: e.target.value})} required />
                    </div>
                    <Button className="w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Создать'}</Button>
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
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    
    const navigate = useNavigate();

    const loadData = async () => {
        setLoading(true);
        try {
            const [v, r, u] = await Promise.all([api.getVacancies(), api.getResumes(), api.getCurrentUser()]);
            setVacancies(v);
            setResumes(r);
            setCurrentUser(u);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const checkAuth = (action: () => void) => {
        if (currentUser) {
            action();
        } else {
            if (confirm("Для этого действия необходимо войти в систему. Перейти ко входу?")) {
                navigate('/auth');
            }
        }
    };

    const handleChat = async (userId: string, context: string) => {
        if (!currentUser) {
            if (confirm("Чтобы написать, необходимо войти. Перейти ко входу?")) {
                navigate('/auth');
            }
            return;
        }
        try {
            const chatId = await api.startChat(userId, context);
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
                <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
                    <Briefcase className="text-blue-600" /> Работа и Карьера
                </h1>
                <div className="flex gap-2">
                    <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300" onClick={() => checkAuth(() => setIsResumeModalOpen(true))}>Создать резюме</Button>
                    <Button onClick={() => checkAuth(() => setIsVacancyModalOpen(true))}>Разместить вакансию</Button>
                </div>
            </div>

            <div className="flex border-b dark:border-gray-700 mb-6">
                <button 
                    onClick={() => setActiveTab('vacancies')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'vacancies' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Briefcase className="w-4 h-4" /> Вакансии
                </button>
                <button 
                    onClick={() => setActiveTab('resumes')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'resumes' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <UserIcon className="w-4 h-4" /> Резюме
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
                                <div key={v.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400">{v.title}</h3>
                                            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">{v.companyName}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg dark:text-white">
                                                {v.salaryMin ? `${v.salaryMin.toLocaleString()} ₽` : ''} 
                                                {v.salaryMax ? ` - ${v.salaryMax.toLocaleString()} ₽` : ''}
                                                {!v.salaryMin && !v.salaryMax && 'З/П не указана'}
                                            </div>
                                            <div className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded inline-block mt-1 text-gray-600 dark:text-gray-300">
                                                {v.schedule === 'full' ? 'Полный день' : v.schedule === 'shift' ? 'Сменный график' : 'Удаленно'}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 mt-3 whitespace-pre-line">{v.description}</p>
                                    <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                            <Phone className="w-4 h-4" /> {v.contactPhone}
                                        </div>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="dark:border-gray-600 dark:text-gray-300" 
                                            onClick={() => handleChat(v.authorId, `Вакансия: ${v.title} в ${v.companyName}`)}
                                        >
                                            Написать
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        resumes.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">Пока нет резюме</div>
                        ) : (
                            resumes.map(r => (
                                <div key={r.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{r.profession}</h3>
                                            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">{r.name}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-green-600 dark:text-green-400">
                                                {r.salaryExpectation ? `${r.salaryExpectation.toLocaleString()} ₽` : 'По договоренности'}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Опыт: {r.experience}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 mt-2 mb-3">
                                        {r.about}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                            <Phone className="w-4 h-4" /> {r.phone}
                                        </div>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="dark:border-gray-600 dark:text-gray-300" 
                                            onClick={() => handleChat(r.authorId, `Резюме: ${r.profession} (${r.name})`)}
                                        >
                                            Написать
                                        </Button>
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
