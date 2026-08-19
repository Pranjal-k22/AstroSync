import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-purple-900/40 bg-cosmic-bg/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-cosmic-glow group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-200 via-pink-300 to-purple-400 bg-clip-text text-transparent">
            AstroSync
          </span>
        </Link>
        
        {/* Minimal indicator tag for prototype */}
        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-medium tracking-wide">
          Prototype
        </span>
      </div>
    </header>
  );
};
