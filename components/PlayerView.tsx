import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ChevronDown, MoreHorizontal, Heart, Shuffle, SkipBack, SkipForward, 
  Repeat, Repeat1, Play, Pause, Download, CheckCircle2, X, ListPlus, Share2, 
  User, Clock, Info, ShieldAlert, Check, Music2, Languages, Plus, Trash2,
  ChevronRight, Pencil, Zap, Award, Crown, Settings2, CloudOff, ListMusic,
  Gauge
} from 'lucide-react';
import { Song, Playlist } from '../types';

type AudioQuality = 'Standard' | 'Hi-Fi' | 'Lossless';

interface PlayerViewProps {
  song: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  shuffleMode: 'off' | 'all' | 'one';
  repeatMode: 'off' | 'all' | 'one';
  playbackSpeed: number;
  onSetPlaybackSpeed: (speed: number) => void;
  playlists: Playlist[];
  analyser: AnalyserNode | null;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  onCycleShuffle: () => void;
  onCycleRepeat: () => void;
  onAddToPlaylist: (playlistId: string, songId: string) => void;
  onCreatePlaylist: (name: string, songId?: string) => Playlist;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onBack: () => void;
  onToggleDownload: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onEditLyrics?: () => void;
  onOpenQueue?: () => void;
}

class Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 2 + 1;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.1;
  }

  update(width: number, height: number, bass: number) {
    const boost = bass / 255;
    this.x += this.vx * (1 + boost * 5);
    this.y += this.vy * (1 + boost * 5);
    this.opacity = 0.2 + boost * 0.8;

    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(182, 255, 26, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const AudioVisualizer: React.FC<{ analyser: AnalyserNode | null; isPlaying: boolean }> = ({ analyser, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 80; i++) {
        particlesRef.current.push(new Particle(canvas.width, canvas.height));
      }
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = 145;

      ctx.clearRect(0, 0, width, height);

      const bass = dataArray[2] || 0;

      const barCountBg = 64;
      const barWidth = (width / barCountBg);
      for (let i = 0; i < barCountBg; i++) {
        const value = dataArray[Math.floor(i * (bufferLength / barCountBg) * 0.5)];
        const percent = value / 255;
        const h = percent * (height * 0.4);
        
        ctx.fillStyle = `rgba(182, 255, 26, ${0.03 + percent * 0.08})`;
        ctx.fillRect(i * barWidth, height - h, barWidth - 2, h);
        ctx.fillRect(i * barWidth, 0, barWidth - 2, h * 0.3);
      }

      particlesRef.current.forEach(p => {
        p.update(width, height, isPlaying ? bass : 0);
        p.draw(ctx);
      });

      const glowSize = baseRadius * (1.2 + (bass / 255) * 0.4);
      const gradient = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.8, centerX, centerY, glowSize);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, `rgba(182, 255, 26, ${(bass / 255) * 0.15})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
      ctx.fill();

      const barCountCircle = 120;
      const angleStep = (Math.PI * 2) / barCountCircle;

      for (let i = 0; i < barCountCircle; i++) {
        const dataIndex = Math.floor((i / barCountCircle) * (bufferLength / 2));
        const value = dataArray[dataIndex] || 0;
        const barHeight = (value / 255) * 80;
        const angle = i * angleStep - Math.PI / 2;
        
        const startX = centerX + Math.cos(angle) * baseRadius;
        const startY = centerY + Math.sin(angle) * baseRadius;
        const endX = centerX + Math.cos(angle) * (baseRadius + barHeight);
        const endY = centerY + Math.sin(angle) * (baseRadius + barHeight);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(182, 255, 26, ${0.3 + (value / 255) * 0.7})`;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (value > 200) {
          ctx.beginPath();
          ctx.arc(endX, endY, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
        }
      }
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [analyser, isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      width={window.innerWidth * 1.5} 
      height={window.innerHeight * 1.5} 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none z-0 mix-blend-screen"
    />
  );
};

const PlayerView: React.FC<PlayerViewProps> = ({ 
  song, 
  isPlaying, 
  currentTime,
  duration,
  shuffleMode,
  repeatMode,
  playbackSpeed,
  onSetPlaybackSpeed,
  playlists,
  analyser,
  isOfflineMode,
  onToggleOfflineMode,
  onCycleShuffle,
  onCycleRepeat,
  onAddToPlaylist,
  onCreatePlaylist,
  onSeek,
  onTogglePlay, 
  onBack, 
  onToggleDownload,
  onSkipNext,
  onSkipPrevious,
  onEditLyrics,
  onOpenQueue
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('Hi-Fi');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  
  const inlineLyricsRef = useRef<HTMLDivElement>(null);

  const showFeedback = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 2000);
  };

  const currentLyricIndex = useMemo(() => {
    if (!song.lyrics) return -1;
    let index = -1;
    for (let i = 0; i < song.lyrics.length; i++) {
      if (currentTime >= song.lyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [song.lyrics, currentTime]);

  useEffect(() => {
    if (isLyricsOpen && inlineLyricsRef.current && currentLyricIndex !== -1) {
      const activeLine = inlineLyricsRef.current.children[currentLyricIndex] as HTMLElement;
      if (activeLine) {
        const containerHeight = inlineLyricsRef.current.clientHeight;
        const lineOffset = activeLine.offsetTop;
        const lineHeight = activeLine.clientHeight;
        
        inlineLyricsRef.current.scrollTo({
          top: lineOffset - (containerHeight / 2) + (lineHeight / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [currentLyricIndex, isLyricsOpen]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSkipBackAction = () => {
    if (currentTime > 3) onSeek(0);
    else onSkipPrevious();
  };

  const handleProgressChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      onSeek(pct * duration);
    }
  };

  const toggleLike = () => {
    const newState = !isLiked;
    setIsLiked(newState);
    showFeedback(newState ? 'Added to Liked Songs' : 'Removed from Liked Songs');
  };

  const handleShare = async () => {
    setShowActionMenu(false);
    let shareUrl = window.location.href;
    const shareData: ShareData = {
      title: `VibeMusic: ${song.title}`,
      text: `Check out "${song.title}" by ${song.artist} on VibeMusic!`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showFeedback('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') showFeedback('Sharing failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${song.title} by ${song.artist} - Stream on VibeMusic`);
        showFeedback('Link copied to clipboard!');
      } catch (clipErr) {
        showFeedback('Sharing failed');
      }
    }
  };

  const handleAddTrackToPlaylist = (playlist: Playlist) => {
    onAddToPlaylist(playlist.id, song.id);
    setShowPlaylistSelector(false);
    showFeedback(`Added to ${playlist.name}`);
  };

  const handleCreateAndAdd = () => {
    if (!newPlaylistName.trim()) return;
    const p = onCreatePlaylist(newPlaylistName, song.id);
    setNewPlaylistName('');
    setShowPlaylistSelector(false);
    showFeedback(`Created ${p.name}`);
  };

  const handleQualitySelect = (q: AudioQuality) => {
    setAudioQuality(q);
    setShowQualitySelector(false);
    showFeedback(`Quality set to ${q}`);
  };

  const cycleSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    onSetPlaybackSpeed(speeds[nextIndex]);
    showFeedback(`Playback speed: ${speeds[nextIndex]}x`);
  };

  const handleCycleShuffle = () => {
    onCycleShuffle();
    const nextLabel = shuffleMode === 'off' ? 'All' : shuffleMode === 'all' ? 'One' : 'Off';
    showFeedback(`Shuffle Mode: ${nextLabel}`);
  };

  const handleCycleRepeat = () => {
    onCycleRepeat();
    const nextLabel = repeatMode === 'off' ? 'All' : repeatMode === 'all' ? 'One' : 'Off';
    showFeedback(`Repeat Mode: ${nextLabel}`);
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  const qualityOptions: { id: AudioQuality; label: string; icon: any; description: string }[] = [
    { id: 'Standard', label: 'Standard', icon: Zap, description: 'Balanced data usage (128kbps)' },
    { id: 'Hi-Fi', label: 'High Fidelity', icon: Award, description: 'CD quality audio (320kbps)' },
    { id: 'Lossless', label: 'Lossless', icon: Crown, description: 'Studio master quality (FLAC)' },
  ];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      {/* Dynamic Full Background Album Art */}
      <div className="absolute inset-0 z-0 transition-opacity duration-1000 overflow-hidden">
        <img 
          src={song.coverUrl} 
          alt="" 
          className={`w-full h-full object-cover scale-125 blur-xl transition-all duration-1000 ${isLyricsOpen ? 'opacity-30 brightness-50' : 'opacity-60 brightness-75'}`} 
        />
        {/* Scrim for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
      </div>

      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className="bg-[#B6FF1A] text-black px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl border border-black/10">
            <Check size={18} strokeWidth={3} />
            <span className="font-black text-[12px] uppercase tracking-wider">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full px-8 pt-12 pb-10">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10 shadow-lg">
            <ChevronDown size={22} />
          </button>
          <div className="text-center flex flex-col items-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-black mb-1 drop-shadow-sm">PLAYING FROM ALBUM</p>
            <h3 className="text-[14px] font-black text-white truncate max-w-[150px] drop-shadow-md tracking-tight uppercase">{song.album}</h3>
          </div>
          <button onClick={() => setShowActionMenu(true)} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10 shadow-lg">
            <MoreHorizontal size={22} />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center mb-8 relative overflow-hidden">
          <div className={`transition-all duration-700 ease-in-out absolute inset-0 flex items-center justify-center ${isLyricsOpen ? 'opacity-0 scale-75 blur-md pointer-events-none -translate-y-20' : 'opacity-100 scale-100 translate-y-0'}`}>
            <div className="relative w-full aspect-square max-w-[340px] flex items-center justify-center">
              {!isLyricsOpen && <AudioVisualizer analyser={analyser} isPlaying={isPlaying} />}
              <div className="relative w-full aspect-square bg-white/10 backdrop-blur-2xl rounded-[3rem] p-4 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden z-10 border border-white/10">
                <div className="relative w-full h-full flex items-center">
                  <div className="relative z-10 w-[80%] aspect-square rounded-[1.5rem] overflow-hidden shadow-2xl">
                    <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute right-[-15%] top-1/2 -translate-y-1/2 w-[65%] aspect-square bg-zinc-950 rounded-full border-4 border-black/40 flex items-center justify-center shadow-lg transform rotate-45 ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`}>
                    <div className="w-[30%] aspect-square rounded-full overflow-hidden border-2 border-zinc-800">
                      <img src={song.coverUrl} alt="" className="w-full h-full object-cover opacity-80" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/50 backdrop-blur-md text-[#B6FF1A] px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border border-[#B6FF1A]/20">VIBE MASTERED</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-700 ease-in-out absolute inset-0 flex flex-col pt-4 ${!isLyricsOpen ? 'opacity-0 scale-110 pointer-events-none translate-y-20' : 'opacity-100 scale-100 translate-y-0'}`}>
            <div ref={inlineLyricsRef} className="flex-1 overflow-y-auto scrollbar-hide px-4 flex flex-col gap-10 pb-48 pt-32">
              {song.lyrics && song.lyrics.length > 0 ? song.lyrics.map((line, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onSeek(line.time)} 
                  className={`transition-all duration-500 cursor-pointer text-left ${currentLyricIndex === idx ? 'text-white scale-105 origin-left' : 'text-white/20 scale-95 origin-left blur-[0.3px] hover:text-white/40'}`}
                >
                  <p className={`text-[28px] font-black leading-tight tracking-tighter ${currentLyricIndex === idx ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : ''}`}>
                    {line.text}
                  </p>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-white/20">
                  <Music2 size={48} strokeWidth={1} className="mb-4" />
                  <p className="font-black uppercase tracking-widest text-xs">No Lyrics Available</p>
                  {onEditLyrics && (
                    <button onClick={onEditLyrics} className="mt-6 flex items-center gap-2 text-[#B6FF1A] font-black uppercase text-[10px] tracking-widest hover:opacity-80 transition-opacity">
                      <Plus size={14} strokeWidth={3} /> Add Lyrics
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-[32px] font-black leading-[1.1] tracking-tighter text-white truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{song.title}</h2>
              {song.isDownloaded && <CheckCircle2 size={22} className="text-[#B6FF1A] flex-shrink-0" strokeWidth={3} />}
              <button onClick={() => setShowQualitySelector(true)} className="bg-[#B6FF1A]/10 backdrop-blur-md border border-[#B6FF1A]/20 px-2 py-0.5 rounded flex items-center gap-1.5 transition-all hover:bg-[#B6FF1A]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#B6FF1A] animate-pulse" />
                <span className="text-[9px] font-black text-[#B6FF1A] uppercase tracking-widest">{audioQuality === 'Lossless' ? 'Lossless' : audioQuality === 'Hi-Fi' ? 'Hi-Fi' : 'STD'}</span>
              </button>
            </div>
            <p className="text-white/80 font-bold text-sm truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tight">{song.artist}</p>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={onToggleDownload} className={`transition-all active:scale-90 ${song.isDownloaded ? 'text-[#B6FF1A]' : 'text-white/60 hover:text-white'}`}>
              {song.isDownloaded ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <Download size={24} strokeWidth={2.5} />}
            </button>
            <button onClick={toggleLike} className={`transition-all active:scale-90 ${isLiked ? 'text-white' : 'text-white/60 hover:text-white'}`}>
              <Heart size={24} strokeWidth={2.5} fill={isLiked ? "white" : "none"} />
            </button>
          </div>
        </div>

        <div className="mb-10">
          <div className="relative h-2 w-full bg-white/20 backdrop-blur-md rounded-full cursor-pointer group mb-3 shadow-inner" onClick={handleProgressChange}>
            <div className="absolute top-0 left-0 h-full bg-[#B6FF1A] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(182,255,26,0.6)]" style={{ width: `${progressPct}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#B6FF1A] rounded-full shadow-[0_0_15px_rgba(182,255,26,1)] border-2 border-black scale-100 group-hover:scale-125 transition-transform"></div>
            </div>
          </div>
          <div className="flex justify-between items-center text-[11px] font-black text-white/60 tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button onClick={cycleSpeed} className="transition-all relative flex items-center justify-center w-12 h-12 rounded-full text-white/40 hover:text-[#B6FF1A] active:scale-90">
            <Gauge size={24} strokeWidth={2} />
            <span className="absolute -bottom-1 text-[9px] font-black text-[#B6FF1A] tracking-tighter">{playbackSpeed}x</span>
          </button>
          <div className="flex items-center gap-8">
            <button onClick={handleSkipBackAction} className="text-white hover:opacity-80 transition-opacity active:scale-90"><SkipBack size={36} fill="white" strokeWidth={0} /></button>
            <button onClick={onTogglePlay} className="w-20 h-20 bg-[#B6FF1A] rounded-full flex items-center justify-center text-black shadow-[0_15px_40px_rgba(182,255,26,0.5)] active:scale-95 transition-transform">{isPlaying ? <Pause size={38} fill="black" /> : <Play size={38} fill="black" className="ml-1.5" />}</button>
            <button onClick={onSkipNext} className="text-white hover:opacity-80 transition-opacity active:scale-90"><SkipForward size={36} fill="white" strokeWidth={0} /></button>
          </div>
          <button onClick={handleCycleRepeat} className={`transition-all relative flex items-center justify-center w-12 h-12 rounded-full ${repeatMode !== 'off' ? 'text-[#B6FF1A] bg-[#B6FF1A]/10' : 'text-white/40 hover:text-white'}`}>
            {repeatMode === 'one' ? <Repeat1 size={24} strokeWidth={3} className="transition-all" /> : <Repeat size={24} strokeWidth={repeatMode === 'all' ? 3 : 2} className="transition-all" />}
            {repeatMode !== 'off' && <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#B6FF1A] rounded-full shadow-[0_0_10px_rgba(182,255,26,0.8)]"></div>}
          </button>
        </div>

        <div className="flex justify-center items-center gap-4 mt-4">
          <button onClick={handleCycleShuffle} className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 border relative backdrop-blur-md ${shuffleMode !== 'off' ? 'bg-[#B6FF1A]/10 text-[#B6FF1A] border-[#B6FF1A]/20' : 'bg-white/5 text-white/60 border-white/5 hover:text-white'}`}>
            <div className="relative">
               <Shuffle size={16} strokeWidth={shuffleMode !== 'off' ? 3 : 2} />
               {shuffleMode === 'one' && <span className="absolute -top-1.5 -right-1.5 bg-[#B6FF1A] text-black text-[7px] font-black w-3 h-3 flex items-center justify-center rounded-full border border-black animate-in zoom-in-50">1</span>}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{shuffleMode === 'one' ? 'Shuffle 1' : 'Shuffle'}</span>
          </button>
          <button onClick={() => setIsLyricsOpen(!isLyricsOpen)} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full transition-all duration-300 border backdrop-blur-md ${isLyricsOpen ? 'bg-white text-black border-white shadow-xl shadow-white/10' : 'bg-white/5 text-white/60 border-white/5 hover:text-white'}`}>
            <Languages size={18} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-widest">{isLyricsOpen ? 'Close' : 'Lyrics'}</span>
          </button>
          <button onClick={onOpenQueue} className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/5 text-white/60 border border-white/5 hover:text-white hover:bg-white/10 transition-all active:scale-95 backdrop-blur-md">
            <ListMusic size={18} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-widest">Queue</span>
          </button>
        </div>
      </div>

      {showQualitySelector && (
        <>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[110] animate-in fade-in duration-300" onClick={() => setShowQualitySelector(false)} />
          <div className="absolute bottom-0 left-0 right-0 z-[120] bg-[#0c0c0c] border-t border-white/10 rounded-t-[40px] px-8 pt-6 pb-12 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-8" />
            <h3 className="text-[12px] font-black uppercase tracking-widest text-[#B6FF1A] mb-8 text-center">Audio Quality</h3>
            <div className="space-y-3 mb-4">
              {qualityOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = audioQuality === opt.id;
                return (
                  <button key={opt.id} onClick={() => handleQualitySelect(opt.id)} className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all border ${isSelected ? 'bg-[#B6FF1A]/10 border-[#B6FF1A]/20 shadow-lg' : 'bg-zinc-900/50 border-white/5 hover:bg-zinc-900'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isSelected ? 'bg-[#B6FF1A] text-black border-[#B6FF1A]' : 'bg-zinc-800 text-zinc-500 border-white/5'}`}>
                        <Icon size={24} strokeWidth={2.5} />
                      </div>
                      <div className="text-left">
                        <h4 className={`font-black text-base ${isSelected ? 'text-white' : 'text-zinc-300'}`}>{opt.label}</h4>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{opt.description}</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={20} className="text-[#B6FF1A]" />}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowQualitySelector(false)} className="w-full py-4 text-zinc-500 font-black uppercase text-[11px] tracking-widest">Cancel</button>
          </div>
        </>
      )}

      {showActionMenu && (
        <>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[80] animate-in fade-in duration-300" onClick={() => setShowActionMenu(false)} />
          <div className="absolute bottom-0 left-0 right-0 z-[90] bg-[#0c0c0c] border-t border-white/10 rounded-t-[40px] px-8 pt-6 pb-12 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-8" />
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isOfflineMode ? 'bg-[#B6FF1A] text-black' : 'bg-zinc-900 text-zinc-600'}`}>
                        <CloudOff size={18} />
                    </div>
                    <span className="font-black text-[13px] uppercase tracking-widest">Offline Mode</span>
                </div>
                <button onClick={() => onToggleOfflineMode()} className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isOfflineMode ? 'bg-[#B6FF1A]' : 'bg-zinc-800'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 bg-white ${isOfflineMode ? 'left-7' : 'left-1'}`} />
                </button>
            </div>
            <div className="flex items-center gap-5 mb-10 pb-6 border-b border-white/5">
              <img src={song.coverUrl} className="w-16 h-16 rounded-2xl object-cover shadow-2xl" alt="" />
              <div>
                <h4 className="font-black text-xl text-white mb-1 truncate max-w-[240px] tracking-tight">{song.title}</h4>
                <p className="text-[#B6FF1A] text-xs font-black uppercase tracking-widest">{song.artist}</p>
              </div>
            </div>
            <div className="space-y-1">
              {[
                { label: 'Audio Quality', icon: Settings2, action: () => { setShowActionMenu(false); setShowQualitySelector(true); } },
                { label: 'Add to Playlist', icon: ListPlus, action: () => { setShowActionMenu(false); setShowPlaylistSelector(true); } },
                { label: 'Edit Lyrics', icon: Pencil, action: () => { setShowActionMenu(false); if(onEditLyrics) onEditLyrics(); } },
                { label: 'Share Track', icon: Share2, action: handleShare },
                { label: 'View Artist', icon: User, action: () => showFeedback('Coming Soon') },
                { label: 'Sleep Timer', icon: Clock, action: () => showFeedback('Timer Set') },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button key={idx} onClick={() => item.action()} className="w-full flex items-center justify-between py-4 group hover:bg-white/5 px-2 rounded-2xl transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 bg-[#111] rounded-full flex items-center justify-center text-zinc-500 group-hover:text-[#B6FF1A] group-hover:bg-[#B6FF1A]/10 transition-all border border-white/5"><Icon size={18} strokeWidth={2.5} /></div>
                      <span className="font-bold text-[15px] text-zinc-300 group-hover:text-white transition-colors tracking-tight">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-zinc-800" />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {showPlaylistSelector && (
        <>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[110] animate-in fade-in duration-300" onClick={() => setShowPlaylistSelector(false)} />
          <div className="absolute bottom-0 left-0 right-0 z-[120] bg-[#0c0c0c] border-t border-white/10 rounded-t-[40px] px-8 pt-6 pb-12 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300 max-h-[80vh] flex flex-col">
            <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-8" />
            <h3 className="text-[12px] font-black uppercase tracking-widest text-[#B6FF1A] mb-8 text-center">Select Playlist</h3>
            <div className="flex-1 overflow-y-auto space-y-2 mb-8 pr-2 scrollbar-hide">
              {playlists.map((p) => (
                <button key={p.id} onClick={() => handleAddTrackToPlaylist(p)} className="w-full flex items-center justify-between py-4 group hover:bg-white/5 px-4 rounded-2xl transition-all active:scale-98 border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-600 group-hover:text-[#B6FF1A] transition-all"><Music2 size={24} /></div>
                    <div className="text-left">
                      <h4 className="font-black text-base text-white">{p.name}</h4>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{p.songIds.length} Tracks</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-800 group-hover:text-zinc-500" />
                </button>
              ))}
            </div>
            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center gap-4">
                <input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="New Playlist Name" className="flex-1 bg-[#111] border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-1 focus:ring-[#B6FF1A] outline-none transition-all placeholder:text-zinc-700" />
                <button onClick={handleCreateAndAdd} disabled={!newPlaylistName.trim()} className="w-14 h-14 bg-[#B6FF1A] text-black rounded-2xl flex items-center justify-center shadow-lg shadow-[#B6FF1A]/10 active:scale-90 disabled:opacity-20 transition-all">
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlayerView;