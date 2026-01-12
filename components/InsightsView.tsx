import React from 'react';
import { ChevronLeft, BarChart3, Clock, Flame, Music2, TrendingUp, Trophy } from 'lucide-react';

interface InsightsViewProps {
  onBack: () => void;
}

const InsightsView: React.FC<InsightsViewProps> = ({ onBack }) => {
  const stats = [
    { label: 'Listening Time', value: '1,240', unit: 'mins', icon: Clock, color: 'text-blue-400' },
    { label: 'Songs Played', value: '342', unit: 'tracks', icon: Music2, color: 'text-[#B6FF1A]' },
    { label: 'Daily Streak', value: '12', unit: 'days', icon: Flame, color: 'text-orange-500' },
  ];

  const topGenres = [
    { name: 'Hip Hop', percentage: 85, color: 'bg-[#B6FF1A]' },
    { name: 'Party', percentage: 65, color: 'bg-emerald-400' },
    { name: 'Pop', percentage: 45, color: 'bg-blue-500' },
    { name: 'R&B', percentage: 30, color: 'bg-purple-500' },
  ];

  const weekData = [45, 80, 60, 100, 75, 90, 40];
  const weekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 pt-12 pb-6 bg-black/80 backdrop-blur-xl border-b border-white/[0.05] flex items-center">
        <button 
          onClick={onBack} 
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-800 transition active:scale-90 border border-white/5"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="flex-1 text-center font-black text-lg tracking-tighter mr-10 uppercase">Your Insights</h2>
      </div>

      <div className="px-6 pt-8 space-y-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-zinc-900/40 border border-white/5 p-4 rounded-3xl flex flex-col items-center text-center shadow-lg">
              <stat.icon size={18} className={`${stat.color} mb-3`} />
              <p className="text-xl font-black tracking-tighter">{stat.value}</p>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{stat.unit}</p>
            </div>
          ))}
        </div>

        {/* Activity Chart */}
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
              <BarChart3 size={16} className="text-[#B6FF1A]" />
              Weekly Activity
            </h3>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Last 7 Days</span>
          </div>
          <div className="h-32 flex items-end justify-between gap-2 px-2">
            {weekData.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className={`w-full rounded-t-xl transition-all duration-1000 delay-${idx * 100} ${val === 100 ? 'bg-[#B6FF1A] shadow-[0_0_15px_rgba(182,255,26,0.3)]' : 'bg-zinc-800'}`}
                  style={{ height: `${val}%` }}
                />
                <span className="text-[8px] font-black text-zinc-700">{weekLabels[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Artist Feature */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-zinc-800/50 to-black border border-white/5 p-6 h-48 flex items-center justify-between group">
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2 text-[#B6FF1A] font-black text-[9px] uppercase tracking-[0.2em] mb-3">
              <Trophy size={12} />
              #1 Artist
            </div>
            <h4 className="text-3xl font-black tracking-tighter mb-1">The Weeknd</h4>
            <p className="text-zinc-500 text-[11px] font-bold">128 plays this week</p>
            <button className="mt-5 bg-white text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider active:scale-95 transition-transform">
              Play Radio
            </button>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-[45%]">
             <img 
               src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
               alt="The Weeknd"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          </div>
        </div>

        {/* Top Genres */}
        <div>
          <h3 className="font-black text-sm uppercase tracking-wider mb-6 pl-1 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-400" />
            Top Genres
          </h3>
          <div className="space-y-6">
            {topGenres.map((genre, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider px-1">
                  <span className="text-zinc-400">{genre.name}</span>
                  <span>{genre.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 delay-${idx * 200} ${genre.color}`}
                    style={{ width: `${genre.percentage}%` }}
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

export default InsightsView;