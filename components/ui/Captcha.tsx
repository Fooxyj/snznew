import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, ShieldCheck } from 'lucide-react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
}

export const Captcha: React.FC<CaptchaProps> = ({ onVerify }) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const generate = () => {
    setNum1(Math.floor(Math.random() * 10));
    setNum2(Math.floor(Math.random() * 10));
    setInput('');
    setStatus('idle');
    onVerify(false);
  };

  useEffect(() => {
    generate();
  }, []);

  const check = () => {
    const val = parseInt(input);
    if (!isNaN(val) && val === num1 + num2) {
      setStatus('success');
      onVerify(true);
    } else {
      setStatus('error');
      onVerify(false);
      setInput('');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-200 dark:border-gray-600 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Я не робот
        </span>
        <button 
            type="button" 
            onClick={generate} 
            className="text-blue-500 hover:text-blue-600 transition-transform hover:rotate-180" 
            title="Обновить"
            disabled={status === 'success'}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex gap-2 items-center">
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg font-mono font-bold text-lg select-none py-2 text-gray-800 dark:text-gray-200 shadow-sm">
          {num1} + {num2} = ?
        </div>
        <input 
          type="number" 
          className="w-16 border dark:border-gray-600 rounded-lg p-2 text-center outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white font-bold"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="?"
          disabled={status === 'success'}
          onKeyDown={(e) => e.key === 'Enter' && check()}
        />
        <button 
          type="button"
          onClick={check}
          disabled={status === 'success'}
          className={`px-3 py-2 rounded-lg transition-all shadow-sm ${status === 'success' ? 'bg-green-500 text-white cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {status === 'success' ? <CheckCircle className="w-5 h-5" /> : 'OK'}
        </button>
      </div>
      {status === 'error' && <p className="text-xs text-red-500 mt-1.5 font-medium animate-pulse text-center">Неверно, попробуйте еще раз</p>}
    </div>
  );
};