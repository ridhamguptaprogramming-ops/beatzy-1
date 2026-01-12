
import React, { useState, useEffect } from 'react';
import { Plus, Download, CheckCircle2, CloudOff, Check, X, HardDriveDownload, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import { Song } from '../types';

interface LibraryViewProps {
  songs: Song[];
  onSongSelect: (song: Song) => void;
  onToggleDownload: (id: string) => void;
  onDeleteSong: (id: string) => void;
  onAddNew: () => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  onDownloadAll: () => void;
  isAllDownloaded: boolean;
}

const LibraryView: React.FC<LibraryViewProps> = ({ 
    songs, 
    onSongSelect, 
    onToggleDownload, 
    onDeleteSong,
    onAddNew,
    isOfflineMode,
    onToggleOfflineMode,
    onDownloadAll,
    isAllDownloaded
}) => {
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'add' | 'remove' }>({
    message: '',
    visible: false,
    type: 'add'
  });

  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const triggerToast = (message: string, type: 'add' | 'remove') => {
    setToast({ message, visible: true, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2500);
  };

  const handleDownloadAllClick = () => {
    if (isAllDownloaded || isDownloadingAll) return;
    
    setIsDownloadingAll(true);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onDownloadAll();
          setIsDownloadingAll(false);
          triggerToast("Entire library available offline", 'add');
          return 100;
        }
        const increment = Math.floor(Math.random() * 8) + 2;
        return Math.min(100, prev + increment);
      });
    }, 150);
  };

  const filteredSongs = isOfflineMode 
    ? songs.filter(s => s.isDownloaded)
    : songs;

  return (
    <div className="px-6 pt-16 animate-in fade-in duration-500 pb-32 relative">
      {toast.visible && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-500 fade-in w-[85%] max-w-[350px]">
          <div className="bg-[#B6FF1A] text-black px-5 py-3.5 rounded-full flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(182,255,26,0.3)] border border-black/5">
            {toast.type === 'add' ? <Check size={16} strokeWidth={4} /> : <X size={16} strokeWidth={4} />}
            <span className="font-black text-[11px] uppercase tracking-wider text-center line-clamp-1">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <h2 className="text-4xl font-black tracking-tighter">LIBRARY</h2>
        <button 
          onClick={onAddNew}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold text-sm shadow-xl shadow-white/5 active:scale-95 transition-all"
        >
          <Plus size={18} />
          New
        </button>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-[2rem] border border-white/5">
            <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isOfflineMode ? 'bg-[#B6FF1A] text-black' : 'bg-zinc-800 text-gray-500'}`}>
                <CloudOff size={18} />
            </div>
            <div>
                <p className="text-[13px] font-bold">Offline Mode</p>
                <p className="text-[11px] text-gray-500">Only show downloaded</p>
            </div>
            </div>
            <button 
            onClick={onToggleOfflineMode}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isOfflineMode ? 'bg-[#B6FF1A]' : 'bg-zinc-800'}`}
            >
            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 bg-white ${isOfflineMode ? 'left-7' : 'left-1'}`} />
            </button>
        </div>

        <div className="flex flex-col bg-zinc-900/30 p-4 rounded-[2rem] border border-white/5 border-dashed">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isAllDownloaded ? 'bg-[#B6FF1A]/20 text-[#B6FF1A]' : 'bg-zinc-800 text-gray-500'}`}>
                    {isDownloadingAll ? <Loader2 size={18} className="animate-spin text-[#B6FF1A]" /> : <HardDriveDownload size={18} />}
                </div>
                <div>
                    <p className="text-[13px] font-bold">Download Library</p>
                    <p className="text-[11px] text-gray-500">{isAllDownloaded ? 'Synchronized' : 'Sync all songs offline'}</p>
                </div>
                </div>
                <button 
                    onClick={handleDownloadAllClick}
                    disabled={isAllDownloaded || isDownloadingAll}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isAllDownloaded || isDownloadingAll ? 'bg-[#B6FF1A]' : 'bg-zinc-800'} disabled:opacity-50`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 bg-white ${isAllDownloaded || isDownloadingAll ? 'left-7' : 'left-1'}`} />
                </button>
            </div>

            {isDownloadingAll && (
              <div className="mt-4 px-1 animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-black uppercase text-[#B6FF1A] tracking-widest animate-pulse">Synchronizing Tracks...</span>
                  <span className="text-[9px] font-black text-[#B6FF1A] tabular-nums">{downloadProgress}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#B6FF1A] shadow-[0_0_10px_rgba(182,255,26,0.5)] transition-all duration-300 ease-out" 
                    style={{ width: `${downloadProgress}%` }} 
                  />
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredSongs.map((song) => (
          <div 
            key={song.id} 
            className="flex items-center gap-4 group p-2 rounded-2xl transition-all hover:bg-zinc-900/30"
          >
            <div className="relative cursor-pointer" onClick={() => onSongSelect(song)}>
              <img src={song.coverUrl} className="w-16 h-16 rounded-2xl object-cover" alt={song.title} />
              {song.isDownloaded && (
                <div className="absolute -top-1 -right-1 bg-[#B6FF1A] text-black rounded-full p-0.5 border-2 border-black shadow-lg">
                  <CheckCircle2 size={10} strokeWidth={3} />
                </div>
              )}
            </div>
            
            <div className="flex-1 cursor-pointer" onClick={() => onSongSelect(song)}>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-[15px] line-clamp-1">{song.title}</h4>
                {song.isFixed && <ShieldCheck size={14} className="text-[#B6FF1A]" />}
              </div>
              <p className="text-xs text-gray-500 font-medium line-clamp-1">{song.artist}</p>
            </div>

            <div className="flex items-center gap-2">
              {!song.isFixed && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSong(song.id);
                    triggerToast(`Deleted "${song.title}"`, 'remove');
                  }}
                  className="p-2.5 rounded-full text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              )}
              {song.isFixed && (
                <div className="p-2.5 rounded-full text-zinc-800 opacity-20 cursor-help" title="System protected content">
                  <ShieldCheck size={18} />
                </div>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const wasDownloaded = !!song.isDownloaded;
                  onToggleDownload(song.id);
                  triggerToast(wasDownloaded ? `Removed "${song.title}" from offline` : `Added "${song.title}" to offline`, wasDownloaded ? 'remove' : 'add');
                }}
                className={`p-2.5 rounded-full transition-all active:scale-90 ${
                  song.isDownloaded 
                    ? 'text-[#B6FF1A] bg-[#B6FF1A]/10' 
                    : 'text-zinc-600 hover:text-white bg-zinc-900/50'
                }`}
              >
                {song.isDownloaded ? <CheckCircle2 size={18} /> : <Download size={18} />}
              </button>
            </div>
          </div>
        ))}

        {filteredSongs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-600">
            <CloudOff size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-bold">No tracks found</p>
            <p className="text-[11px] max-w-[200px] mt-1">Upload some music or disable Offline Mode to see your library.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryView;
