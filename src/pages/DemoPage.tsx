import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import type { UserProfile } from '../types';

// Hardcoded Judge Demo Profiles (Aarav: Leo Sun, Maya: Libra Sun)
const DEMO_PERSON_A: UserProfile = {
  name: 'Aarav',
  birthDate: '1996-08-08',
  birthTime: '10:30',
  intent: 'Partner',
};

const DEMO_PERSON_B: UserProfile = {
  name: 'Maya',
  birthDate: '1998-10-05',
  birthTime: '14:15',
};

export const DemoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLaunchDemo = () => {
    try {
      // Store judge demo profiles in localStorage
      localStorage.setItem('astrosync_person_a', JSON.stringify(DEMO_PERSON_A));
      localStorage.setItem('astrosync_person_b', JSON.stringify(DEMO_PERSON_B));
    } catch (err) {
      console.warn('LocalStorage save error in demo mode:', err);
    }

    // Navigate directly to dashboard for full reveal experience
    navigate('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      {/* Unobtrusive Demo Experience Badge */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
          <span>Demo Experience &bull; Instant Simulation</span>
        </div>

        <span className="text-[11px] text-purple-400/60 font-mono">
          Hackathon Pitch Ready
        </span>
      </div>

      {/* DEMO CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 sm:p-10 rounded-3xl border border-purple-500/30 text-center space-y-8 shadow-[0_0_40px_rgba(168,85,247,0.2)] relative overflow-hidden"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-500 flex items-center justify-center mx-auto text-white shadow-cosmic-glow">
          <PlayCircle className="w-8 h-8" />
        </div>

        <div className="space-y-3 max-w-lg mx-auto">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Interactive Pitch Safety Net
          </h1>
          <p className="text-sm sm:text-base text-purple-200/80 leading-relaxed">
            Instantly trigger the 2-person compatibility reveal sequence with pre-populated cosmic profiles—guaranteeing a flawless demo without live typing or network delay.
          </p>
        </div>

        {/* DEMO PAIR PREVIEW */}
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-left space-y-3 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs text-purple-300 font-semibold uppercase tracking-wider">
            <span>Pre-Configured Synastry Pair</span>
            <span className="text-pink-400">Leo &times; Libra</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-cosmic-bg/80 border border-purple-500/20 space-y-1">
              <span className="text-purple-400 font-medium block">Person A</span>
              <p className="text-white font-bold text-sm">Aarav</p>
              <p className="text-[11px] text-purple-300/70">Aug 8, 1996 &bull; Leo ♌</p>
            </div>

            <div className="p-3 rounded-xl bg-cosmic-bg/80 border border-purple-500/20 space-y-1">
              <span className="text-purple-400 font-medium block">Person B</span>
              <p className="text-white font-bold text-sm">Maya</p>
              <p className="text-[11px] text-purple-300/70">Oct 5, 1998 &bull; Libra ♎</p>
            </div>
          </div>
        </div>

        {/* PRIMARY DEMO LAUNCH BUTTON */}
        <div className="pt-2">
          <button
            id="launch-judge-demo-button"
            type="button"
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span>Launch Judge Demo</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
