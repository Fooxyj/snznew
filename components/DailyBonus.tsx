
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Button } from './ui/Common';
import { Gift, X, Sparkles, Coins, Trophy } from 'lucide-react';

export const DailyBonus: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<'offer' | 'claiming' | 'claimed'>('offer');
  const [reward, setReward] = useState({ xp: 50 });
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkBonus = async () => {
      const user = await api.getCurrentUser();
      if (!user) return;

      const lastClaim = localStorage.getItem(`daily_bonus_${user.id}`);
      const now = new Date();
      const today = now.toDateString();

      // If never claimed or claimed on a different day
      if (lastClaim !== today) {
        // Simple logic: randomize reward slightly
        const randomXP = Math.floor(Math.random() * 50) + 50; // 50-100 XP
        setReward({ xp: randomXP });
        
        // Delay appearance slightly for UX
        setTimeout(() => setIsVisible(true), 2000);
      }
    };
    checkBonus();
  }, []);

  const claimMutation = useMutation({
    mutationFn: () => api.claimDailyBonus(reward.xp),
    onMutate: () => setStep('claiming'),
    onSuccess: () => {
      setStep('claimed');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Close automatically after celebration
      setTimeout(() => setIsVisible(false), 3000);
    },
    onError: () => setIsVisible(false)
  });

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative overflow-hidden text-center animate-in zoom-in-95 duration-300 border-2 border-yellow-400/30">
        
        {/* Background rays effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100/20 to-purple-100/20 pointer-events-none"></div>
        
        <button 
            onClick={() => setIsVisible(false)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="relative z-10">
            {step === 'offer' && (
                <>
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-200 dark:shadow-none animate-bounce">
                        <Gift className="w-12 h-12 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Ежедневный бонус!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Заходите каждый день, чтобы получать опыт.
                    </p>
                    
                    <div className="flex justify-center gap-4 mb-8">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl min-w-[100px]">
                            <Trophy className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                            <div className="font-bold text-blue-700 dark:text-blue-300">+{reward.xp} XP</div>
                        </div>
                    </div>

                    <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-none shadow-xl shadow-orange-200 dark:shadow-none"
                        onClick={() => claimMutation.mutate()}
                    >
                        Забрать награду
                    </Button>
                </>
            )}

            {step === 'claiming' && (
                <div className="py-12">
                    <Sparkles className="w-16 h-16 text-yellow-500 animate-spin mx-auto mb-4" />
                    <h3 className="font-bold text-xl dark:text-white">Открываем...</h3>
                </div>
            )}

            {step === 'claimed' && (
                <div className="py-8 animate-in zoom-in">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Получено!</h2>
                    <p className="text-gray-600 dark:text-gray-300">Возвращайтесь завтра за новым подарком.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
