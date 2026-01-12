import React from 'react';
import { Home, Search, Plus, BookOpen, User } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  activeTab: ViewState;
  onTabChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'plus', icon: Plus, label: 'Add' },
    { id: 'library', icon: BookOpen, label: 'Library' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-8 left-6 right-6 max-w-[400px] mx-auto bg-[#080808]/95 backdrop-blur-2xl rounded-[2.8rem] p-2 z-40 border border-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          // Fix: cast activeTab to string for safe comparison with tab.id which may be 'plus'
          const isActive = (activeTab as string) === tab.id;
          
          if (isActive) {
            return (
              <button 
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex items-center gap-2.5 bg-[#B6FF1A] text-black px-5 py-3.5 rounded-full font-black text-[13px] shadow-lg shadow-[#B6FF1A]/20 transition-all duration-500 transform scale-105 active:scale-95"
              >
                <Icon size={18} strokeWidth={3} fill="black" />
                <span className="tracking-tight">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="p-4 text-zinc-600 hover:text-white transition-all duration-300 active:scale-90"
            >
              <Icon size={22} strokeWidth={2} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;