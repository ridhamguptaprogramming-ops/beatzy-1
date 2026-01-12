
import React, { useState } from 'react';
import { Bell, ChevronRight, ArrowRight, LayoutGrid, Clock } from 'lucide-react';
import { CATEGORIES, MOCK_COLLECTIONS } from '../constants';
import { Song } from '../types';

interface HomeViewProps {
  songs: Song[];
  recentlyPlayed: Song[];
  onSongSelect: (song: Song) => void;
  activeSong: Song;
  userName: string;
  onNavigateNotifications?: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ songs, recentlyPlayed, onSongSelect, activeSong, userName, onNavigateNotifications }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredSongs = selectedCategory === 'All' 
    ? songs 
    : songs.filter(s => s.genre === selectedCategory);

  return (
    <div className="px-6 pt-10 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[17px] font-medium flex items-center gap-1.5 text-gray-400">
            Beatzy, <span className="text-white font-bold">{userName}</span> <span className="text-yellow-400">✨</span>
          </h1>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={onNavigateNotifications}
            className="p-3 bg-[#111] rounded-2xl text-white hover:bg-zinc-800 transition-all border border-white/5 relative group"
          >
            <Bell size={20} />
            {/* Notification Badge as requested in the screenshot circle */}
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#B6FF1A] rounded-full shadow-[0_0_8px_rgba(182,255,26,0.8)] border border-black group-hover:scale-110 transition-transform" />
          </button>
          <button className="p-3 bg-white rounded-2xl text-black hover:bg-gray-100 transition-all shadow-[0_8px_20px_rgba(255,255,255,0.1)]">
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-10">
        <h3 className="text-[19px] font-bold mb-4 tracking-tight">Select Categories</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#B6FF1A] text-black shadow-[0_0_20px_rgba(182,255,26,0.3)] scale-105'
                  : 'bg-[#121212] text-gray-500 hover:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <div className="mb-10 animate-in slide-in-from-right duration-700">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[19px] font-bold tracking-tight flex items-center gap-2">
              <Clock size={18} className="text-[#B6FF1A]" />
              Recently Played
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {recentlyPlayed.map((song) => (
              <div 
                key={`recent-${song.id}`} 
                className="flex-none w-[130px] cursor-pointer group"
                onClick={() => onSongSelect(song)}
              >
                <div className="relative aspect-square mb-2.5 overflow-hidden rounded-[2rem] shadow-lg">
                  <img 
                    src={song.coverUrl} 
                    alt={song.title} 
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-110 group-hover:brightness-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 bg-[#B6FF1A]/90 rounded-full flex items-center justify-center text-black">
                      <ArrowRight size={16} strokeWidth={3} />
                    </div>
                  </div>
                </div>
                <div className="pl-0.5">
                  <h4 className="font-bold text-[13px] truncate tracking-tight">{song.title}</h4>
                  <p className="text-[10px] text-gray-500 truncate font-medium">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Songs */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[19px] font-bold tracking-tight">Popular Songs</h3>
          <button className="text-gray-500 text-xs flex items-center gap-1 hover:text-white font-semibold">
            See all <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {filteredSongs.map((song, idx) => (
            <div 
              key={song.id} 
              className="flex-none w-[170px] cursor-pointer group"
              onClick={() => onSongSelect(song)}
            >
              {/* Card design matching screenshot with unique vinyl detail */}
              <div className="relative aspect-square mb-3.5 bg-zinc-900 rounded-[2.5rem] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="relative w-full h-full flex items-center">
                  <div className="relative z-10 w-[78%] h-full overflow-hidden">
                    <img 
                      src={song.coverUrl} 
                      alt={song.title} 
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  </div>
                  {/* Vinyl Record stuck out within the card frame */}
                  <div className="absolute right-[-20%] w-[60%] aspect-square bg-zinc-800 rounded-full border-2 border-black/30 flex items-center justify-center transform rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                    <div className="w-[30%] aspect-square rounded-full border border-white/5 bg-zinc-900 flex items-center justify-center">
                      <div className="w-[20%] aspect-square bg-zinc-700 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pl-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                   <div className={`w-[2.5px] h-3.5 rounded-full ${idx % 3 === 0 ? 'bg-[#B6FF1A]' : idx % 3 === 1 ? 'bg-orange-500' : 'bg-blue-400'}`}></div>
                   <h4 className="font-bold text-sm truncate tracking-tight">{song.title}</h4>
                </div>
                <p className="text-[11px] text-gray-500 truncate font-semibold pl-1">{song.artist}</p>
              </div>
            </div>
          ))}
          {filteredSongs.length === 0 && (
            <p className="text-zinc-600 text-sm italic py-10">No songs in this category yet.</p>
          )}
        </div>
      </div>

      {/* New Collection */}
      <div className="mb-10">
        <h3 className="text-[19px] font-bold mb-5 tracking-tight uppercase">New Collection</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {MOCK_COLLECTIONS.map((col, idx) => {
            // Split title for dynamic layout matching screenshot
            const words = col.title.split(' ');
            const mainText = words.slice(-1)[0]; // e.g., GLOBAL
            const subText = words.slice(0, -1).join(' '); // e.g., TOP SONGS

            return (
              <div key={col.id} className={`flex-none w-[310px] relative rounded-[2.8rem] overflow-hidden ${idx === 0 ? 'bg-white text-black' : 'bg-[#1E40AF] text-white'} p-8 h-[200px] flex flex-col justify-between group shadow-xl transition-all hover:scale-[1.02]`}>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">{subText}</p>
                  <h4 className="text-[34px] font-black leading-[0.85] uppercase tracking-tighter w-44">{mainText}</h4>
                  <p className={`text-[12px] font-bold mt-2.5 opacity-60`}>{col.subtitle}</p>
                </div>
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-2 shadow-sm ${idx === 0 ? 'bg-zinc-100 text-black' : 'bg-white/10 text-white'}`}>
                     <ArrowRight size={22} />
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-[55%] pointer-events-none">
                  <img 
                    src={col.imageUrl} 
                    alt={col.title}
                    className="w-full h-full object-cover rounded-l-[5rem] scale-110 translate-x-3 grayscale-[0.1]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
