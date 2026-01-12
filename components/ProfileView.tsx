
import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Lightbulb, Bell, Compass, MessageSquare, ChevronRight, 
  Pencil, Award, Check, Camera, CheckCircle2, LogIn, LogOut, 
  Chrome, Apple, Twitter, Loader2, X, Music, ShieldCheck, RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onLogout: () => void;
  onSync?: () => void;
  onNavigateSubscription: () => void;
  onNavigateInsights: () => void;
  onNavigateAnalytics: () => void;
  onNavigateCommunication: () => void;
  onNavigateAdmin?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  profile, 
  onUpdateProfile, 
  onLogout,
  onSync,
  onNavigateSubscription, 
  onNavigateInsights,
  onNavigateAnalytics,
  onNavigateCommunication,
  onNavigateAdmin
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState('Profile updated!');
  
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editImage, setEditImage] = useState(profile.profileImage);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Admin access check
  const isAdmin = profile.email === 'ridhamgupta805@gmail.com';

  useEffect(() => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditImage(profile.profileImage);
  }, [profile]);

  const handleSave = () => {
    onUpdateProfile({
      ...profile,
      name: editName,
      email: editEmail,
      profileImage: editImage
    });
    setIsEditing(false);
    setToastMessage('Profile updated!');
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    if (onSync) onSync();
    setTimeout(() => {
      setIsSyncing(false);
      setToastMessage('Cloud Database Synced!');
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 2000);
    }, 1500);
  };

  const simulateLogin = (provider: string) => {
    setIsLoggingIn(true);
    setTimeout(() => {
      // Simulate admin login if Google is picked
      const newUser = {
        name: provider === 'Google' ? 'Saurabh Singh' : provider === 'Apple' ? 'Vibe Enthusiast' : 'Music Maker',
        email: provider === 'Google' ? 'ridhamgupta805@gmail.com' : `${provider.toLowerCase()}.user@vibemail.com`,
        profileImage: profile.profileImage,
        isLoggedIn: true
      };
      onUpdateProfile(newUser);
      setIsLoggingIn(false);
      setShowLoginModal(false);
      setToastMessage(`Welcome, ${newUser.name}!`);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    }, 1800);
  };

  const settingsGroups = [
    {
      title: 'ACCOUNT SETTINGS',
      items: [
        { id: 'personal', label: 'Personal Details', icon: User },
        { id: 'insights', label: 'Your Activity', icon: Lightbulb },
        { id: 'notif', label: 'Notifications', icon: Bell },
      ]
    },
    {
      title: 'LIBRARY & SYNC',
      items: [
        { id: 'analytics', label: 'Cloud Stats', icon: Compass },
        { id: 'comm', label: 'Messages', icon: MessageSquare },
      ]
    }
  ];

  return (
    <div className="px-6 pt-12 animate-in fade-in duration-500 pb-32 bg-black min-h-screen relative">
      <div ref={topRef} className="absolute top-0 h-1 w-1" />
      
      {showConfirmation && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-500 fade-in w-[80%] max-w-[300px]">
          <div className="bg-[#B6FF1A] text-black px-6 py-3 rounded-full flex items-center justify-center gap-3 shadow-2xl border border-black/10">
            <CheckCircle2 size={18} strokeWidth={3} />
            <span className="font-black text-[11px] uppercase tracking-wider text-center">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border border-white/10 shadow-2xl">
            <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
            {profile.isLoggedIn && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#B6FF1A] rounded-full border-2 border-black flex items-center justify-center">
                <ShieldCheck size={10} className="text-black" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-[18px] font-black text-white tracking-tight">{profile.name}</h2>
            </div>
            <p className="text-zinc-500 text-[12px] font-bold tracking-tight opacity-70">{profile.email}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {profile.isLoggedIn && (
            <button 
              onClick={handleManualSync}
              className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform ${isSyncing ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={14} className={isSyncing ? 'text-[#B6FF1A]' : ''} />
            </button>
          )}
          {profile.isLoggedIn ? (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform"
            >
              <Pencil size={14} />
            </button>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-3 rounded-full bg-[#B6FF1A] text-black font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mb-8 p-6 bg-zinc-900/50 border border-white/5 rounded-[2rem] animate-in zoom-in-95 duration-300">
           <div className="space-y-4">
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Full Name" className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#B6FF1A]" />
              <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Email Address" className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#B6FF1A]" />
              <button onClick={handleSave} className="w-full py-3 bg-[#B6FF1A] text-black rounded-xl font-black text-[11px] uppercase tracking-widest">Save Changes</button>
           </div>
        </div>
      )}

      {/* Admin Quick Entry */}
      {isAdmin && onNavigateAdmin && (
        <button 
          onClick={onNavigateAdmin}
          className="mb-6 w-full flex items-center justify-between p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <ShieldAlert size={22} />
            </div>
            <div className="text-left">
              <h4 className="text-[16px] font-black text-red-500 uppercase tracking-tight">Admin Dashboard</h4>
              <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">Master Control Access</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-red-500/50" />
        </button>
      )}

      {/* Vibe Master Card matched to screenshot */}
      {profile.isLoggedIn && (
        <div className="mb-12 bg-[#B6FF1A] rounded-[2.5rem] p-8 text-black shadow-[0_20px_60px_-15px_rgba(182,255,26,0.5)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-black/[0.03] blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-11 h-11 bg-black rounded-2xl flex items-center justify-center text-[#B6FF1A] shadow-xl">
              <Award size={24} strokeWidth={2.5} />
            </div>
            <div className="bg-black/10 px-3 py-1.5 rounded-full border border-black/5 flex items-center">
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Pro Status</span>
            </div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-black tracking-tighter mb-1 leading-none uppercase">VIBE MASTER</h3>
            <p className="text-[11px] font-black opacity-60 uppercase tracking-[0.15em] mt-2">Unlimited Cloud Sync Active</p>
          </div>
        </div>
      )}

      <div className="space-y-12">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h4 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.25em] mb-7 pl-1">{group.title}</h4>
            <div className="space-y-6">
              {group.items.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => !profile.isLoggedIn ? setShowLoginModal(true) : null}
                  className="w-full flex items-center justify-between group active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-[#0A0A0A] border border-white/5 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:bg-[#B6FF1A]/10 group-hover:text-[#B6FF1A] transition-all">
                      <item.icon size={20} strokeWidth={2} />
                    </div>
                    <span className="font-bold text-[16px] text-zinc-300 group-hover:text-white tracking-tight">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-zinc-800" />
                </button>
              ))}
            </div>
          </div>
        ))}
        
        {profile.isLoggedIn && (
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-5 group py-4 border-t border-white/5"
          >
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
              <LogOut size={20} />
            </div>
            <span className="font-bold text-[16px] text-red-500 tracking-tight">Sign Out</span>
          </button>
        )}
      </div>

      {showLoginModal && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] animate-in fade-in duration-300" onClick={() => !isLoggingIn && setShowLoginModal(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[120] bg-[#0c0c0c] border-t border-white/10 rounded-t-[45px] px-8 pt-6 pb-14 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-10" />
            
            <div className="flex items-center justify-center mb-8">
               <div className="w-16 h-16 bg-[#B6FF1A] rounded-[2rem] flex items-center justify-center text-black shadow-lg shadow-[#B6FF1A]/20">
                  <Music size={32} strokeWidth={3} />
               </div>
            </div>

            <h3 className="text-[24px] font-black uppercase tracking-tighter text-center text-white mb-2">Sync Your Library</h3>
            <p className="text-zinc-500 text-center text-[12px] font-bold mb-12 px-6">Access your music on any device and never lose your uploads again.</p>

            <div className="space-y-4">
              <button 
                disabled={isLoggingIn}
                onClick={() => simulateLogin('Google')}
                className="w-full py-4.5 bg-white text-black rounded-3xl font-black uppercase text-[12px] tracking-widest flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoggingIn ? <Loader2 className="animate-spin" size={18} /> : <Chrome size={20} className="text-red-500" />}
                Sign In with Google (Admin)
              </button>

              <button 
                disabled={isLoggingIn}
                onClick={() => simulateLogin('Apple')}
                className="w-full py-4.5 bg-zinc-900 text-white rounded-3xl font-black uppercase text-[12px] tracking-widest flex items-center justify-center gap-4 border border-white/5 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoggingIn ? <Loader2 className="animate-spin" size={18} /> : <Apple size={20} />}
                Sign In with Siri
              </button>

              <button 
                disabled={isLoggingIn}
                onClick={() => simulateLogin('Twitter')}
                className="w-full py-4.5 bg-[#1DA1F2] text-white rounded-3xl font-black uppercase text-[12px] tracking-widest flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoggingIn ? <Loader2 className="animate-spin" size={18} /> : <Twitter size={20} fill="currentColor" />}
                Sign In with Twitter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileView;
