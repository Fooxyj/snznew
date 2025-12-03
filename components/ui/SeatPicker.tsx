
import React from 'react';

export const SeatPicker: React.FC<{ 
    price: number;
    bookedSeats: {row: number, col: number}[];
    onSelect: (row: number, col: number) => void;
    selectedSeat: {row: number, col: number} | null;
}> = ({ price, bookedSeats, onSelect, selectedSeat }) => {
    const rows = 6;
    const cols = 8;

    const isBooked = (r: number, c: number) => bookedSeats.some(s => s.row === r && s.col === c);
    const isSelected = (r: number, c: number) => selectedSeat?.row === r && selectedSeat?.col === c;

    return (
        <div className="flex flex-col items-center">
            {/* Screen */}
            <div className="w-full h-2 bg-gray-300 rounded-full mb-8 relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-gray-400 text-xs tracking-widest uppercase">Экран</div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-transparent opacity-50 blur-sm"></div>
            </div>

            <div className="grid gap-2 mb-6">
                {Array.from({ length: rows }).map((_, r) => (
                    <div key={r} className="flex gap-2">
                        {Array.from({ length: cols }).map((_, c) => {
                            const booked = isBooked(r, c);
                            const selected = isSelected(r, c);
                            return (
                                <button
                                    key={`${r}-${c}`}
                                    disabled={booked}
                                    onClick={() => onSelect(r, c)}
                                    className={`
                                        w-8 h-8 rounded-t-lg text-[10px] flex items-center justify-center font-bold transition-all
                                        ${booked 
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                            : selected 
                                                ? 'bg-blue-600 text-white scale-110 shadow-lg' 
                                                : 'bg-white border border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500'
                                        }
                                    `}
                                >
                                    {c + 1}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="flex gap-4 text-xs text-gray-500 mb-6">
                <div className="flex items-center gap-1"><div className="w-3 h-3 border border-gray-300 rounded-sm"></div> Свободно</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-200 rounded-sm"></div> Занято</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-600 rounded-sm"></div> Ваш выбор</div>
            </div>
        </div>
    );
};
