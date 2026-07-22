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
    { id: 'hero',        label: 'Home',    icon: Home },
    { id: 'chat',        label: 'Chat',    icon: MessageSquare },
    { id: 'history',     label: 'History', icon: History },
    { id: 'specialties', label: 'About',   icon: Info },
  ];

  const isDark = theme === 'dark';

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        scrolled ? 'top-2 scale-[0.97]' : 'top-4 scale-100'
      }`}
    >
      <div
        className={`flex items-center gap-1 px-2 py-1.5 rounded-full transition-all duration-500 ${
          isDark
            ? 'bg-[#0d1f17]/90 border border-[#74c69d]/12 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
            : 'bg-white/95 border border-[#10a37f]/15 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(16,163,127,0.06)]'
        }`}
      >
        {/* Logo */}
        <button
          onClick={() => onNavigate('hero')}
          title="Sehat AI — Home"
          className="flex items-center px-2 py-1.5 mr-1 group"
        >
          <div className={`relative flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-300 ${
            isDark
              ? 'border-[#74c69d]/30 shadow-[0_0_15px_rgba(116,198,157,0.2)] bg-gradient-to-br from-[#0a140f] to-[#1a3a2e] group-hover:border-[#74c69d]/60 group-hover:shadow-[0_0_22px_rgba(116,198,157,0.4)]'
              : 'border-[#10a37f]/30 shadow-[0_0_12px_rgba(16,163,127,0.15)] bg-gradient-to-br from-white to-[#f0fdf9] group-hover:border-[#10a37f]/60 group-hover:shadow-[0_0_20px_rgba(16,163,127,0.3)]'
          }`}>
            <svg viewBox="0 0 24 24" fill="none" className={`absolute w-full h-full opacity-30 animate-[spin_18s_linear_infinite] ${isDark ? 'text-[#74c69d]' : 'text-[#10a37f]'}`}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1"/>
              <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1"/>
              <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1"/>
            </svg>
            <span className={`relative z-10 font-heading font-black text-[13px] leading-none tracking-tighter transition-colors drop-shadow ${
              isDark ? 'text-[#74c69d] group-hover:text-[#a7e3bf]' : 'text-[#10a37f] group-hover:text-[#059669]'
            }`}>
              SA
            </span>
          </div>
        </button>

        {/* Nav Links */}
        {navLinks.map(link => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className={`group relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-body font-medium transition-all duration-200 overflow-hidden ${
              isDark
                ? 'text-white/60 hover:text-[#74c69d] hover:bg-[#74c69d]/10 active:scale-95'
                : 'text-gray-500 hover:text-[#10a37f] hover:bg-[#10a37f]/08 active:scale-95'
            }`}
          >
            <link.icon className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{link.label}</span>
          </button>
        ))}

        {/* Divider */}
        <div className={`w-px h-5 mx-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 group ${
            isDark
              ? 'bg-[#74c69d]/10 text-[#74c69d] hover:bg-[#74c69d]/20 hover:scale-110 active:scale-95'
              : 'bg-[#10a37f]/08 text-[#10a37f] hover:bg-[#10a37f]/15 hover:scale-110 active:scale-95'
          }`}
        >
          {isDark
            ? <Sun className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            : <Moon className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-300" />
          }
        </button>
      </div>
    </nav>
  );
}
