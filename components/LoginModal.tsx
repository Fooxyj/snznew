
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onLogin callback is deprecated in favor of App.tsx listening to auth state, 
  // but we can keep it if we need to pass manual data, though Supabase handles session globally.
  // We'll just trigger onClose on success.
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
            // CRITICAL FIX: Redirect user back to the current URL, not localhost default
            emailRedirectTo: window.location.origin, 
          },
        });
        
        if (error) throw error;
        
        // If email confirmation is enabled on Supabase, session will be null upon signup
        if (data.user && !data.session) {
            alert('Регистрация прошла успешно! На вашу почту отправлено письмо. Пожалуйста, подтвердите Email перед входом.\n\n(Проверьте папку Спам, если письма нет)');
            setIsRegistering(false); // Switch back to login mode so user can sign in after confirming
        } else {
            alert('Регистрация успешна! Вы вошли в систему.');
            onClose();
            // Reset form
            setEmail('');
            setPassword('');
            setName('');
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        // Success
        onClose();
        // Reset form
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      console.error(err);
      // Handle specific Supabase errors
      if (err.message === 'Email not confirmed') {
          setError('Ваш Email не подтвержден. Пожалуйста, проверьте почту и перейдите по ссылке.');
      } else if (err.message === 'Invalid login credentials') {
          setError('Неверный Email или пароль.');
      } else {
          setError(err.message || 'Произошла ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up p-8">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-dark mb-2 text-center">
          {isRegistering ? 'Регистрация' : 'Вход'}
        </h2>
        <p className="text-secondary text-center mb-8 text-sm">
          {isRegistering 
            ? 'Создайте аккаунт, чтобы управлять объявлениями' 
            : 'Войдите, используя Email и пароль'
          }
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegistering && (
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">Ваше имя</label>
              <input 
                type="text" 
                placeholder="Иван Иванов"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-dark focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                value={name}
                onChange={e => setName(e.target.value)}
                required={isRegistering}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">Email</label>
            <input 
              type="email" 
              placeholder="example@mail.ru"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-dark focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">Пароль</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-dark focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-red-500 text-center text-sm bg-red-50 p-2 rounded-lg font-medium">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-wait"
          >
            {loading ? 'Загрузка...' : (isRegistering ? 'Зарегистрироваться' : 'Войти')}
          </button>

          <div className="text-center mt-4">
             <p className="text-sm text-secondary">
               {isRegistering ? 'Уже есть аккаунт?' : 'Нет аккаунта?'} 
               <button 
                 type="button"
                 onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                 className="text-primary font-bold ml-1 hover:underline"
               >
                 {isRegistering ? 'Войти' : 'Зарегистрироваться'}
               </button>
             </p>
          </div>
        </form>

      </div>
    </div>
  );
};
