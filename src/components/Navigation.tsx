import { useState, useEffect } from 'react';
import { Moon, Sun, MessageSquare, History, Home, Info } from 'lucide-react';

interface NavigationProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onNavigate: (section: string) => void;
}

export default function Navigation({ theme, toggleTheme, onNavigate }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'history', label: 'History', icon: History },
    { id: 'specialties', label: 'About', icon: Info },
  ];

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        scrolled
          ? 'top-2 scale-[0.95] shadow-lg shadow-emerald/10'
          : 'top-4 scale-100'
      }`}
    >
      <div
        className={`flex items-center gap-1 px-2 py-2 rounded-full transition-all duration-500 ${
          theme === 'dark'
            ? 'bg-deep/80 border border-mint/10 backdrop-blur-xl'
            : 'bg-white/80 border border-emerald/10 backdrop-blur-xl'
        }`}
      >
        {/* Logo — globe icon only, no text label */}
        <button
          onClick={() => onNavigate('hero')}
          title="Sehat AI — Home"
          className="flex items-center px-2 py-1.5 mr-2 group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full border border-emerald/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-gradient-to-br from-dark-void to-deep group-hover:border-emerald/60 group-hover:shadow-[0_0_22px_rgba(16,185,129,0.4)] transition-all duration-300">
            {/* Slowly-spinning globe lines */}
            <svg viewBox="0 0 24 24" fill="none" className="absolute w-full h-full text-emerald opacity-35 animate-[spin_18s_linear_infinite]">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1"/>
              <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1"/>
              <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1"/>
            </svg>
            {/* SA inside the globe */}
            <span className="relative z-10 font-heading font-black text-[13px] leading-none text-emerald group-hover:text-mint tracking-tighter transition-colors drop-shadow">
              SA
            </span>
          </div>
        </button>


        {/* Nav Links */}
        {navLinks.map(link => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className={`group relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-300 overflow-hidden ${
              theme === 'dark'
                ? 'text-cream/70 hover:text-mint hover:bg-mint/10'
                : 'text-deep/70 hover:text-emerald hover:bg-emerald/10'
            }`}
          >
            <link.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{link.label}</span>
          </button>
        ))}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center justify-center w-9 h-9 rounded-full ml-2 transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-mint/10 text-mint hover:bg-mint/20'
              : 'bg-emerald/10 text-emerald hover:bg-emerald/20'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );
}
