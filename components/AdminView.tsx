import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ShieldAlert, Database, Users, HardDrive, 
  Trash2, Search, Pencil, Filter, Activity, Cpu, 
  ArrowUpRight, Music2, MoreVertical, CheckCircle2,
  XCircle, Zap, ShieldCheck, Plus, UploadCloud
} from 'lucide-react';
import { Song } from '../types';

interface AdminViewProps {
  songs: Song[];
  onBack: () => void;
  onDeleteSong: (id: string) => void;
  onEditSong: (updatedSong: Song) => void;
  onSongSelect: (song: Song) => void;
  onAddNew: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ songs, onBack, onDeleteSong, onEditSong, onSongSelect, onAddNew }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const stats = [
    { label: 'DB SIZE', value: (songs.length * 12.4).toFixed(1) + 'MB', icon: Database, color: 'text-[#B6FF1A]' },
    { label: 'TRACKS', value: songs.length, icon: Music2, color: 'text-blue-400' },
    { label: 'SYSTEM LOAD', value: '4.2%', icon: Cpu, color: 'text-emerald-400' },
  ];

  const filteredSongs = useMemo(() => {
    return songs.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || s.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [songs, searchQuery, selectedGenre]);

  const genres = ['All', ...new Set(songs.map(s => s.genre))];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto pb-10 scrollbar-hide">
      {/* Admin Header */}
      <div className="sticky top-0 z-30 px-6 pt-12 pb-6 bg-black/95 backdrop-blur-2xl border-b border-white/[0.05] flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white hover:bg-zinc-800 transition active:scale-90 border border-white/5"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-0.5">
                <ShieldAlert size={14} className="text-red-500" />
                <h2 className="font-black text-[12px] uppercase tracking-[0.2em] text-white">System Admin</h2>
            </div>
            <p className="text-[9px] font-black text-red-500/60 uppercase tracking-widest">Master Command Center</p>
        </div>
        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
            <Zap size={18} fill="currentColor" />
        </div>
      </div>

      <div className="px-6 pt-8 space-y-8">
        {/* Deploy New Asset Button - Primary Call to Action */}
        <button 
          onClick={onAddNew}
          className="w-full bg-red-600 hover:bg-red-500 text-white rounded-[2.5rem] p-8 flex items-center justify-between transition-all active:scale-[0.98] shadow-[0_20px_40px_rgba(220,38,38,0.25)] group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 bg-black/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
              <UploadCloud size={28} strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-black tracking-tight uppercase leading-none mb-1">Deploy Asset</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Add new master track</p>
            </div>
          </div>
          <div className="relative z-10 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
             <Plus size={20} strokeWidth={3} />
          </div>
        </button>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-[#0A0A0A] border border-white/5 p-5 rounded-3xl flex flex-col items-center text-center shadow-2xl">
              <stat.icon size={18} className={`${stat.color} mb-3`} />
              <p className="text-lg font-black tracking-tight text-white">{stat.value}</p>
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="space-y-4">
            <div className="relative">
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search master database..."
                    className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold focus:ring-1 focus:ring-red-500/50 outline-none transition-all placeholder:text-zinc-800"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {genres.map(genre => (
                    <button 
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                            selectedGenre === genre 
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                            : 'bg-zinc-900 text-zinc-600 border border-white/5'
                        }`}
                    >
                        {genre}
                    </button>
                ))}
            </div>
        </div>

        {/* Global Content Manager */}
        <div>
            <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">Master Track List</h3>
                <span className="text-[9px] font-black text-zinc-800 uppercase">{filteredSongs.length} Entries</span>
            </div>
            
            <div className="space-y-3">
                {filteredSongs.map((song) => (
                    <div 
                        key={song.id} 
                        className={`bg-[#0c0c0c] border border-white/5 p-3.5 rounded-[1.8rem] flex items-center justify-between group transition-all duration-300 ${song.isFixed ? 'hover:border-[#B6FF1A]/30' : 'hover:border-red-500/30'}`}
                    >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="relative w-12 h-12 flex-shrink-0 cursor-pointer" onClick={() => onSongSelect(song)}>
                                <img src={song.coverUrl} className="w-full h-full object-cover rounded-xl" alt="" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                    <Activity size={16} className="text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-[14px] font-black text-white truncate leading-tight uppercase tracking-tight">{song.title}</h4>
                                  {song.isFixed && <ShieldCheck size={14} className="text-[#B6FF1A]" />}
                                </div>
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest truncate">{song.artist}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white transition-colors border border-white/5">
                                <Pencil size={14} />
                            </button>
                            {song.isFixed ? (
                                <div className="w-9 h-9 bg-[#B6FF1A]/10 rounded-xl flex items-center justify-center text-[#B6FF1A]/40 border border-[#B6FF1A]/10 cursor-help" title="Fixed content cannot be deleted">
                                  <ShieldCheck size={14} />
                                </div>
                            ) : (
                                <button 
                                    onClick={() => onDeleteSong(song.id)}
                                    className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all border border-red-500/10"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {filteredSongs.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-zinc-800">
                        <XCircle size={40} strokeWidth={1} className="mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No entries found</p>
                    </div>
                )}
            </div>
        </div>

        {/* Security Log Footer */}
        <div className="mt-10 p-6 bg-red-500/5 rounded-[2rem] border border-red-500/10">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Security Log</span>
            </div>
            <div className="space-y-2">
                <p className="text-[8px] font-black text-zinc-700 uppercase leading-relaxed">
                    [SYSTEM] PROTECTION_LEVEL: HIGH (Fixed Content Enabled)
                </p>
                <p className="text-[8px] font-black text-zinc-700 uppercase leading-relaxed">
                    [DATABASE] SYNC_INITIALIZED_OK_124ms
                </p>
                <p className="text-[8px] font-black text-zinc-700 uppercase leading-relaxed">
                    [IO] FIXED_ASSETS_IMMUTABLE: ridhamgupta805@gmail.com uploads protected
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;