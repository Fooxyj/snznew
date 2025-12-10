
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Common';
import { Home, Map } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6 text-center animate-in zoom-in duration-300">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-6">
        <Map className="w-16 h-16 text-blue-500 dark:text-blue-400" />
      </div>
      <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">Страница не найдена</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        Кажется, вы забрели в неизведанный район Снежинска. Такой страницы не существует или она была удалена.
      </p>
      <Link to="/">
        <Button size="lg" className="shadow-xl shadow-blue-200 dark:shadow-none">
          <Home className="w-5 h-5 mr-2" /> Вернуться на главную
        </Button>
      </Link>
    </div>
  );
};
