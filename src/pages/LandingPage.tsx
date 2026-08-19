import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, UserPlus, Send, HeartHandshake, Lock, Compass } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="w-full space-y-24 py-6 sm:py-12">
      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-8 pt-4 sm:pt-8 px-4">
        {/* Subtle decorative glow orb behind hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Hero Tag badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-medium tracking-wide shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>Social Compatibility Intelligence</span>
        </motion.div>

        {/* Main Headline & Float Animation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { duration: 0.8, delay: 0.1 },
            y: { repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.8 }
          }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent leading-[1.15]">
            Some connections are written in the stars.
          </h1>
          
          <p className="text-base sm:text-xl text-purple-200/80 max-w-2xl mx-auto font-normal leading-relaxed">
            Invite someone into your cosmic circle and discover how your personalities, communication styles, and relationship energies align.
          </p>
        </motion.div>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col items-center gap-4 w-full sm:w-auto pt-2"
        >
          <Link
            to="/create"
            id="primary-cta-button"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Check Our Compatibility</span>
            <ArrowRight className="w-5 h-5 text-pink-200" />
          </Link>

          <Link
            to="/demo"
            id="secondary-cta-button"
            className="text-xs sm:text-sm text-purple-300/80 hover:text-purple-100 font-medium transition-colors underline underline-offset-4 decoration-purple-500/40 hover:decoration-purple-300"
          >
            Try Instant Demo
          </Link>
        </motion.div>
      </section>

      {/* SECTION 1: HOW ASTROSYNC WORKS */}
      <section className="max-w-5xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-pink-400/90">Simplified 3-Step Process</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            How AstroSync Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-purple-500/20 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-5xl font-black text-purple-300 select-none">
              01
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1. Create Your Cosmic Profile</h3>
              <p className="text-sm text-purple-200/70 leading-relaxed">
                Enter your birth date, time, and location to calculate your exact planetary positions and core astrological placements.
              </p>
            </div>
            <div className="text-xs font-mono text-purple-400/70 pt-2 border-t border-purple-900/30">
              Person A Setup
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-purple-500/20 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-5xl font-black text-pink-300 select-none">
              02
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-pink-900/30 border border-pink-500/30 flex items-center justify-center text-pink-300 group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Invite Someone</h3>
              <p className="text-sm text-purple-200/70 leading-relaxed">
                Generate a unique encrypted invite link and send it to a partner, friend, or crush to join your chart pairing.
              </p>
            </div>
            <div className="text-xs font-mono text-pink-400/70 pt-2 border-t border-purple-900/30">
              Structural Virality
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-purple-500/20 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-5xl font-black text-purple-300 select-none">
              03
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Reveal Your Compatibility</h3>
              <p className="text-sm text-purple-200/70 leading-relaxed">
                Once Person B completes their details, your shared synastry report instantly unlocks for both of you to explore.
              </p>
            </div>
            <div className="text-xs font-mono text-purple-400/70 pt-2 border-t border-purple-900/30">
              Instant Reveal
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: MOCK COMPATIBILITY PREVIEW CARD */}
      <section className="max-w-3xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Sample Insights</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Preview Synastry Breakdown
          </h2>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden space-y-6">
          {/* Card Top Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-purple-900/40 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm border-2 border-[#0f0c29]">
                  A
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-[#0f0c29]">
                  B
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Alex &amp; Jordan</h3>
                <p className="text-xs text-purple-300/70">Scorpio Sun + Pisces Moon Pairing</p>
              </div>
            </div>

            {/* Score Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-pink-300 font-extrabold text-lg shadow-[0_0_15px_rgba(236,72,153,0.2)]">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>87% Cosmic Match</span>
            </div>
          </div>

          {/* Progress Category Bars */}
          <div className="space-y-4">
            {/* Category 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-purple-200">Communication Energy</span>
                <span className="text-purple-300">92%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-purple-950/80 border border-purple-900/50 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[92%]" />
              </div>
            </div>

            {/* Category 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-purple-200">Emotional Resonance</span>
                <span className="text-purple-300">84%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-purple-950/80 border border-purple-900/50 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[84%]" />
              </div>
            </div>

            {/* Category 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-purple-200">Long-Term Growth &amp; Chemistry</span>
                <span className="text-purple-300">85%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-purple-950/80 border border-purple-900/50 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[85%]" />
              </div>
            </div>
          </div>

          {/* Blurred curiosity lines */}
          <div className="relative pt-4 space-y-3 border-t border-purple-900/30">
            <div className="space-y-2 select-none filter blur-[5px] opacity-40">
              <p className="text-xs text-purple-200">
                • Deep emotional alignment when navigating major life decisions and shared goals...
              </p>
              <p className="text-xs text-purple-200">
                • Mercury trine Venus triggers exceptional intuitive understanding without verbal friction...
              </p>
              <p className="text-xs text-purple-200">
                • Shared Saturn placement creates strong loyalty during high-pressure challenges...
              </p>
            </div>

            {/* Teaser Lock Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-4 py-2 rounded-xl bg-purple-950/90 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <Lock className="w-3.5 h-3.5 text-pink-400" />
                <span>Invite Person B to unlock complete synastry breakdown</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: COMPATIBILITY TAKES TWO */}
      <section className="max-w-3xl mx-auto px-4">
        <div className="glass-card rounded-2xl p-8 border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-purple-900/20 to-pink-950/30 text-center space-y-6 shadow-[0_0_25px_rgba(168,85,247,0.15)] relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center mx-auto text-white shadow-cosmic-glow">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Compatibility takes two.
            </h2>
            <p className="text-sm sm:text-base text-purple-200/80 leading-relaxed">
              Unlike static horoscope tools, an AstroSync compatibility report requires two participants. By pairing your exact birth coordinates with someone you care about, AstroSync generates real-time synastry insights that neither of you can calculate alone.
            </p>
          </div>

          <div>
            <Link
              to="/create"
              id="section3-cta-button"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm sm:text-base shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all transform hover:-translate-y-0.5"
            >
              <span>Create Your AstroSync</span>
              <ArrowRight className="w-4 h-4 text-pink-200" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
