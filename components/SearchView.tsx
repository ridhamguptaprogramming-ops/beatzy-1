
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, X, RotateCcw, Clock, Trash2, Sparkles, Loader2, Globe } from 'lucide-react';
import { Song } from '../types';
import { CATEGORIES, YEARS } from '../constants';
import { loadSearchHistory, saveSearchHistory } from '../storage';
import { searchGlobalSongs } from '../geminiService';

interface SearchViewProps {
  songs: Song[];
  onSongSelect: (song: Song) => void;
  onAddGlobalSong?: (song: Partial<Song>) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ songs, onSongSelect, onAddGlobalSong }) => {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [globalResults, setGlobalResults] = useState<Partial<Song>[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  useEffect(() => {
    const init = async () => {
      const history = await loadSearchHistory();
      setSearchHistory(history);
    };
    init();
  }, []);

  useEffect(() => {
    saveSearchHistory(searchHistory);
  }, [searchHistory]);

  const localResults = useMemo(() => {
    return songs.filter(song => {
      const q = query.toLowerCase().trim();
      const matchesQuery = !q || 
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        song.genre.toLowerCase().includes(q);
      const matchesGenre = selectedGenre === 'All' || song.genre === selectedGenre;
      const matchesYear = selectedYear === 'All' || song.releaseYear.toString() === selectedYear;
      return matchesQuery && matchesGenre && matchesYear;
    });
  }, [songs, query, selectedGenre, selectedYear]);

  const handleGlobalSearch = async () => {
    if (!query.trim()) return;
    setIsSearchingGlobal(true);
    const results = await searchGlobalSongs(query);
    setGlobalResults(results);
    setIsSearchingGlobal(false);
  };

  const handleSongClick = (song: any) => {
    if (query.trim()) {
      const newHistory = [query.trim(), ...searchHistory.filter(h => h.toLowerCase() !== query.trim().toLowerCase())].slice(0, 5);
      setSearchHistory(newHistory);
    }
    
    // If it's a global result, we might need to "instantiate" it locally first
    if (!song.id) {
      const fullSong: Song = {
        id: `global-${Date.now()}`,
        title: song.title || 'Unknown',
        artist: song.artist || 'Unknown',
        album: song.album || 'Cloud Search',
        coverUrl: song.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Simulated stream
        duration: '--:--',
        genre: song.genre || 'Various',
        releaseYear: song.releaseYear || new Date().getFullYear(),
      };
      if (onAddGlobalSong) onAddGlobalSong(fullSong);
      onSongSelect(fullSong);
    } else {
      onSongSelect(song);
    }
  };

  return (
    <div className="px-6 pt-12 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black tracking-tighter">SEARCH</h2>
        <button onClick={() => { setQuery(''); setSelectedGenre('All'); setSelectedYear('All'); setGlobalResults([]); }} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#B6FF1A] bg-[#B6FF1A]/10 px-3 py-1.5 rounded-full border border-[#B6FF1A]/20">
          <RotateCcw size={12} strokeWidth={3} /> Reset
        </button>
      </div>

      <div className="relative mb-6">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
          placeholder="Song, artist or genre..." 
          className="w-full bg-[#121212] border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium focus:ring-2 focus:ring-[#B6FF1A] outline-none transition-all placeholder:text-gray-600"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        {query && (
          <button onClick={handleGlobalSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B6FF1A] hover:opacity-80 transition-opacity">
            {isSearchingGlobal ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          </button>
        )}
      </div>

      {!query && searchHistory.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
             <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              <Clock size={12} /> <span>Recent</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((item, idx) => (
              <div key={idx} onClick={() => setQuery(item)} className="bg-[#121212] border border-white/5 rounded-full py-1.5 px-4 text-xs font-bold text-gray-400 cursor-pointer hover:text-white transition-colors">
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {globalResults.length > 0 && (
        <div className="mb-10 animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-2 mb-6 px-1">
            <Globe size={16} className="text-[#B6FF1A]" />
            <h3 className="text-[12px] font-black uppercase tracking-widest text-[#B6FF1A]">Cloud Results</h3>
          </div>
          <div className="grid grid-cols-2 gap-5 mb-8">
            {globalResults.map((song, idx) => (
              <div key={idx} onClick={() => handleSongClick(song)} className="relative flex flex-col group active:scale-95 transition-transform">
                <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-3 shadow-xl border border-[#B6FF1A]/10">
                  <img src={song.coverUrl} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles size={24} className="text-[#B6FF1A]" />
                  </div>
                </div>
                <h4 className="font-bold text-sm truncate">{song.title}</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase">{song.artist}</p>
              </div>
            ))}
          </div>
          <div className="h-px bg-white/5 mb-8" />
        </div>
      )}

      <div className="flex items-center justify-between mb-6 px-1">
        <h3 className="text-lg font-bold">Local Library</h3>
        <span className="text-xs font-bold text-gray-500">{localResults.length} tracks</span>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {localResults.map((song) => (
          <div key={song.id} onClick={() => handleSongClick(song)} className="relative flex flex-col cursor-pointer group animate-in zoom-in-95 duration-300">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-xl mb-3">
              <img src={song.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
              <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-full text-[9px] font-black text-[#B6FF1A]">
                {song.releaseYear}
              </div>
            </div>
            <h4 className="font-bold text-sm truncate">{song.title}</h4>
            <p className="text-[11px] text-gray-500 font-semibold truncate">{song.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchView;
