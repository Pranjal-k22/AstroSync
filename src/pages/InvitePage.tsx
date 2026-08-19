import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Clock, ArrowRight, AlertCircle, UserPlus, HeartHandshake } from 'lucide-react';
import type { UserProfile } from '../types';
import { decodeBase64Data } from '../utils';

export const InvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [personA, setPersonA] = useState<UserProfile | null>(null);
  const [invalidLink, setInvalidLink] = useState(false);

  // Person B form state
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const u1Param = searchParams.get('u1');
    if (!u1Param) {
      setInvalidLink(true);
      return;
    }

    const decoded = decodeBase64Data<UserProfile>(u1Param);
    if (!decoded || !decoded.name || !decoded.birthDate) {
      setInvalidLink(true);
    } else {
      setPersonA(decoded);
      setInvalidLink(false);
    }
  }, [searchParams]);

  // Input validation
  const isValid = name.trim().length > 0 && birthDate !== '' && birthTime !== '' && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !personA) return;

    setIsSubmitting(true);

    const personBData: UserProfile = {
      name: name.trim(),
      birthDate,
      birthTime,
    };

    try {
      // Save Person B data
      localStorage.setItem('astrosync_person_b', JSON.stringify(personBData));
      // Save Person A data (ensures both exist even if Person B navigated directly from share link)
      localStorage.setItem('astrosync_person_a', JSON.stringify(personA));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }

    // Short transition delay for responsive feel
    setTimeout(() => {
      navigate('/dashboard');
    }, 400);
  };

  // INVALID LINK STATE
  if (invalidLink) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-2xl border border-pink-500/30 text-center space-y-6 shadow-[0_0_30px_rgba(236,72,153,0.15)]"
        >
          <div className="w-14 h-14 rounded-2xl bg-pink-950/60 border border-pink-500/40 flex items-center justify-center mx-auto text-pink-400">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              This invite link looks invalid
            </h2>
            <p className="text-sm text-purple-200/80 leading-relaxed">
              We couldn't decode the cosmic coordinates from this link. It might be truncated or corrupted.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/create"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Your Own Profile</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // LOADING / INITIAL STATE
  if (!personA) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-purple-300">
        <Sparkles className="w-8 h-8 mx-auto animate-spin text-pink-400 mb-3" />
        <p className="text-sm font-medium">Aligning planetary coordinates...</p>
      </div>
    );
  }

  // VALID INVITE FORM STATE
  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 px-4 space-y-8">
      {/* PERSONALIZED GREETING */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/40 text-pink-300 text-xs font-semibold shadow-[0_0_15px_rgba(236,72,153,0.2)]">
          <HeartHandshake className="w-4 h-4 text-pink-400" />
          <span>Cosmic Compatibility Invitation</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent leading-tight">
          {personA.name} wants to see how your stars align. ✨
        </h1>

        <p className="text-sm sm:text-base text-purple-200/80 max-w-md mx-auto">
          {personA.name} invited you to complete your birth details to reveal your shared synastry and compatibility score
          {personA.intent ? ` as ${personA.intent === 'Partner' ? 'partners' : personA.intent.toLowerCase()}` : ''}.
        </p>
      </motion.div>

      {/* FORM CARD FOR PERSON B */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-purple-500/30 shadow-[0_0_35px_rgba(168,85,247,0.2)] space-y-6"
      >
        <div className="border-b border-purple-900/40 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Enter Person B Details</span>
          </h2>
          <p className="text-xs text-purple-300/70">
            Step 2 of 2 &bull; Your details are combined with {personA.name}'s coordinates to calculate compatibility.
          </p>
        </div>

        {/* First Name */}
        <div className="space-y-2">
          <label htmlFor="personb-name-input" className="block text-xs font-semibold text-purple-200 uppercase tracking-wider">
            First Name <span className="text-pink-400">*</span>
          </label>
          <input
            id="personb-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jordan"
            required
            className="w-full px-4 py-3 rounded-xl bg-cosmic-bg/80 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all text-sm sm:text-base"
          />
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date of Birth */}
          <div className="space-y-2">
            <label htmlFor="personb-dob-input" className="block text-xs font-semibold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Date of Birth <span className="text-pink-400">*</span></span>
            </label>
            <input
              id="personb-dob-input"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-cosmic-bg/80 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all text-sm color-scheme-dark"
            />
          </div>

          {/* Time of Birth */}
          <div className="space-y-2">
            <label htmlFor="personb-tob-input" className="block text-xs font-semibold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Time of Birth <span className="text-pink-400">*</span></span>
            </label>
            <input
              id="personb-tob-input"
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-cosmic-bg/80 border border-purple-500/30 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all text-sm color-scheme-dark"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            id="reveal-compatibility-button"
            type="submit"
            disabled={!isValid}
            className={`w-full py-4 rounded-xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2 transition-all ${
              isValid
                ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transform hover:-translate-y-0.5'
                : 'bg-purple-950/40 border border-purple-900/50 text-purple-400/40 cursor-not-allowed opacity-60'
            }`}
          >
            <span>{isSubmitting ? 'Calculating Compatibility...' : 'Reveal Our Compatibility'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.form>
    </div>
  );
};
