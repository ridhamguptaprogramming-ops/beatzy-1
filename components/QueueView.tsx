
import React from 'react';
import { ChevronLeft, Trash2, ChevronUp, ChevronDown, Music2, GripVertical, CheckCircle2 } from 'lucide-react';
import { Song } from '../types';

interface QueueViewProps {
  queue: Song[];
  currentSongId: string;
  onBack: () => void;
  onSelect: (song: Song) => void;
  onRemove: (id: string) => void;
  onReorder: (index: number, direction: 'up' | 'down') => void;
}

const QueueView: React.FC<QueueViewProps> = ({ 
  queue, 
  currentSongId, 
  onBack, 
  onSelect, 
  onRemove, 
  onReorder 
}) => {
  const currentIndex = queue.findIndex(s => s.id === currentSongId);
  const upNext = queue.slice(currentIndex + 1);
  const played = queue.slice(0, currentIndex);
  const currentSong = queue[currentIndex];

  const renderSongRow = (song: Song, index: number, realIndex: number) => {
    const isPlaying = song.id === currentSongId;
    
    return (
      <div 
        key={song.id} 
        className={`flex items-center gap-4 p-3 rounded-[1.8rem] transition-all duration-300 ${
          isPlaying ? 'bg-[#B6FF1A]/10 border border-[#B6FF1A]/20 shadow-lg' : 'hover:bg-zinc-900/40 border border-transparent'
        }`}
      >
        <div className="relative w-14 h-14 flex-shrink-0 group cursor-pointer" onClick={() => onSelect(song)}>
          <img src={song.coverUrl} className="w-full h-full object-cover rounded-2xl" alt="" />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
              <div className="flex gap-0.5 items-end h-3">
                <div className="w-1 bg-[#B6FF1A] animate-[pulse_1s_infinite]" style={{ height: '60%' }} />
                <div className="w-1 bg-[#B6FF1A] animate-[pulse_1.2s_infinite]" style={{ height: '100%' }} />
                <div className="w-1 bg-[#B6FF1A] animate-[pulse_0.8s_infinite]" style={{ height: '40%' }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 cursor-pointer overflow-hidden" onClick={() => onSelect(song)}>
          <h4 className={`text-sm font-black truncate tracking-tight ${isPlaying ? 'text-[#B6FF1A]' : 'text-white'}`}>
            {song.title}
          </h4>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">{song.artist}</p>
        </div>

        <div className="flex items-center gap-1">
          {!isPlaying && (
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => onReorder(realIndex, 'up')}
                disabled={realIndex === 0}
                className="p-1.5 text-zinc-600 hover:text-white disabled:opacity-10 transition-colors"
              >
                <ChevronUp size={16} strokeWidth={3} />
              </button>
              <button 
                onClick={() => onReorder(realIndex, 'down')}
                disabled={realIndex === queue.length - 1}
                className="p-1.5 text-zinc-600 hover:text-white disabled:opacity-10 transition-colors"
              >
                <ChevronDown size={16} strokeWidth={3} />
              </button>
            </div>
          )}
          
          <button 
            onClick={() => onRemove(song.id)}
            disabled={isPlaying}
            className={`p-2.5 rounded-full transition-all ${
              isPlaying ? 'text-zinc-800 cursor-not-allowed' : 'text-zinc-600 hover:text-red-500 hover:bg-red-500/10'
            }`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 pt-12 pb-6 bg-black/80 backdrop-blur-xl border-b border-white/[0.05] flex items-center">
        <button onClick={onBack} className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-800 transition active:scale-90 border border-white/5">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 text-center mr-10">
          <h2 className="font-black text-[12px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Now Playing</h2>
          <p className="font-black text-[14px] uppercase tracking-tighter text-white">Playback Queue</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32 scrollbar-hide space-y-10">
        {/* Currently Playing Section */}
        {currentSong && (
          <div>
            <div className="flex items-center gap-2 mb-6 pl-1">
              <CheckCircle2 size={14} className="text-[#B6FF1A]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B6FF1A]">Currently Playing</h3>
            </div>
            {renderSongRow(currentSong, currentIndex, currentIndex)}
          </div>
        )}

        {/* Up Next Section */}
        <div>
          <div className="flex items-center justify-between mb-6 pl-1">
            <div className="flex items-center gap-2">
              <Music2 size={14} className="text-zinc-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Up Next</h3>
            </div>
            <span className="text-[9px] font-black text-zinc-700 uppercase">{upNext.length} Tracks Remaining</span>
          </div>
          
          <div className="space-y-4">
            {upNext.map((song, i) => renderSongRow(song, i, currentIndex + 1 + i))}
            {upNext.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-800 border-2 border-dashed border-zinc-900 rounded-[2.5rem]">
                <p className="text-[10px] font-black uppercase tracking-widest">End of the line</p>
                <p className="text-[9px] font-bold uppercase mt-1">No upcoming songs</p>
              </div>
            )}
          </div>
        </div>

        {/* Played History Section */}
        {played.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6 pl-1 opacity-40">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Previously Played</h3>
            </div>
            <div className="space-y-4 opacity-40 grayscale">
              {played.map((song, i) => renderSongRow(song, i, i))}
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="absolute bottom-10 left-0 right-0 px-8 pointer-events-none">
        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 py-4 px-6 rounded-3xl flex items-center justify-center gap-3">
          <GripVertical size={14} className="text-[#B6FF1A]" />
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 text-center">
            Tap arrows to reorder • Swipe to skip
          </p>
        </div>
      </div>
    </div>
  );
};

export default QueueView;
