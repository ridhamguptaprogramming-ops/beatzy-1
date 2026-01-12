
import React, { useState, useEffect, useRef } from 'react';
import HomeView from './components/HomeView';
import PlayerView from './components/PlayerView';
import BottomNav from './components/BottomNav';
import SearchView from './components/SearchView';
import LibraryView from './components/LibraryView';
import ProfileView from './components/ProfileView';
import SubscriptionView from './components/SubscriptionView';
import AddDetailsView from './components/AddDetailsView';
import InsightsView from './components/InsightsView';
import AnalyticsView from './components/AnalyticsView';
import CommunicationView from './components/CommunicationView';
import LyricsEditorView from './components/LyricsEditorView';
import QueueView from './components/QueueView';
import AdminView from './components/AdminView';
import { ViewState, Song, UserProfile, Playlist } from './types';
import { MOCK_SONGS } from './constants';
import { 
  loadSongs, 
  saveSongs, 
  loadActiveProfile, 
  saveProfile, 
  isAppInitialized, 
  loadRecentlyPlayed, 
  saveRecentlyPlayed, 
  loadPlaylists, 
  savePlaylists,
  clearActiveSession
} from './storage';
import { resolveTrackFromLink } from './geminiService';
import { Play, Pause, SkipForward, CloudOff, Loader2, Sparkles } from 'lucide-react';

type Mode3 = 'off' | 'all' | 'one';

const ADMIN_EMAIL = 'ridhamgupta805@gmail.com';
const GUEST_EMAIL = 'guest@vibemusic.app';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isResolvingLink, setIsResolvingLink] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [shuffleMode, setShuffleMode] = useState<Mode3>('off');
  const [repeatMode, setRepeatMode] = useState<Mode3>('off');

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Guest User',
    email: GUEST_EMAIL,
    profileImage: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop',
    isLoggedIn: false
  });

  const stateRef = useRef({ songs, playlists, userProfile, recentlyPlayedIds, downloadedIds, isLoaded });
  useEffect(() => { 
    stateRef.current = { songs, playlists, userProfile, recentlyPlayedIds, downloadedIds, isLoaded };
  }, [songs, playlists, userProfile, recentlyPlayedIds, downloadedIds, isLoaded]);

  // Boot Sequence
  useEffect(() => {
    const boot = async () => {
      try {
        const storedProfile = await loadActiveProfile();
        let emailToLoad = GUEST_EMAIL;
        
        if (storedProfile) {
          setUserProfile(storedProfile);
          emailToLoad = storedProfile.email;
        } else {
          await saveProfile(userProfile);
        }

        const storedSongs = await loadSongs(emailToLoad);
        const storedRecents = await loadRecentlyPlayed(emailToLoad);
        const storedPlaylists = await loadPlaylists(emailToLoad);
        const hasInitBefore = await isAppInitialized();
        
        let finalSongs = [...storedSongs];

        if (storedSongs.length === 0 && !hasInitBefore) {
          finalSongs = [...MOCK_SONGS];
          await saveSongs(MOCK_SONGS, emailToLoad);
        }

        // Always merge global defaults
        const fixedSongs = MOCK_SONGS.filter(s => s.isFixed);
        fixedSongs.forEach(fs => {
          if (!finalSongs.find(s => s.id === fs.id)) finalSongs.push(fs);
        });

        // Handle Linked Songs (Sharing Backend Simulation)
        const params = new URLSearchParams(window.location.search);
        const linkedSongId = params.get('songId');
        let linkedSong = finalSongs.find(s => s.id === linkedSongId);

        if (linkedSongId && !linkedSong) {
          // If song not found locally, use the Gemini "Backend" to resolve it
          setIsResolvingLink(true);
          const resolved = await resolveTrackFromLink(linkedSongId);
          if (resolved) {
            const newSong: Song = {
              id: linkedSongId,
              title: resolved.title || 'Resolved Track',
              artist: resolved.artist || 'Unknown Artist',
              album: resolved.album || 'Cloud Sync',
              coverUrl: resolved.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17',
              audioUrl: resolved.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              duration: '--:--',
              genre: resolved.genre || 'Cloud',
              releaseYear: resolved.releaseYear || new Date().getFullYear(),
            };
            finalSongs = [newSong, ...finalSongs];
            linkedSong = newSong;
            await saveSongs(finalSongs, emailToLoad);
          }
          setIsResolvingLink(false);
        }

        setSongs(finalSongs);
        setRecentlyPlayedIds(storedRecents);
        setPlaylists(storedPlaylists);
        setDownloadedIds(new Set(finalSongs.filter(s => s.isDownloaded).map(s => s.id)));
        
        if (linkedSong) {
          setCurrentSong(linkedSong);
          setQueue(finalSongs);
          setCurrentView('player');
          setIsPlaying(true);
        } else if (finalSongs.length > 0) {
          setCurrentSong(finalSongs[0]);
          setQueue(finalSongs);
        }
      } catch (err) {
        console.error("Boot error:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    boot();
  }, []);

  const handleProfileUpdate = async (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    await saveProfile(newProfile);
    const userSongs = await loadSongs(newProfile.email);
    const userRecents = await loadRecentlyPlayed(newProfile.email);
    const userPlaylists = await loadPlaylists(newProfile.email);
    const fixedSongs = MOCK_SONGS.filter(s => s.isFixed);
    const combined = [...userSongs];
    fixedSongs.forEach(fs => { if (!combined.find(s => s.id === fs.id)) combined.push(fs); });
    setSongs(combined);
    setRecentlyPlayedIds(userRecents);
    setPlaylists(userPlaylists);
    setDownloadedIds(new Set(combined.filter(s => s.isDownloaded).map(s => s.id)));
  };

  // Fix: Added missing handleLogout function to clear active session and reset state to guest defaults
  const handleLogout = async () => {
    await clearActiveSession();
    const guestProfile: UserProfile = {
      name: 'Guest User',
      email: GUEST_EMAIL,
      profileImage: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop',
      isLoggedIn: false
    };
    setUserProfile(guestProfile);
    
    const guestSongs = await loadSongs(GUEST_EMAIL);
    const guestRecents = await loadRecentlyPlayed(GUEST_EMAIL);
    const guestPlaylists = await loadPlaylists(GUEST_EMAIL);
    
    let finalSongs = [...guestSongs];
    const fixedSongs = MOCK_SONGS.filter(s => s.isFixed);
    fixedSongs.forEach(fs => {
      if (!finalSongs.find(s => s.id === fs.id)) finalSongs.push(fs);
    });

    setSongs(finalSongs);
    setRecentlyPlayedIds(guestRecents);
    setPlaylists(guestPlaylists);
    setDownloadedIds(new Set(finalSongs.filter(s => s.isDownloaded).map(s => s.id)));
    
    setIsPlaying(false);
    setCurrentSong(finalSongs[0] || null);
    setCurrentView('home');
  };

  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(async () => {
      const { songs, playlists, userProfile, recentlyPlayedIds, downloadedIds } = stateRef.current;
      const email = userProfile.email;
      const songsWithStatus = songs.map(s => ({ ...s, isDownloaded: downloadedIds.has(s.id) }));
      await saveSongs(songsWithStatus, email);
      await savePlaylists(playlists, email);
      await saveProfile(userProfile);
      await saveRecentlyPlayed(recentlyPlayedIds, email);
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoaded]);

  const setupAudioContext = () => {
    if (!audioRef.current || audioContextRef.current) return;
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      if (!sourceNodeRef.current) sourceNodeRef.current = context.createMediaElementSource(audioRef.current);
      sourceNodeRef.current.connect(analyser);
      analyser.connect(context.destination);
      audioContextRef.current = context;
      analyserRef.current = analyser;
    } catch (e) {}
  };

  useEffect(() => {
    if (audioRef.current && isLoaded) {
      if (isPlaying) {
        if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
        else if (!audioContextRef.current) setupAudioContext();
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong?.id, isLoaded]);

  const handleTogglePlay = () => {
    if (!audioContextRef.current) setupAudioContext();
    setIsPlaying(!isPlaying);
  };

  const handleSongSelect = (song: Song) => {
    const newRecents = [song.id, ...recentlyPlayedIds.filter(id => id !== song.id)].slice(0, 10);
    setRecentlyPlayedIds(newRecents);
    setCurrentSong(song);
    const available = isOfflineMode ? songs.filter(s => downloadedIds.has(s.id)) : songs;
    setQueue(available);
    setCurrentView('player');
    setIsPlaying(true);
    saveRecentlyPlayed(newRecents, userProfile.email);
    const url = new URL(window.location.href);
    url.searchParams.set('songId', song.id);
    window.history.replaceState({}, '', url.toString());
  };

  const handleSkipNext = () => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    let nextIndex = (currentIndex + 1) % queue.length;
    if (shuffleMode === 'all') nextIndex = Math.floor(Math.random() * queue.length);
    setCurrentSong(queue[nextIndex]);
    setIsPlaying(true);
  };

  const handleSkipPrevious = () => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentSong(queue[prevIndex]);
    setIsPlaying(true);
  };

  const handleAddSong = async (newSong: Song) => {
    if (userProfile.email === ADMIN_EMAIL) newSong.isFixed = true;
    const updated = [newSong, ...songs];
    setSongs(updated);
    setCurrentSong(newSong);
    setQueue(updated);
    setIsPlaying(true);
    setCurrentView('home');
    await saveSongs(updated, userProfile.email);
  };

  const handleDeleteSong = async (songId: string) => {
    const targetSong = songs.find(s => s.id === songId);
    if (targetSong?.isFixed) return;
    const updated = songs.filter(s => s.id !== songId);
    setSongs(updated);
    setQueue(updated);
    if (currentSong?.id === songId) {
      setIsPlaying(false);
      setCurrentSong(updated[0] || null);
    }
    await saveSongs(updated, userProfile.email);
  };

  if (!isLoaded || isResolvingLink) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 flex items-center justify-center">
           <div className="absolute inset-0 border-4 border-[#B6FF1A]/20 rounded-full"></div>
           <div className="absolute inset-0 border-4 border-[#B6FF1A] border-t-transparent rounded-full animate-spin"></div>
           <Sparkles className="text-[#B6FF1A] animate-pulse" size={32} />
        </div>
        <p className="mt-8 text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
          {isResolvingLink ? 'Resolving Global Track...' : 'Restoring VibeCloud...'}
        </p>
      </div>
    );
  }

  const activeSongWithStatus = (currentSong && songs.find(s => s.id === currentSong.id)) || currentSong || null;
  const isFullscreenView = ['player', 'subscription', 'add-details', 'insights', 'analytics', 'communication', 'lyrics-editor', 'queue', 'admin'].includes(currentView);

  return (
    <div className="relative w-full min-h-screen bg-black text-white flex flex-col max-w-[430px] mx-auto overflow-hidden shadow-2xl">
      <audio ref={audioRef} src={currentSong?.audioUrl} onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)} onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} onEnded={handleSkipNext} preload="auto" />
      
      <div className={`flex-1 ${!isFullscreenView ? 'pb-44' : ''}`}>
        {(() => {
          const commonProps = { songs: isOfflineMode ? songs.filter(s => downloadedIds.has(s.id)) : songs };
          switch (currentView) {
            case 'home': return <HomeView {...commonProps} recentlyPlayed={recentlyPlayedIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[]} onSongSelect={handleSongSelect} activeSong={activeSongWithStatus || MOCK_SONGS[0]} userName={userProfile.name} onNavigateNotifications={() => setCurrentView('communication')} />;
            case 'player': return activeSongWithStatus ? <PlayerView song={activeSongWithStatus} isPlaying={isPlaying} currentTime={currentTime} duration={duration} shuffleMode={shuffleMode} repeatMode={repeatMode} playbackSpeed={playbackSpeed} onSetPlaybackSpeed={setPlaybackSpeed} playlists={playlists} analyser={analyserRef.current} isOfflineMode={isOfflineMode} onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)} onCycleShuffle={() => setShuffleMode(m => m === 'off' ? 'all' : m === 'all' ? 'one' : 'off')} onCycleRepeat={() => setRepeatMode(m => m === 'off' ? 'all' : m === 'all' ? 'one' : 'off')} onAddToPlaylist={(pid, sid) => setPlaylists(ps => ps.map(p => p.id === pid ? { ...p, songIds: [...new Set([...p.songIds, sid])] } : p))} onCreatePlaylist={(name, sid) => { const p = { id: Date.now().toString(), name, songIds: sid ? [sid] : [] }; setPlaylists(ps => [p, ...ps]); return p; }} onSeek={(t) => { if (audioRef.current) audioRef.current.currentTime = t; }} onTogglePlay={handleTogglePlay} onBack={() => setCurrentView('home')} onToggleDownload={() => { setDownloadedIds(prev => { const n = new Set(prev); if (n.has(activeSongWithStatus.id)) n.delete(activeSongWithStatus.id); else n.add(activeSongWithStatus.id); return n; }); }} onSkipNext={handleSkipNext} onSkipPrevious={handleSkipPrevious} onEditLyrics={() => setCurrentView('lyrics-editor')} onOpenQueue={() => setCurrentView('queue')} /> : null;
            case 'search': return <SearchView songs={songs} onSongSelect={handleSongSelect} onAddGlobalSong={(s) => setSongs(prev => [s as Song, ...prev])} />;
            case 'library': return <LibraryView songs={songs.map(s => ({ ...s, isDownloaded: downloadedIds.has(s.id) }))} onSongSelect={handleSongSelect} onToggleDownload={(id) => setDownloadedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; })} onDeleteSong={handleDeleteSong} onAddNew={() => setCurrentView('add-details')} isOfflineMode={isOfflineMode} onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)} onDownloadAll={() => setDownloadedIds(new Set(songs.map(s => s.id)))} isAllDownloaded={downloadedIds.size === songs.length} />;
            case 'add-details': return <AddDetailsView onBack={() => setCurrentView('home')} onAddSong={handleAddSong} />;
            case 'profile': return <ProfileView profile={userProfile} onUpdateProfile={handleProfileUpdate} onLogout={handleLogout} onSync={() => saveProfile(userProfile)} onNavigateSubscription={() => setCurrentView('subscription')} onNavigateInsights={() => setCurrentView('insights')} onNavigateAnalytics={() => setCurrentView('analytics')} onNavigateCommunication={() => setCurrentView('communication')} onNavigateAdmin={() => setCurrentView('admin')} />;
            default: return <HomeView {...commonProps} recentlyPlayed={recentlyPlayedIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[]} onSongSelect={handleSongSelect} activeSong={activeSongWithStatus || MOCK_SONGS[0]} userName={userProfile.name} />;
          }
        })()}
      </div>

      {!isFullscreenView && currentSong && (
        <div onClick={() => setCurrentView('player')} className="fixed bottom-[104px] left-6 right-6 z-40 bg-[#111]/90 backdrop-blur-2xl rounded-3xl p-3 flex items-center justify-between border border-white/5 shadow-2xl cursor-pointer active:scale-[0.98] transition-all overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5">
            <div className="h-full bg-[#B6FF1A]" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
          </div>
          <div className="flex items-center gap-3.5 pl-1">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/5">
              <img src={currentSong.coverUrl} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black truncate max-w-[160px] text-white">{currentSong.title}</span>
              <span className="text-[10px] font-black text-[#B6FF1A] uppercase tracking-[0.1em]">{currentSong.artist}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pr-1">
            <button onClick={(e) => { e.stopPropagation(); handleTogglePlay(); }} className="w-10 h-10 flex items-center justify-center text-white bg-white/5 rounded-full">
              {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-1" />}
            </button>
          </div>
        </div>
      )}

      {!isFullscreenView && <BottomNav activeTab={currentView} onTabChange={tab => setCurrentView((tab as any) === 'plus' ? 'add-details' : (tab as ViewState))} />}
    </div>
  );
};

export default App;
