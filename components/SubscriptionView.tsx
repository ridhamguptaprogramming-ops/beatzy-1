
import React, { useState } from 'react';
import { ChevronLeft, Award, CheckCircle2, Zap, Crown, ShieldCheck, Sparkles } from 'lucide-react';

interface SubscriptionViewProps {
  onBack: () => void;
}

type BillingCycle = 'monthly' | 'yearly';

const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onBack }) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState('max');

  const plans = [
    {
      id: 'free',
      name: 'Basic Vibe',
      price: 0,
      icon: Zap,
      description: 'Perfect for casual listeners.',
      features: ['Standard audio quality', 'Ad-supported playback', 'Basic library management'],
      color: 'zinc-500',
      btnColor: 'bg-zinc-800',
      btnText: 'text-zinc-500'
    },
    {
      id: 'mini',
      name: 'Mini Premium',
      price: billingCycle === 'monthly' ? 1.99 : 19.99,
      icon: Award,
      description: 'Our most popular choice.',
      features: [
        'High fidelity audio',
        'No advertisement',
        'Offline downloads',
        'Unlock upload time'
      ],
      color: '[#B6FF1A]',
      btnColor: 'bg-[#B6FF1A]',
      btnText: 'text-black',
      featured: true,
    },
    {
      id: 'max',
      name: 'VIBE MAX',
      price: billingCycle === 'monthly' ? 4.99 : 49.99,
      icon: Crown,
      description: 'For the true audiophile.',
      features: [
        'Lossless spatial audio',
        'Unlimited AI uploads',
        'Artist insights & stats',
        'Exclusive early access'
      ],
      color: 'purple-500',
      btnColor: 'bg-purple-500',
      btnText: 'text-black',
    }
  ];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto pb-10">
      {/* Dynamic Header Background */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 px-6 pt-12 pb-4 bg-black/80 backdrop-blur-xl border-b border-white/[0.05] flex items-center">
        <button 
          onClick={onBack} 
          className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-800 transition active:scale-90 border border-white/5"
        >
          <ChevronLeft size={16} />
        </button>
        <h2 className="flex-1 text-center font-black text-[13px] tracking-widest mr-10 uppercase">Pick Your Plan</h2>
      </div>

      <div className="px-6 pt-8">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-zinc-900 p-1 rounded-2xl flex items-center border border-white/5 relative">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-2 text-[10px] font-black transition-all duration-300 relative z-10 ${billingCycle === 'monthly' ? 'text-black' : 'text-zinc-500'}`}
            >
              MONTHLY
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-2 text-[10px] font-black transition-all duration-300 relative z-10 ${billingCycle === 'yearly' ? 'text-black' : 'text-zinc-500'}`}
            >
              YEARLY
            </button>
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#B6FF1A] rounded-xl transition-all duration-300 shadow-lg shadow-[#B6FF1A]/20 ${billingCycle === 'yearly' ? 'translate-x-[calc(100%+0px)]' : 'translate-x-0'}`} 
            />
          </div>
        </div>

        {/* Plans List */}
        <div className="space-y-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative group rounded-[2rem] p-6 border transition-all duration-500 cursor-pointer overflow-hidden
                  ${isSelected 
                    ? `bg-zinc-900/60 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] scale-[1.01]` 
                    : 'bg-zinc-900/20 border-white/[0.05] opacity-50 hover:opacity-100'
                  }`}
              >
                {/* Purple Glow for Vibe Max when selected */}
                {isSelected && plan.id === 'max' && (
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none" />
                )}

                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-${plan.color} border border-white/5 shadow-xl`}>
                    <Icon size={24} strokeWidth={2.5} />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-3xl font-black">${plan.price}</span>
                      {plan.price > 0 && (
                        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">
                          / {billingCycle === 'monthly' ? 'MO' : 'YR'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-black mb-1 uppercase tracking-tight">{plan.name}</h3>
                  <p className="text-zinc-500 text-[11px] font-bold">{plan.description}</p>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`p-0.5 rounded-full ${isSelected ? `text-${plan.color}` : 'text-zinc-700'}`}>
                        <CheckCircle2 size={16} strokeWidth={2.5} />
                      </div>
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-zinc-200' : 'text-zinc-600'}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  className={`w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all
                    ${isSelected 
                      ? `${plan.btnColor} ${plan.btnText} shadow-xl active:scale-[0.98]` 
                      : 'bg-zinc-800 text-zinc-500'
                    }`}
                >
                  {isSelected ? (plan.price === 0 ? 'CURRENT PLAN' : `JOIN ${plan.name}`) : 'SELECT PLAN'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Support Section - Matched to Screenshot */}
        <div className="mt-10 mb-8 bg-[#0C0C0C] rounded-2xl p-5 border border-white/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-900/50 rounded-xl flex items-center justify-center text-zinc-600 border border-white/5">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-300 tracking-wider">SECURE PAYMENTS</p>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tight">Encrypted via VibePay</p>
            </div>
          </div>
          <button className="text-[9px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">Learn More</button>
        </div>

        {/* Comparison Table Link */}
        <div className="flex justify-center mb-6">
          <button className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors">
            <Sparkles size={14} className="text-[#B6FF1A]" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Compare all features</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionView;
