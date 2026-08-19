import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-cosmic-bg text-cosmic-text stars-bg flex flex-col relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-600/5 blur-[150px] rounded-full pointer-events-none" />

      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 relative z-10">
        {children}
      </main>

      <footer className="w-full py-6 text-center text-xs text-cosmic-muted border-t border-purple-900/20 relative z-10">
        <p>AstroSync &copy; {new Date().getFullYear()} &bull; Social Astrology Compatibility Prototype</p>
      </footer>
    </div>
  );
};
