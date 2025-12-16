
import React, { useState, useEffect } from 'react';
import { Movie, Seat } from '../types';

interface MovieBookingModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

// Helper to generate a mock hall
const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const rows = 6;
  const cols = 8;
  
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      seats.push({
        id: `${r}-${c}`,
        row: r,
        number: c,
        // Randomly occupy some seats
        status: Math.random() < 0.3 ? 'occupied' : 'available',
        price: 350
      });
    }
  }
  return seats;
};

export const MovieBookingModal: React.FC<MovieBookingModalProps> = ({ movie, isOpen, onClose }) => {
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [seats, setSeats] = useState<Seat[]>([]);
  const [step, setStep] = useState<'time' | 'seats' | 'success'>('time');

  useEffect(() => {
    if (isOpen && movie) {
      setStep('time');
      setSelectedTime('');
      setSeats(generateSeats());
    }
  }, [isOpen, movie]);

  if (!isOpen || !movie) return null;

  const handleSeatClick = (seatId: string) => {
    setSeats(prev => prev.map(seat => {
      if (seat.id === seatId) {
        if (seat.status === 'occupied') return seat;
        return {
          ...seat,
          status: seat.status === 'selected' ? 'available' : 'selected'
        };
      }
      return seat;
    }));
  };

  const selectedSeats = seats.filter(s => s.status === 'selected');
  const totalPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);

  const handleBuy = () => {
    setStep('success');
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl relative flex flex-col md:flex-row text-white my-auto animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left Side: Movie Poster & Info */}
        <div className="w-full md:w-1/3 relative h-64 md:h-auto shrink-0">
            <img src={movie.image} alt={movie.title} className="absolute inset-0 w-full h-full object-cover opacity-70 md:rounded-l-3xl rounded-t-3xl md:rounded-tr-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-6 w-full">
                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded mb-2 inline-block shadow-sm">{movie.ageLimit}</span>
                <h2 className="text-3xl font-bold leading-tight mb-2 drop-shadow-md">{movie.title}</h2>
                <p className="text-gray-300 text-sm mb-3 font-medium">{movie.genre}</p>
                <p className="text-gray-400 text-xs line-clamp-3 hidden md:block">{movie.description}</p>
            </div>
        </div>

        {/* Right Side: Logic */}
        <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col min-h-[400px]">
            
            {step === 'time' && (
                <div className="flex flex-col h-full justify-center">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Выберите сеанс на сегодня
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {movie.showtimes.map(time => (
                            <button
                                key={time}
                                onClick={() => { setSelectedTime(time); setStep('seats'); }}
                                className="py-4 rounded-xl bg-gray-800 border border-gray-700 hover:bg-primary hover:border-primary transition-all text-lg font-bold shadow-lg hover:shadow-primary/30"
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 'seats' && (
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6 text-sm flex-wrap">
                        <button onClick={() => setStep('time')} className="text-gray-400 hover:text-white flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            Назад
                        </button>
                        <span className="text-gray-600 hidden sm:inline">|</span>
                        <span className="text-primary font-bold">{selectedTime}</span>
                        <span className="text-gray-600 hidden sm:inline">|</span>
                        <span>Зал №1</span>
                    </div>

                    {/* Screen Visual */}
                    <div className="w-full h-8 bg-gradient-to-b from-white/10 to-transparent rounded-[50%] opacity-50 mb-8 mx-auto relative shrink-0">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 uppercase tracking-widest">Экран</div>
                    </div>

                    {/* Seats Grid Container with scroll for small screens */}
                    <div className="flex-grow flex items-center justify-center overflow-auto min-h-[200px] mb-4">
                        <div className="grid grid-cols-8 gap-2 sm:gap-3 p-1">
                            {seats.map(seat => (
                                <button
                                    key={seat.id}
                                    disabled={seat.status === 'occupied'}
                                    onClick={() => handleSeatClick(seat.id)}
                                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-t-lg text-[10px] flex items-center justify-center transition-all border border-transparent
                                        ${seat.status === 'occupied' ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 
                                          seat.status === 'selected' ? 'bg-primary text-white shadow-[0_0_10px_rgba(37,99,235,0.6)] scale-110 z-10' : 
                                          'bg-gray-700/50 hover:bg-gray-600 hover:border-gray-500 text-transparent hover:text-white/50'}`}
                                >
                                    {seat.status !== 'occupied' && seat.row}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-4 sm:gap-6 text-xs text-gray-400 mb-4 shrink-0 flex-wrap">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-700/50 rounded-full"></div> Свободно</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-800 rounded-full"></div> Занято</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded-full"></div> Выбрано</div>
                    </div>

                    {/* Footer Action */}
                    <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                        <div className="text-center sm:text-left">
                            <p className="text-xs text-gray-400">Итого к оплате:</p>
                            <p className="text-2xl font-bold">{totalPrice} ₽</p>
                        </div>
                        <button 
                            disabled={selectedSeats.length === 0}
                            onClick={handleBuy}
                            className="w-full sm:w-auto bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                        >
                            Купить билеты
                        </button>
                    </div>
                </div>
            )}

            {step === 'success' && (
                <div className="flex flex-col h-full items-center justify-center text-center py-10">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Билеты куплены!</h3>
                    <p className="text-gray-400 mb-8 max-w-xs">QR-код отправлен вам на телефон. Покажите его на входе в зал.</p>
                    <div className="bg-gray-800 p-4 rounded-xl w-full max-w-xs text-left mb-6 border border-gray-700">
                        <p className="text-gray-500 text-xs mb-1">Фильм</p>
                        <p className="font-bold mb-3 text-lg">{movie.title}</p>
                        <div className="flex justify-between">
                            <div>
                                <p className="text-gray-500 text-xs mb-1">Время</p>
                                <p className="font-bold">{selectedTime}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs mb-1">Места</p>
                                <p className="font-bold">{selectedSeats.map(s => `${s.row} ряд ${s.number}`).join('; ')}</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-primary font-bold hover:text-blue-400 transition-colors">Вернуться на главную</button>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
