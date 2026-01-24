import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Common';
import { Lock, Mail, User, Loader2, Info, X, FileText, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import { useQueryClient } from '@tanstack/react-query';
import { Captcha } from '../components/ui/Captcha';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { error: showError, success } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const platformName = "Снежинск Лайф";

  const validate = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) return "Введите корректный Email";
      if (formData.password.length < 6) return "Пароль должен быть не менее 6 символов";
      if (!isLogin) {
          if (!formData.name.trim()) return "Введите имя";
          if (!isAgreed) return "Необходимо принять пользовательское соглашение";
      }
      return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    const validationError = validate();
    if (validationError) {
        showError(validationError);
        return;
    }

    if (!isLogin && !isCaptchaVerified) {
        showError("Пожалуйста, подтвердите, что вы не робот");
        return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await api.signIn(formData.email, formData.password);
        success("С возвращением!");
      } else {
        await api.signUp(formData.email, formData.password, formData.name);
        success("Аккаунт создан!");
      }
      
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      await queryClient.invalidateQueries({ queryKey: ['myBusiness'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      navigate('/');
    } catch (err: any) {
      const msg = err.message || "Ошибка авторизации";
      setAuthError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      {/* Модальное окно с текстом соглашения */}
      {showTermsModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border dark:border-gray-700 animate-in zoom-in-95">
                  <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-blue-600" />
                          <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">Пользовательское соглашение</h3>
                      </div>
                      <button onClick={() => setShowTermsModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                          <X className="w-6 h-6 text-gray-400" />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 prose prose-blue dark:prose-invert max-w-none text-sm custom-scrollbar">
                      <p className="font-bold">Правила использования платформы «{platformName}»</p>
                      
                      <h4>1. Общие положения</h4>
                      <p>Настоящее соглашение регулирует использование цифровой платформы «{platformName}». Платформа является агрегатором информации, сервисов, объявлений и бизнеса. Платформа не является продавцом товаров и услуг, если прямо не указано иное.</p>
                      
                      <h4>2. Регистрация</h4>
                      <p>Для доступа к функциям требуется регистрация. Пользователь обязуется предоставлять достоверные данные, не передавать аккаунт третьим лицам и соблюдать правила сервиса.</p>
                      
                      <h4>3. Контент пользователей</h4>
                      <p>Пользователь может размещать объявления, публикации, сообщения, истории и комментарии. Пользователь несёт полную ответственность за размещаемый контент.</p>
                      <p><strong>Запрещено:</strong> Нарушение законов РФ, оскорбления, мошенничество, экстремизм, спам, порнография, незаконные товары.</p>
                      
                      <h4>4. Модерация</h4>
                      <p>Платформа вправе удалять контент, блокировать аккаунты, ограничивать доступ и запрашивать подтверждение личности без объяснения причин при нарушении правил.</p>
                      
                      <h4>5. Платные функции</h4>
                      <p>Платформа предоставляет платные услуги: VIP/PRO статусы, продвижение объявлений, бизнес-витрины. Условия указаны в Публичной Оферте.</p>
                      
                      <h4>6. Ответственность</h4>
                      <p>Платформа является информационным посредником и не несёт ответственности за действия пользователей, качество товаров и услуг, достоверность информации в объявлениях.</p>
                      
                      <h4>7. Ограничение ответственности</h4>
                      <p>Сервис предоставляется «как есть». Оператор не гарантирует бесперебойную работу и отсутствие ошибок.</p>
                  </div>
                  <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                      <Button className="w-full py-4 rounded-2xl font-black uppercase tracking-widest" onClick={() => { setIsAgreed(true); setShowTermsModal(false); }}>
                          Я прочитал и согласен
                      </Button>
                  </div>
              </div>
          </div>
      )}

      <div className="bg-white dark:bg-gray-800 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-black text-blue-900 dark:text-blue-400 uppercase tracking-tighter leading-none">
            {isLogin ? 'Вход' : 'Регистрация'}
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-3">
            {platformName} • Единый портал
          </p>
        </div>

        {authError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-xs font-bold text-red-700 dark:text-red-300 leading-relaxed">{authError}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Ваше имя"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white font-bold placeholder:text-gray-400 placeholder:font-medium"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white font-bold placeholder:text-gray-400 placeholder:font-medium"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="password"
              placeholder="Пароль"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white font-bold placeholder:text-gray-400 placeholder:font-medium"
              required
              minLength={6}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
              <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className="pt-2">
                    <Captcha onVerify={setIsCaptchaVerified} />
                </div>
                
                {/* Чекбокс соглашения */}
                <div className="flex items-start gap-3 p-1">
                    <button 
                        type="button"
                        onClick={() => setIsAgreed(!isAgreed)}
                        className={`w-6 h-6 rounded-lg border-2 shrink-0 flex items-center justify-center transition-all ${isAgreed ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}
                    >
                        {isAgreed && <Check className="w-4 h-4 text-white stroke-[4px]" />}
                    </button>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight font-medium">
                        Я принимаю условия{' '}
                        <button 
                            type="button" 
                            onClick={() => setShowTermsModal(true)}
                            className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-tighter hover:underline"
                        >
                            Пользовательского соглашения
                        </button>
                        {' '}и политики конфиденциальности
                    </p>
                </div>
              </div>
          )}

          <Button 
            className={`w-full py-5 text-lg mt-4 shadow-2xl transition-all font-black uppercase tracking-widest rounded-2xl ${(!isLogin && (!isAgreed || !isCaptchaVerified)) ? 'opacity-50 grayscale cursor-not-allowed' : 'shadow-blue-500/20 hover:scale-[1.02] active:scale-95'}`} 
            disabled={loading || (!isLogin && (!isAgreed || !isCaptchaVerified))}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (isLogin ? 'Войти в город' : 'Создать аккаунт')}
          </Button>
        </form>

        <div className="mt-8 text-center relative z-10 border-t dark:border-gray-700 pt-6">
          <button 
            onClick={() => { 
                setIsLogin(!isLogin); 
                setIsCaptchaVerified(false); 
                setIsAgreed(false); 
                setAuthError(null);
            }}
            className="text-xs text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest hover:text-blue-800 transition-colors"
          >
            {isLogin ? 'Нет аккаунта? Стать жителем' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>

        {/* Фоновый декор */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
};