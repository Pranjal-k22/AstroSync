import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Sparkles,
  Zap,
  ShieldAlert,
  Lock,
  Compass,
  ArrowRight,
  Share2,
  UserPlus,
  Check,
  CheckCircle2,
  X,
  Star,
  UserCheck,
  CreditCard,
  MessageCircle,
  Bot,
  Lightbulb,
  Send,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import type { UserProfile } from '../types';
import { computeCompatibility, type CompatibilityResult } from '../features/compatibility';
import { MONETIZATION_CONSTANTS } from '../data';

interface AIInterpretation {
  headline: string;
  shortSummary: string;
  strongestConnection: string;
  potentialChallenge: string;
  communicationAdvice: string;
  funObservation: string;
}

// Animated Score Counter Component
const AnimatedScore: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const stepTime = 20;
    const increment = (end - start) / (duration / stepTime);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}%</span>;
};

export const ResultPage: React.FC = () => {
  const [personA, setPersonA] = useState<UserProfile | null>(null);
  const [personB, setPersonB] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [missingData, setMissingData] = useState(false);

  // AI Narrative state (Optional non-blocking layer)
  const [aiNarrative, setAiNarrative] = useState<AIInterpretation | null>(null);

  // Reveal Sequence States: 'calculating' | 'connecting' | 'revealed'
  const [revealPhase, setRevealPhase] = useState<'calculating' | 'connecting' | 'revealed'>('calculating');

  // Sharing toast state
  const [shareCopied, setShareCopied] = useState(false);

  // Monetization Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAstrologer, setSelectedAstrologer] = useState('1');
  const [contactInput, setContactInput] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Ask the Stars — Chat Panel State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const rawA = localStorage.getItem('astrosync_person_a');
      const rawB = localStorage.getItem('astrosync_person_b');

      if (!rawA || !rawB) {
        setMissingData(true);
        return;
      }

      const pA: UserProfile = JSON.parse(rawA);
      const pB: UserProfile = JSON.parse(rawB);

      if (!pA.name || !pB.name) {
        setMissingData(true);
        return;
      }

      setPersonA(pA);
      setPersonB(pB);

      // Compute deterministic compatibility
      const compResult = computeCompatibility(pA, pB);
      setResult(compResult);

      // NON-BLOCKING BACKGROUND CALL TO OPTIONAL AI INTERPRETATION API
      fetchAINarrative(pA.name, pB.name, compResult);
    } catch (err) {
      console.error('Error reading profiles from localStorage:', err);
      setMissingData(true);
      return;
    }

    const t1 = setTimeout(() => {
      setRevealPhase('connecting');
    }, 1800);

    const t2 = setTimeout(() => {
      setRevealPhase('revealed');
    }, 3300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Background non-blocking fetch to /api/interpret
  const fetchAINarrative = async (nameA: string, nameB: string, compResult: CompatibilityResult) => {
    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personAName: nameA,
          personBName: nameB,
          // Full zodiac metadata — lets Gemini reason about WHY signs interact this way
          personAZodiac: {
            name: compResult.personAZodiac.name,
            symbol: compResult.personAZodiac.symbol,
            element: compResult.personAZodiac.element,
            modality: compResult.personAZodiac.modality,
            rulingPlanet: compResult.personAZodiac.rulingPlanet,
            traits: compResult.personAZodiac.traits,
          },
          personBZodiac: {
            name: compResult.personBZodiac.name,
            symbol: compResult.personBZodiac.symbol,
            element: compResult.personBZodiac.element,
            modality: compResult.personBZodiac.modality,
            rulingPlanet: compResult.personBZodiac.rulingPlanet,
            traits: compResult.personBZodiac.traits,
          },
          // Deterministic scores — anchor context only, AI must not restate as numbers
          overallScore: compResult.overallScore,
          categories: compResult.categories,
          signals: compResult.signals,
          strengths: compResult.strengths,
          challenges: compResult.challenges,
        }),
      });

      if (!response.ok) {
        // Silently fall back to deterministic insights if API key missing or endpoint unavailable
        return;
      }

      const data = await response.json();
      if (data && data.headline) {
        setAiNarrative(data);
      }
    } catch {
      // Silently fall back
    }
  };


  // Social Share Handler (Never shares birth details, only score + top strength + link)
  const handleShareMatch = async () => {
    if (!personA || !personB || !result) return;

    const shareTitle = `AstroSync Match: ${personA.name} × ${personB.name}`;
    const shareText = `${personA.name} & ${personB.name} scored ${result.overallScore}% Cosmic Match on AstroSync! Communication score: ${result.categories.communication}%. Discover your compatibility:`;
    const shareUrl = window.location.origin;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        console.warn('Native share cancelled or failed, falling back to copy:', err);
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleProceedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConfirmed(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setBookingConfirmed(false);
  };

  // MISSING DATA FRIENDLY FALLBACK STATE
  if (missingData) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-2xl border border-purple-500/30 text-center space-y-6 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-center mx-auto text-pink-400">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              No active cosmic pairing found
            </h2>
            <p className="text-sm text-purple-200/80 leading-relaxed">
              AstroSync requires birth parameters for two participants to calculate a synastry report. Create your profile to invite a partner or launch Demo Mode!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/create"
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Profile</span>
            </Link>
            <Link
              to="/demo"
              className="flex-1 py-3.5 rounded-xl glass-card hover:bg-purple-900/40 text-purple-200 font-semibold text-sm transition-all border border-purple-500/30 flex items-center justify-center gap-2"
            >
              <span>Launch Demo</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!personA || !personB || !result) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <Sparkles className="w-10 h-10 text-pink-400 animate-spin" />
        <p className="text-purple-200 text-sm">Aligning chart data...</p>
      </div>
    );
  }

  // REVEAL PHASE 1: Full-Screen Orbiting Particles Loading
  if (revealPhase === 'calculating') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 px-4 relative overflow-hidden">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/40"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute inset-2 rounded-full border border-pink-500/30"
          />
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-cosmic-glow">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 max-w-sm"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Calculating your cosmic connection...
          </h2>
          <p className="text-xs sm:text-sm text-purple-300/70">
            Mapping planetary aspects between {personA.name} and {personB.name}
          </p>
        </motion.div>
      </div>
    );
  }

  // REVEAL PHASE 2: Brief Transition Headline
  if (revealPhase === 'connecting') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-pink-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-pink-400 animate-spin-slow" />
            <span>Synastry Alignment Complete</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent">
            Two charts. One connection.
          </h1>
        </motion.div>
      </div>
    );
  }

  // REVEAL PHASE 3: Full Interactive Dashboard Report
  const radarData = [
    { subject: 'Communication', score: result.categories.communication },
    { subject: 'Emotional', score: result.categories.emotional },
    { subject: 'Romance', score: result.categories.romance },
    { subject: 'Conflict', score: result.categories.conflict },
    { subject: 'Growth', score: result.categories.growth },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto space-y-12 py-4 sm:py-8 px-4 relative overflow-x-hidden"
    >
      {/* HERO SCORE REVEAL HEADER */}
      <section className="glass-card rounded-3xl p-8 sm:p-12 border border-purple-500/30 text-center relative overflow-hidden space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>Cosmic Synastry Report</span>
        </div>

        {/* Circular Percentage Indicator */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              className="stroke-purple-950/80"
              strokeWidth="7"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              className="stroke-pink-500"
              strokeWidth="7"
              strokeDasharray="264"
              initial={{ strokeDashoffset: 264 }}
              animate={{ strokeDashoffset: 264 - (264 * result.overallScore) / 100 }}
              transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
              <AnimatedScore value={result.overallScore} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300/80 mt-1">
              Cosmic Match
            </span>
          </div>
        </div>

        {/* Pair Names & Zodiac Signs */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {personA.name} <span className="text-pink-400 font-light">&times;</span> {personB.name}
          </h1>
          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm text-purple-200/80 font-medium">
            <span>{result.personAZodiac.symbol} {result.personAZodiac.name}</span>
            <span className="text-purple-500">&bull;</span>
            <span>{result.personBZodiac.symbol} {result.personBZodiac.name}</span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-purple-200/80 max-w-xl mx-auto leading-relaxed pt-2">
          {result.summary}
        </p>

        {/* Quick Signals Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {result.signals.map((sig, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold"
            >
              {sig}
            </span>
          ))}
        </div>
      </section>

      {/* OPTIONAL AI NARRATIVE CARD (SWAPPED IN WHEN API RESPONSE ARRIVES) */}
      {aiNarrative && (
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 sm:p-8 border border-pink-500/40 bg-gradient-to-r from-purple-950/60 via-pink-950/30 to-purple-950/60 space-y-4 shadow-[0_0_30px_rgba(236,72,153,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300 text-xs font-semibold">
              <Bot className="w-3.5 h-3.5 text-pink-400" />
              <span>Gemini AI Narrative Interpretation</span>
            </div>
            <span className="text-[11px] text-purple-300/70 font-mono">Dynamic Synthesis</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {aiNarrative.headline}
            </h3>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-medium">
              {aiNarrative.shortSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-500/20 space-y-1">
              <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Strongest Connection</span>
              </span>
              <p className="text-xs text-purple-200/80 leading-relaxed">
                {aiNarrative.strongestConnection}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-500/20 space-y-1">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Communication Advice</span>
              </span>
              <p className="text-xs text-purple-200/80 leading-relaxed">
                {aiNarrative.communicationAdvice}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* SECTION 1 — COMPATIBILITY CATEGORIES (RADAR CHART & PROGRESS BARS) */}
      <section className="glass-card rounded-2xl p-6 sm:p-8 border border-purple-500/30 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
            <Compass className="w-5 h-5 text-pink-400" />
            <span>Category Breakdown</span>
          </h2>
          <p className="text-xs sm:text-sm text-purple-300/70">
            5 key dimensions calculated from planetary aspects and modality alignment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="w-full h-64 sm:h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <defs>
                  <radialGradient id="cosmicRadarGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.2} />
                  </radialGradient>
                </defs>
                <PolarGrid stroke="rgba(168, 85, 247, 0.25)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#e9d5ff', fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Compatibility"
                  dataKey="score"
                  stroke="#ec4899"
                  strokeWidth={2}
                  fill="url(#cosmicRadarGradient)"
                  fillOpacity={0.8}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-purple-200">Communication Rhythm</span>
                <span className="text-pink-300 font-bold">{result.categories.communication}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-purple-950/80 border border-purple-900/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.categories.communication}%` }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-purple-200">Emotional Connection</span>
                <span className="text-pink-300 font-bold">{result.categories.emotional}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-purple-950/80 border border-purple-900/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.categories.emotional}%` }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-purple-200">Romantic Chemistry</span>
                <span className="text-pink-300 font-bold">{result.categories.romance}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-purple-950/80 border border-purple-900/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.categories.romance}%` }}
                  transition={{ duration: 1.2, delay: 0.4 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-purple-200">Conflict Balance</span>
                <span className="text-pink-300 font-bold">{result.categories.conflict}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-purple-950/80 border border-purple-900/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.categories.conflict}%` }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-purple-200">Growth Potential</span>
                <span className="text-pink-300 font-bold">{result.categories.growth}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-purple-950/80 border border-purple-900/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.categories.growth}%` }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — "WHY YOU CLICK" */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-pink-400" />
          <h2 className="text-xl font-bold text-white">Why You Click</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.strengths.map((str, idx) => (
            <div
              key={idx}
              className="glass-card p-5 rounded-xl border border-purple-500/20 space-y-2 hover:border-purple-400/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-900/50 flex items-center justify-center text-pink-400 font-bold text-sm">
                0{idx + 1}
              </div>
              <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-medium">
                {str}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — "WHERE THE STARS CLASH" */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Where the Stars Clash</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.challenges.map((chal, idx) => (
            <div
              key={idx}
              className="glass-card p-5 rounded-xl border border-pink-500/20 space-y-2 bg-pink-950/10"
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-950/60 border border-pink-500/30 text-pink-300 text-[11px] font-semibold">
                Constructive Friction #{idx + 1}
              </div>
              <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-medium">
                {chal}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — "YOUR COSMIC SIGNALS" */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          <h2 className="text-xl font-bold text-white">Your Cosmic Signals</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card p-5 rounded-xl border border-purple-500/20 space-y-1.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              <span>Element Dynamics ({result.personAZodiac.element} &times; {result.personBZodiac.element})</span>
            </h3>
            <p className="text-xs text-purple-300/80 leading-relaxed">
              {result.personAZodiac.name} brings {result.personAZodiac.element} energy while {result.personBZodiac.name} brings {result.personBZodiac.element} qualities.
            </p>
          </div>

          <div className="glass-card p-5 rounded-xl border border-purple-500/20 space-y-1.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Modality Rhythm ({result.personAZodiac.modality} &times; {result.personBZodiac.modality})</span>
            </h3>
            <p className="text-xs text-purple-300/80 leading-relaxed">
              Pacing and decision styles balance {result.personAZodiac.modality} leadership with {result.personBZodiac.modality} adaptability.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5 — PREMIUM LOCKED REPORT */}
      <section className="glass-card rounded-2xl p-6 sm:p-8 border border-purple-500/30 text-center space-y-6 relative overflow-hidden bg-gradient-to-b from-purple-950/40 to-cosmic-bg">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            There's more beneath the surface
          </h2>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Unlock the full 14-page deep synastry report including Moon-Venus chemistry and long-term timing charts.
          </p>
        </div>

        <div className="relative pt-2">
          <div className="space-y-3 filter blur-[6px] opacity-35 select-none text-left max-w-lg mx-auto">
            <div className="p-3 rounded-lg bg-purple-900/30 text-xs text-purple-200">
              • Moon-Venus trine aspect generates intense emotional vulnerability during late evening discussions...
            </div>
            <div className="p-3 rounded-lg bg-purple-900/30 text-xs text-purple-200">
              • Saturn shadow period between October and December highlights financial and lifestyle alignment...
            </div>
            <div className="p-3 rounded-lg bg-purple-900/30 text-xs text-purple-200">
              • Mercury retrograde buffer strategy for conflict resolution and shared travel plans...
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-5 py-3 rounded-xl bg-purple-950/95 border border-pink-500/50 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-pink-glow">
              <Lock className="w-4 h-4 text-pink-400" />
              <span>Full Synastry &amp; Timing Report Locked</span>
            </div>
          </div>
        </div>
      </section>

      {/* LIGHTWEIGHT SHARING BLOCK */}
      <section className="glass-card rounded-2xl p-6 sm:p-8 border border-purple-500/30 text-center space-y-6 bg-gradient-to-r from-purple-950/50 via-purple-900/20 to-pink-950/40">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/50 border border-purple-500/30 text-pink-300 text-xs font-semibold">
            <Share2 className="w-3.5 h-3.5 text-pink-400" />
            <span>Viral Sharing</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Think they'll agree?
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/80 max-w-md mx-auto">
            Share your {result.overallScore}% score card with {personB.name} or start a new pairing with another friend.
          </p>
        </div>

        {shareCopied && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-purple-950/90 border border-pink-500/50 text-pink-300 text-xs font-medium flex items-center justify-center gap-2 shadow-pink-glow max-w-sm mx-auto"
          >
            <Check className="w-4 h-4 text-pink-400" />
            <span>Match summary copied! Send it to your partner.</span>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            id="share-match-button"
            type="button"
            onClick={handleShareMatch}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Your Match</span>
          </button>

          <Link
            to="/create"
            id="invite-someone-else-link"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl glass-card hover:bg-purple-900/40 text-purple-200 font-semibold text-sm flex items-center justify-center gap-2 border border-purple-500/30 transition-all"
          >
            <UserPlus className="w-4 h-4 text-purple-400" />
            <span>Invite Someone Else</span>
          </Link>
        </div>
      </section>

      {/* MONETIZATION SECTION */}
      <section className="space-y-6">
        <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-purple-950/40 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)] text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Live Astrologer Consultation</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Go Beyond the Score
          </h2>
          <p className="text-xs sm:text-sm text-amber-200/90 max-w-xl mx-auto leading-relaxed">
            {MONETIZATION_CONSTANTS.CONSULTATION_SUBTITLE}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-amber-500/30 bg-purple-950/20 space-y-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">Exclusive Joint Session</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {MONETIZATION_CONSTANTS.CONSULTATION_TITLE}
              </h3>
            </div>
            
            <div className="px-5 py-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-center shrink-0">
              <span className="text-xs text-amber-300/80 block font-medium">Session Price</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                {MONETIZATION_CONSTANTS.CONSULTATION_PRICE}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {MONETIZATION_CONSTANTS.CONSULTATION_FEATURES.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-purple-200">
                <div className="p-1 rounded-md bg-amber-950/60 border border-amber-500/40 text-amber-400 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="leading-snug">{feat}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              id="book-deep-dive-button"
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Book Our Deep Dive ({MONETIZATION_CONSTANTS.CONSULTATION_PRICE})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ASK THE STARS — CHAT PANEL */}
      {result && personA && personB && (
        <section className="space-y-0">
          {/* Collapsed Header Toggle */}
          <button
            id="ask-stars-toggle"
            type="button"
            onClick={() => setChatOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-4 rounded-2xl glass-card border border-purple-500/30 hover:border-pink-500/40 bg-gradient-to-r from-purple-950/60 to-pink-950/40 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(236,72,153,0.4)]">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white group-hover:text-pink-200 transition-colors">💬 Ask the Stars</p>
                <p className="text-[11px] text-purple-300/70">Chat with your AI astrology guide about this pairing</p>
              </div>
            </div>
            {chatOpen ? (
              <ChevronUp className="w-5 h-5 text-purple-400 group-hover:text-pink-300 transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-purple-400 group-hover:text-pink-300 transition-colors" />
            )}
          </button>

          {/* Expanded Chat Panel */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                key="chat-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-2 glass-card rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/60 to-cosmic-bg/80 flex flex-col" style={{ maxHeight: '420px' }}>

                  {/* Message list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[160px]">
                    {chatMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full py-6 text-center space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-700 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-purple-300/70 max-w-xs">
                          Ask me anything about {personA.name} &amp; {personB.name}'s compatibility — signs, dynamics, advice...
                        </p>
                      </div>
                    )}

                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-sm'
                              : 'bg-purple-950/80 border border-purple-500/20 text-purple-100 rounded-tl-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-purple-950/80 border border-purple-500/20 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}

                    {/* Inline error */}
                    {chatError && (
                      <div className="flex justify-center">
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{chatError}</span>
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Input row */}
                  <div className="p-3 border-t border-purple-900/40">
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const msg = chatInput.trim();
                        if (!msg || chatLoading) return;

                        const userMsg = { role: 'user' as const, text: msg };
                        const nextHistory = [...chatMessages, userMsg];
                        setChatMessages(nextHistory);
                        setChatInput('');
                        setChatLoading(true);
                        setChatError(null);

                        // Scroll to bottom
                        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

                        try {
                          const response = await fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              message: msg,
                              personAName: personA.name,
                              personBName: personB.name,
                              personAZodiac: {
                                name: result.personAZodiac.name,
                                symbol: result.personAZodiac.symbol,
                                element: result.personAZodiac.element,
                                modality: result.personAZodiac.modality,
                              },
                              personBZodiac: {
                                name: result.personBZodiac.name,
                                symbol: result.personBZodiac.symbol,
                                element: result.personBZodiac.element,
                                modality: result.personBZodiac.modality,
                              },
                              overallScore: result.overallScore,
                              categories: result.categories,
                              signals: result.signals,
                              strengths: result.strengths,
                              challenges: result.challenges,
                              // Send last 6 messages as rolling context (not including the one just sent)
                              history: chatMessages.slice(-6),
                            }),
                          });

                          if (!response.ok) {
                            throw new Error('non-ok response');
                          }

                          const data = await response.json();
                          if (data?.reply) {
                            setChatMessages((prev) => [
                              ...prev,
                              { role: 'model', text: data.reply },
                            ]);
                          }
                        } catch {
                          setChatError('The stars are quiet right now — try again in a moment.');
                        } finally {
                          setChatLoading(false);
                          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        id="chat-input"
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        disabled={chatLoading}
                        placeholder="Ask about their signs, dynamics, advice…"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-cosmic-bg border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      />
                      <button
                        id="chat-send-button"
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_12px_rgba(236,72,153,0.3)] flex items-center justify-center shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* CHECKOUT / CONSULTATION BOOKING MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-lg rounded-2xl border border-purple-500/40 p-6 sm:p-8 space-y-6 relative shadow-[0_0_50px_rgba(168,85,247,0.3)] bg-cosmic-bg/95 max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-800/40 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {!bookingConfirmed ? (
                <form onSubmit={handleProceedPayment} className="space-y-6">
                  <div className="space-y-1 pr-8">
                    <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Checkout &bull; Instant Slot Booking</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Book Your AstroLive Joint Session
                    </h3>
                    <p className="text-xs text-purple-300/70">
                      Pair: {personA.name} &times; {personB.name} &bull; 20 Mins &bull; Total: <span className="text-amber-300 font-bold">{MONETIZATION_CONSTANTS.CONSULTATION_PRICE}</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider">
                      Live Astrologers Available Now
                    </label>
                    <div className="space-y-2.5">
                      {MONETIZATION_CONSTANTS.LIVE_ASTROLOGERS.map((astro) => {
                        const isSelected = selectedAstrologer === astro.id;
                        return (
                          <div
                            key={astro.id}
                            onClick={() => setSelectedAstrologer(astro.id)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-amber-950/40 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                : 'bg-purple-950/40 border-purple-500/20 text-purple-200/80 hover:border-purple-400/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                                <UserCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-white">{astro.name}</h4>
                                <p className="text-[11px] text-purple-300/70">{astro.specialization}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30 shrink-0">
                              {astro.rating}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-input" className="block text-xs font-semibold text-purple-200 uppercase tracking-wider">
                      WhatsApp or Email for Session Link <span className="text-pink-400">*</span>
                    </label>
                    <input
                      id="contact-input"
                      type="text"
                      value={contactInput}
                      onChange={(e) => setContactInput(e.target.value)}
                      placeholder="e.g. +91 9876543210 or name@example.com"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-cosmic-bg border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 text-xs sm:text-sm"
                    />
                  </div>

                  <button
                    id="proceed-payment-button"
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all"
                  >
                    <span>Proceed to Payment ({MONETIZATION_CONSTANTS.CONSULTATION_PRICE})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center mx-auto text-white shadow-[0_0_25px_rgba(34,197,94,0.4)]">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-2 max-w-sm mx-auto">
                    <h3 className="text-2xl font-extrabold text-white tracking-tight">
                      Thanks &mdash; we'll be in touch!
                    </h3>
                    <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
                      Your joint consultation request for <strong className="text-amber-300">{personA.name} &amp; {personB.name}</strong> has been logged. Our live astrologer team will reach out via WhatsApp/Email shortly with your private video room link.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs text-purple-300 flex items-center justify-center gap-2 max-w-xs mx-auto">
                    <MessageCircle className="w-4 h-4 text-amber-400" />
                    <span>Confirmation sent to {contactInput || 'your contact'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full py-3.5 rounded-xl bg-purple-900/60 border border-purple-500/40 hover:bg-purple-800/60 text-white font-semibold text-sm transition-all"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
