
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { NewsItem, Comment } from '../types';
import { Button } from '../components/ui/Common';
import { ChevronLeft, Calendar, Eye, MessageCircle, Send, Loader2, Share2 } from 'lucide-react';

export const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
          const n = await api.getNewsById(id);
          setNews(n);
          if (n) {
              // Wrap in try-catch to avoid breaking page if comments fail (e.g. invalid DB query)
              try {
                  const c = await api.getComments(id);
                  setComments(c);
              } catch(e) {
                  console.error("Failed to load comments", e);
              }
          }
      } catch (e) {
          console.error("Failed to load news detail", e);
      } finally {
          setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    
    setSubmitting(true);
    try {
        await api.addComment(id, newComment);
        const updated = await api.getComments(id);
        setComments(updated);
        setNewComment('');
    } catch (e: any) {
        alert(e.message);
    } finally {
        setSubmitting(false);
    }
  };

  const handleShare = () => {
      if (navigator.share && news) {
          navigator.share({
              title: news.title,
              text: news.content.substring(0, 100) + '...',
              url: window.location.href
          }).catch(console.error);
      } else {
          alert("Ссылка скопирована!");
          navigator.clipboard.writeText(window.location.href);
      }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (!news) return <div className="p-10 text-center">Новость не найдена</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> На главную
        </Link>
        <button onClick={handleShare} className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 p-2 rounded-full transition-colors">
            <Share2 className="w-5 h-5" />
        </button>
      </div>

      <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden mb-8">
        <img src={news.image} alt={news.title} className="w-full h-64 lg:h-96 object-cover" />
        <div className="p-6 lg:p-10">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
             <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-md font-medium">{news.category}</span>
             <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {news.date}</span>
             <span className="flex items-center"><Eye className="w-4 h-4 mr-1" /> {news.views}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">{news.title}</h1>
          <div className="prose prose-blue dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {news.content}
          </div>
        </div>
      </article>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6 lg:p-8">
         <h3 className="text-xl font-bold mb-6 flex items-center dark:text-white">
            <MessageCircle className="w-5 h-5 mr-2" /> Комментарии ({comments.length})
         </h3>

         <form onSubmit={handleComment} className="mb-8 flex gap-3">
             <input 
                type="text" 
                className="flex-1 border dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
                placeholder="Написать комментарий..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
             />
             <Button disabled={submitting}>
                <Send className="w-4 h-4" />
             </Button>
         </form>

         <div className="space-y-6">
            {comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                    {comment.authorAvatar ? (
                        <img src={comment.authorAvatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 shrink-0">
                            {comment.authorName ? comment.authorName[0].toUpperCase() : '?'}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 dark:text-white">{comment.authorName}</span>
                            <span className="text-xs text-gray-400">{comment.date}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text}</p>
                    </div>
                </div>
            ))}
            {comments.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm">Пока нет комментариев.</p>}
         </div>
      </div>
    </div>
  );
};
