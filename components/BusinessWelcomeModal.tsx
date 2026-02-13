
import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Info, Loader2, AlertTriangle, FileText, Scale } from 'lucide-react';
import { Button } from './ui/Common';

interface BusinessWelcomeModalProps {
    isOpen: boolean;
    onAccept: () => Promise<void>;
    businessName: string;
}

export const BusinessWelcomeModal: React.FC<BusinessWelcomeModalProps> = ({ isOpen, onAccept, businessName }) => {
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleAccept = async () => {
        if (!agreed) return;
        setLoading(true);
        try {
            await onAccept();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-3xl animate-in fade-in duration-500">
            <div className="bg-white dark:bg-gray-800 rounded-[3rem] w-full max-w-3xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border dark:border-gray-700 overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="p-8 md:p-10 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700 shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                            <Scale className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black dark:text-white uppercase tracking-tighter leading-none">Юридический регламент</h2>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">{businessName} • Соглашение о контенте</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-gray-900 dark:text-gray-100 font-bold text-base leading-relaxed">
                            Я подтверждаю, что, размещая карточки товаров и услуг на своей бизнес странице, я понимаю и принимаю следующие условия:
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <div className="flex gap-4">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl h-fit shrink-0">
                                <Info className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                <strong>Статус карточки:</strong> Карточка товара/услуги — это информационный элемент, содержащий описание, цену, фото и контакты. Она <strong>не является рекламой</strong> в смысле Федерального закона № 38-ФЗ «О рекламе» от 13.03.2006.
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl h-fit shrink-0">
                                <Ban className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                <strong>Ограничения:</strong> Я обязуюсь не размещать через карточки рекламную продукцию, включая стимулирование продаж, сравнение с конкурентами, использование оценочных суждений («лучший», «единственный», «выгоднее всех»), призывы к действию или недостоверные утверждения.
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl h-fit shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                <strong>Ответственность:</strong> При нарушении требований закона № 38-ФЗ ответственность несёт <strong>исключительно предприниматель</strong> — вплоть до штрафа по ст. 14.3 КоАП РФ (до 500 000 рублей) и претензий со стороны Роспотребнадзора или ФАС.
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl h-fit shrink-0">
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                <strong>Статус Платформы:</strong> Владелец платформы не является рекламоиздателем по отношению к бизнес-странице предпринимателя и не несет ответственности за содержание карточек. Платформа предоставляет только техническую возможность создания бизнес-страницы.
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t dark:border-gray-700">
                        <p className="text-xs text-gray-400 font-medium italic text-center">
                            Вся информация в карточках носит исключительно ознакомительный характер и не подпадает под регулирование как реклама только при соблюдении этих условий.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 md:p-10 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
                    <label className="flex items-start gap-4 cursor-pointer group mb-8">
                        <div 
                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${agreed ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/30 scale-110' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 group-hover:border-blue-400'}`}
                            onClick={() => setAgreed(!agreed)}
                        >
                            {agreed && <CheckCircle className="w-5 h-5 text-white stroke-[3]" />}
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 select-none leading-tight">
                            Я подтверждаю, что ознакомлен с данным соглашением, понимаю юридические последствия и добровольно принимаю его условия.
                        </span>
                    </label>

                    <Button 
                        onClick={handleAccept} 
                        disabled={!agreed || loading}
                        className={`w-full py-5 text-lg font-black uppercase tracking-widest shadow-2xl transition-all duration-300 ${!agreed ? 'opacity-20 grayscale cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 active:scale-95'}`}
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Начать работу'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const Ban: React.FC<any> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
);
