import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Share2, Check, ArrowRight, Calendar, Clock, Heart } from 'lucide-react';
import type { RelationshipIntent, UserProfile } from '../types';
import { encodeBase64Data } from '../utils';

const INTENT_OPTIONS: { label: RelationshipIntent; emoji: string }[] = [
  { label: 'Partner', emoji: '💖' },
  { label: 'Crush', emoji: '✨' },
  { label: 'Friend', emoji: '🤝' },
  { label: "It's Complicated", emoji: '🌀' },
];

export const CreateProfilePage: React.FC = () => {
  // Form field state
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [intent, setIntent] = useState<RelationshipIntent | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result state
  const [submitted, setSubmitted] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [canShareNative, setCanShareNative] = useState(false);

  // Check navigator.share availability on mount
  React.useEffect(() => {
    if (typeof navigator !== 'undefined' && !!navigator.share) {
      setCanShareNative(true);
    }
  }, []);

  // Validation
  const isValid = name.trim().length > 0 && birthDate !== '' && birthTime !== '' && intent !== '' && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);

    const personAData: UserProfile = {
      name: name.trim(),
      birthDate,
      birthTime,
      intent: intent as RelationshipIntent,
    };

    // Store in localStorage
    try {
      localStorage.setItem('astrosync_person_a', JSON.stringify(personAData));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }

    // Encode to base64 URL parameter
    const encoded = encodeBase64Data(personAData);
    const generatedUrl = `${window.location.origin}/invite?u1=${encoded}`;

    setShareUrl(generatedUrl);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleNativeShare = async () => {
    if (canShareNative && shareUrl) {
      try {
        await navigator.share({
          title: 'AstroSync Compatibility Invite',
          text: `${name.trim()} invited you to discover your cosmic compatibility!`,
          url: shareUrl,
        });
      } catch (err) {
        console.warn('Share cancelled or unavailable, falling back to copy:', err);
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 px-4 space-y-8 overflow-x-hidden">
      {/* HEADER */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Step 1 of 2 &bull; Person A Setup</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {submitted ? 'Invite Generated!' : 'Create Your Cosmic Profile'}
        </h1>
        <p className="text-sm sm:text-base text-purple-200/70 max-w-md mx-auto">
          {submitted
            ? 'Your planetary parameters have been locked. Share the link below to invite Person B.'
            : 'Enter your birth details so AstroSync can plot your planetary coordinates.'}
        </p>
      </div>

      {/* FORM CARD */}
      {!submitted ? (
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] space-y-6"
        >
          {/* First Name */}
          <div className="space-y-2">
            <label htmlFor="first-name-input" className="block text-xs font-semibold text-purple-200 uppercase tracking-wider">
              First Name <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <input
                id="first-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                required
                className="w-full px-4 py-3 rounded-xl bg-cosmic-bg/80 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="space-y-2">
              <label htmlFor="dob-input" className="block text-xs font-semibold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Date of Birth <span className="text-pink-400">*</span></span>
              </label>
              <input
                id="dob-input"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-cosmic-bg/80 border border-purple-500/30 text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all text-sm color-scheme-dark"
              />
            </div>

            {/* Time of Birth */}
            <div className="space-y-2">
              <label htmlFor="tob-input" className="block text-xs font-semibold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Time of Birth <span className="text-pink-400">*</span></span>
              </label>
              <input
                id="tob-input"
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-cosmic-bg/80 border border-purple-500/30 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all text-sm color-scheme-dark"
              />
            </div>
          </div>

          {/* Relationship Intent */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              <span>Relationship Intent <span className="text-pink-400">*</span></span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {INTENT_OPTIONS.map((opt) => {
                const isSelected = intent === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setIntent(opt.label)}
                    className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)] scale-[1.02]'
                        : 'bg-purple-950/40 border-purple-500/20 text-purple-200/80 hover:border-purple-400/50 hover:bg-purple-900/30'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="submit-profile-button"
              type="submit"
              disabled={!isValid}
              className={`w-full py-4 rounded-xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2 transition-all ${
                isValid
                  ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transform hover:-translate-y-0.5'
                  : 'bg-purple-950/40 border border-purple-900/50 text-purple-400/40 cursor-not-allowed opacity-60'
              }`}
            >
              <span>{isSubmitting ? 'Generating Link...' : 'Generate Invite Link'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.form>
      ) : (
        /* SUCCESS SCREEN */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-purple-500/30 shadow-[0_0_35px_rgba(168,85,247,0.25)] space-y-6 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center mx-auto text-white shadow-cosmic-glow">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Your stars are ready. Now we need theirs.
            </h2>
            <p className="text-sm text-purple-200/80 leading-relaxed max-w-md mx-auto">
              Compatibility reports require two people. Share your link with {name}'s {intent.toLowerCase()} to reveal your cosmic synergy.
            </p>
          </div>

          {/* READ-ONLY LINK DISPLAY */}
          <div className="space-y-2 text-left">
            <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Shareable Invite URL
            </label>
            <div className="flex items-center gap-2">
              <input
                id="shareable-url-input"
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-4 py-3 rounded-xl bg-cosmic-bg/90 border border-purple-500/40 text-purple-200 text-xs sm:text-sm font-mono focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-3 rounded-xl bg-purple-900/60 border border-purple-500/40 hover:bg-purple-800/60 text-purple-200 hover:text-white transition-all flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span className="text-xs font-semibold hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* TOAST CONFIRMATION */}
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-purple-950/90 border border-pink-500/50 text-pink-300 text-xs font-medium flex items-center justify-center gap-2 shadow-pink-glow"
            >
              <Check className="w-4 h-4 text-pink-400" />
              <span>Link copied! Send it to your partner.</span>
            </motion.div>
          )}

          {/* BUTTON ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              id="copy-share-button"
              type="button"
              onClick={handleNativeShare}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
            >
              {canShareNative ? <Share2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{canShareNative ? 'Share Invite Link' : 'Copy Invite Link'}</span>
            </button>

            <Link
              to={shareUrl.replace(window.location.origin, '')}
              id="preview-invite-link"
              className="py-3.5 px-6 rounded-xl glass-card hover:bg-purple-900/40 text-purple-200 font-semibold text-sm flex items-center justify-center gap-2 border border-purple-500/30 transition-all"
            >
              <span>Preview Invite Page</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};
