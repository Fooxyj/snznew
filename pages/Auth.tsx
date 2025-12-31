
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Common';
import { Lock, Mail, User, Loader2, Info } from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import { useQueryClient } from '@tanstack/react-query';
import { Captcha } from '../components/ui/Captcha';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const navigate = useNavigate();
  const { toast, error: showError, success } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const validate = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) return "Введите корректный Email";
      if (formData.password.length < 6) return "Пароль должен быть не менее 6 символов";
      if (!isLogin && !formData.name.trim()) return "Введите имя";
      return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      // Update global user state seamlessly
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      await queryClient.invalidateQueries({ queryKey: ['myBusiness'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      navigate('/');
    } catch (err: any) {
      showError(err.message || "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">
            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Снежинск Онлайн - Единый городской портал
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ваше имя"
                className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Пароль"
              className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white"
              required
              minLength={6}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
              <>
                <div className="pt-2">
                    <Captcha onVerify={setIsCaptchaVerified} />
                </div>
                <div className="flex gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border dark:border-gray-700 mt-2">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">
                        Нажимая кнопку «Создать аккаунт», вы соглашаетесь с <Link to="/legal" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Политикой конфиденциальности</Link> и <Link to="/legal" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Правилами пользования</Link> сервисом.
                    </p>
                </div>
              </>
          )}

          <Button className="w-full py-3 text-lg mt-4 shadow-lg shadow-blue-100 dark:shadow-none" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isLogin ? 'Войти' : 'Создать аккаунт')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setIsCaptchaVerified(false); }}
            className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  );
};
