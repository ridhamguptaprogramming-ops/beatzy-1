import React from 'react';
import { ChevronLeft, Send, Users, Bell, Plus, Calendar } from 'lucide-react';

interface CommunicationViewProps {
  onBack: () => void;
}

const CommunicationView: React.FC<CommunicationViewProps> = ({ onBack }) => {
  const recentCampaigns = [
    { title: 'Album Launch Promo', date: 'Oct 12, 2024', reach: '42K', status: 'SENT' },
    { title: 'Tour Announcement', date: 'Oct 05, 2024', reach: '128K', status: 'DRAFT' },
    { title: 'Merch Drop Update', date: 'Sep 28, 2024', reach: '15K', status: 'SENT' },
  ];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 pt-12 pb-6 bg-black flex items-center">
        <button 
          onClick={onBack} 
          className="w-10 h-10 bg-zinc-900/50 rounded-full flex items-center justify-center hover:bg-zinc-800 transition active:scale-90 border border-white/5"
        >
          <ChevronLeft size={20} className="text-zinc-400" />
        </button>
        <h2 className="flex-1 text-center font-black text-[13px] tracking-[0.2em] mr-10 uppercase text-white">Communication Hub</h2>
      </div>

      <div className="px-6 pt-4 space-y-6">
        {/* New Broadcast Card */}
        <div className="relative p-10 rounded-[2.8rem] bg-[#0c0c0c] border border-white/[0.03] overflow-hidden group shadow-2xl">
          <div className="relative z-10">
            <h3 className="text-[28px] font-black tracking-tight mb-2 text-white">New Broadcast</h3>
            <p className="text-zinc-500 text-[13px] font-bold mb-8 max-w-[200px] leading-relaxed">
              Send an update to all your verified listeners instantly.
            </p>
            {/* START CAMPAIGN Button with enhanced glow matching screenshot */}
            <button className="bg-[#B6FF1A] text-black px-8 py-4 rounded-full flex items-center gap-3 font-black text-[13px] uppercase tracking-wider shadow-[0_15px_45px_rgba(182,255,26,0.4)] hover:shadow-[0_20px_50px_rgba(182,255,26,0.6)] active:scale-95 transition-all transform hover:-translate-y-0.5">
              <Send size={18} fill="black" />
              Start Campaign
            </button>
          </div>
          
          {/* Subtle Decorative Circles */}
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-56 h-56 border-[1.5px] border-[#B6FF1A]/5 rounded-full blur-[0.5px]">
            <div className="absolute inset-6 border-[1px] border-[#B6FF1A]/3 rounded-full" />
          </div>
        </div>

        {/* Quick Tools Grid */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-[#0c0c0c] border border-white/[0.03] p-7 rounded-[2.2rem] flex flex-col items-center justify-center gap-4 text-center active:scale-95 transition-all cursor-pointer hover:bg-zinc-900/40">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center border border-blue-500/10">
              <Users size={22} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-300">Fan Groups</span>
          </div>
          <div className="bg-[#0c0c0c] border border-white/[0.03] p-7 rounded-[2.2rem] flex flex-col items-center justify-center gap-4 text-center active:scale-95 transition-all cursor-pointer hover:bg-zinc-900/40">
            <div className="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center border border-orange-500/10">
              <Bell size={22} className="fill-orange-400/20" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-300">Smart Alerts</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="pt-4">
          <div className="flex justify-between items-center mb-6 px-1">
            <h3 className="font-black text-[12px] uppercase tracking-[0.2em] text-zinc-300 flex items-center gap-3">
              <Calendar size={18} className="text-[#B6FF1A]" />
              Recent Campaigns
            </h3>
            <button className="text-[11px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.1em]">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentCampaigns.map((camp, idx) => (
              <div 
                key={idx} 
                className="bg-[#0c0c0c] border border-white/[0.03] p-5 rounded-[2.2rem] flex items-center justify-between group hover:bg-zinc-900/30 transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors border border-white/[0.05]">
                    <Plus size={22} />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold tracking-tight mb-1 text-zinc-100">{camp.title}</h4>
                    <p className="text-[11px] text-zinc-500 font-bold tracking-tight">
                      {camp.date} <span className="mx-1 text-zinc-700">•</span> {camp.reach} Reach
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest ${
                  camp.status === 'SENT' 
                    ? 'bg-emerald-500/10 text-emerald-500' 
                    : 'bg-zinc-800/50 text-zinc-500'
                }`}>
                  {camp.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationView;