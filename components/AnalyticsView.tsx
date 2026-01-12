import React from 'react';
import { ChevronLeft, BarChart3, Users, Heart, Share2, ArrowUpRight, Globe2 } from 'lucide-react';

interface AnalyticsViewProps {
  onBack: () => void;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onBack }) => {
  const mainStats = [
    { label: 'Total Reach', value: '842K', growth: '+12.5%', icon: Users },
    { label: 'Saves', value: '12.4K', growth: '+5.2%', icon: Heart },
    { label: 'Shares', value: '3.1K', growth: '+18.1%', icon: Share2 },
  ];

  const topCountries = [
    { name: 'United States', percentage: 42, flag: '🇺🇸' },
    { name: 'United Kingdom', percentage: 28, flag: '🇬🇧' },
    { name: 'Germany', percentage: 15, flag: '🇩🇪' },
    { name: 'France', percentage: 10, flag: '🇫🇷' },
  ];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto pb-10">
      <div className="sticky top-0 z-20 px-6 pt-12 pb-6 bg-black/80 backdrop-blur-xl border-b border-white/[0.05] flex items-center">
        <button onClick={onBack} className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-800 transition active:scale-90 border border-white/5">
          <ChevronLeft size={20} />
        </button>
        <h2 className="flex-1 text-center font-black text-lg tracking-tighter mr-10 uppercase">Marketing Analytics</h2>
      </div>

      <div className="px-6 pt-8 space-y-8">
        {/* Growth Overview */}
        <div className="bg-[#B6FF1A] rounded-[2.5rem] p-8 text-black shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Revenue Estimate</p>
              <h3 className="text-4xl font-black tracking-tighter">$4,285.50</h3>
            </div>
            <div className="bg-black/10 px-3 py-1.5 rounded-full flex items-center gap-1">
              <ArrowUpRight size={14} strokeWidth={3} />
              <span className="text-[10px] font-black">24%</span>
            </div>
          </div>
          <div className="h-20 flex items-end gap-1.5">
            {[40, 70, 45, 90, 65, 80, 100, 50, 75, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-black/10 rounded-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          {mainStats.map((stat, idx) => (
            <div key={idx} className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#B6FF1A]">
                  <stat.icon size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-black tracking-tight">{stat.value}</p>
                </div>
              </div>
              <span className="text-[11px] font-black text-[#B6FF1A]">{stat.growth}</span>
            </div>
          ))}
        </div>

        {/* Geographic Distribution */}
        <div>
          <h3 className="font-black text-sm uppercase tracking-wider mb-6 pl-1 flex items-center gap-2">
            <Globe2 size={16} className="text-blue-400" />
            Geographic Reach
          </h3>
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-6 space-y-6">
            {topCountries.map((country, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-zinc-300">{country.name}</span>
                  </span>
                  <span className="text-[#B6FF1A]">{country.percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#B6FF1A] rounded-full transition-all duration-1000"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;