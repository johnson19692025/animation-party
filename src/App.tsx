import { useState, useEffect, type FormEvent } from 'react';
import { Search, Film, Settings, Plus, Trash2, Tag, Loader2, Play, Edit3, ChevronRight, Instagram, Facebook, Mail } from 'lucide-react';
import type { Video } from './types';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Admin form state
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, [searchQuery]);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const url = searchQuery ? `/api/videos?q=${encodeURIComponent(searchQuery)}` : '/api/videos';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Failed to fetch videos', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVideo = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    setIsSubmitting(true);
    try {
      const keywords = newKeywords.split(',').map(k => k.trim()).filter(Boolean);
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, url: newUrl, keywords })
      });

      if (res.ok) {
        setNewTitle('');
        setNewUrl('');
        setNewKeywords('');
        fetchVideos();
      } else {
        const err = await res.json();
        alert(err.error || '新增影片失敗');
      }
    } catch (error) {
      console.error('Failed to add video', error);
      alert('新增影片失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('確定要刪除這部影片嗎？')) return;
    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchVideos();
      }
    } catch (error) {
      console.error('Failed to delete video', error);
    }
  };

  const handleUpdateKeywords = async (id: string, currentKeywords: string[]) => {
    const newKeywordsString = prompt('請輸入新的關鍵字 (以逗號分隔)', currentKeywords.join(', '));
    if (newKeywordsString === null) return;
    
    const keywords = newKeywordsString.split(',').map(k => k.trim()).filter(Boolean);
    
    try {
      const res = await fetch(`/api/videos/${id}/keywords`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords })
      });
      
      if (res.ok) {
        fetchVideos();
      } else {
        alert('更新關鍵字失敗');
      }
    } catch (error) {
      console.error('Failed to update keywords', error);
      alert('更新關鍵字失敗');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/30">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Film className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-white">Animation Party</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">最新消息</a>
              <a href="#" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">社團活動</a>
              <a href="#" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">推薦動畫作品</a>
              <a href="#" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">下載專區</a>
            </nav>
          </div>
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              isAdmin ? 'bg-white text-black shadow-md' : 'bg-transparent text-neutral-400 border border-white/20 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            {isAdmin ? '離開後台' : '管理後台'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdmin ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            <div className="pb-4 border-b border-white/10">
              <h2 className="text-3xl font-display font-bold tracking-tight mb-2 text-white">影片管理</h2>
              <p className="text-neutral-400 text-lg">新增並管理教學影片及其搜尋關鍵字。</p>
            </div>

            {/* Add Video Form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-3 text-white">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                新增教學影片
              </h3>
              <form onSubmit={handleAddVideo} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">影片標題</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="例如：走路循環基礎"
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all text-white placeholder:text-neutral-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">YouTube 網址</label>
                    <input
                      type="url"
                      required
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all text-white placeholder:text-neutral-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-neutral-500" />
                    關鍵字 (以逗號分隔)
                  </label>
                  <input
                    type="text"
                    value={newKeywords}
                    onChange={(e) => setNewKeywords(e.target.value)}
                    placeholder="例如：走路, 2D, 新手"
                    className="w-full px-4 py-3 bg-black border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all text-white placeholder:text-neutral-600"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-8 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    確認新增
                  </button>
                </div>
              </form>
            </div>

            {/* Admin Video List */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white/5 border-b border-white/10 text-neutral-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold">影片</th>
                      <th className="px-6 py-4 font-semibold">關鍵字</th>
                      <th className="px-6 py-4 font-semibold">新增日期</th>
                      <th className="px-6 py-4 font-semibold text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {videos.map((video) => (
                      <tr key={video.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-14 bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0 relative cursor-pointer">
                              <img 
                                src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} 
                                alt={video.title}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Play className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div className="font-bold text-white truncate max-w-[250px] text-base">
                              {video.title}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2 max-w-[300px]">
                            {video.keywords.map((k, i) => (
                              <span key={i} className="px-2.5 py-1 bg-white/10 text-neutral-300 rounded-md text-xs font-medium border border-white/5">
                                {k}
                              </span>
                            ))}
                            {video.keywords.length === 0 && <span className="text-neutral-500 italic">無</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-400">
                          {new Date(video.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateKeywords(video.id, video.keywords)}
                              className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors inline-flex"
                              title="修改關鍵字"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors inline-flex"
                              title="刪除影片"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {videos.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                          尚未新增任何影片。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* User Search View */}
            <div className="max-w-4xl mx-auto text-center space-y-8 pt-16 pb-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-neutral-300">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Explore Our Showcase
                </div>
                <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter text-white">
                  Tutorial <span className="text-neutral-500">動畫教學影片</span>
                </h2>
                <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-medium leading-relaxed">
                  探索我們精選的動畫教學影片。透過關鍵字搜尋找到您需要的靈感與內容。
                </p>
              </div>
              
              <div className="relative max-w-2xl mx-auto group mt-8">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-neutral-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜尋 '走路', '骨架', 'Blender'..."
                  className="block w-full pl-16 pr-6 py-5 bg-white/5 border border-white/20 rounded-full shadow-2xl text-lg focus:outline-none focus:ring-0 focus:border-white focus:bg-white/10 transition-all duration-300 placeholder:text-neutral-500 text-white backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Video Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {videos.map((video) => (
                  <a href={video.url} target="_blank" rel="noopener noreferrer" key={video.id} className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden hover:border-white/30 transition-all duration-500 flex flex-col group cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] block">
                    <div className="aspect-[4/3] w-full bg-neutral-900 relative overflow-hidden">
                      <img 
                        src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`} 
                        onError={(e) => {
                          // Fallback to hqdefault if maxresdefault is not available
                          e.currentTarget.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                        }}
                        alt={video.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-grow bg-gradient-to-b from-transparent to-black/50">
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <h3 className="text-2xl font-display font-bold text-white line-clamp-2 leading-tight group-hover:text-neutral-300 transition-colors">
                          {video.title}
                        </h3>
                        <ChevronRight className="w-6 h-6 text-neutral-500 group-hover:text-white transition-colors flex-shrink-0" />
                      </div>
                      <div className="mt-auto flex flex-wrap gap-2">
                        {video.keywords.map((k, i) => (
                          <span key={i} className="px-3.5 py-1.5 bg-white/10 text-neutral-300 rounded-full text-xs font-semibold tracking-wide border border-white/5 backdrop-blur-sm">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-4 border border-white/10 rounded-3xl bg-white/5 max-w-2xl mx-auto backdrop-blur-sm">
                <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Film className="w-10 h-10 text-neutral-400" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-3">找不到影片</h3>
                <p className="text-neutral-400 text-lg">
                  {searchQuery ? "找不到符合您搜尋條件的影片，請嘗試其他關鍵字。" : "目前尚無任何影片。"}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 bg-black py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            © Animation Party All Rights Reserved
          </p>
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/ltu_animation_party/" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.facebook.com/johnsonwu1969" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="mailto:colorbox2008@gmail.com" className="text-neutral-500 hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
