
import React, { useEffect } from 'react';
import { Notification } from '../types';

interface ToastNotificationProps {
  notifications: Notification[];
  onRemove: (id: number) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-20 right-4 z-[70] flex flex-col gap-3 pointer-events-none">
      {notifications.map((note) => (
        <NotificationItem key={note.id} note={note} onRemove={onRemove} />
      ))}
    </div>
  );
};

const NotificationItem: React.FC<{ note: Notification; onRemove: (id: number) => void }> = ({ note, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(note.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [note.id, onRemove]);

  const bgClass = note.type === 'success' ? 'bg-green-500' : note.type === 'error' ? 'bg-red-500' : 'bg-dark';
  const icon = note.type === 'success' ? (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
  ) : note.type === 'error' ? (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
  ) : (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  );

  return (
    <div className={`pointer-events-auto flex items-center gap-3 ${bgClass} text-white px-4 py-3 rounded-xl shadow-lg shadow-black/20 animate-fade-in-up min-w-[250px]`}>
       {icon}
       <span className="font-bold text-sm">{note.message}</span>
    </div>
  );
};
