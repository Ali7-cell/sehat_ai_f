import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import MetaballCore from '@/components/MetaballCore';
import { Stethoscope } from 'lucide-react';

interface HeroProps {
  onStartChat: () => void;
}

// ── Sections in page order ─────────────────────────────────────────────────
const PAGES = [
  { id: 'hero',        label: 'Home' },
  { id: 'chat',        label: 'Chat' },
  { id: 'history',     label: 'History' },
  { id: 'specialties', label: 'About' },
];

function navigateTo(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Hero({ onStartChat }: HeroProps) {
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLButtonElement>(null);
  const badgesRef   = useRef<HTMLDivElement>(null);
  const eyebrowRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    if (eyebrowRef.current)
      tl.fromTo(eyebrowRef.current,  { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    if (titleRef.current)
      tl.fromTo(titleRef.current,    { opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.8, ease: 'power3.out' }, '-=0.3');
    if (subtitleRef.current)
      tl.fromTo(subtitleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
    if (ctaRef.current)
      tl.fromTo(ctaRef.current,      { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.3');
    if (badgesRef.current)
      tl.fromTo(badgesRef.current,   { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2');

    return () => { tl.kill(); };
  }, []);

  return (
    <section id="hero" className="relative w-full h-screen overflow-hidden bg-dark-void">
      <MetaballCore />

      {/* ── Content overlay ── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left side — metaball canvas space */}
            <div className="hidden lg:block" />

            {/* Right side — text */}
            <div className="flex flex-col items-start text-left">
              {/* Eyebrow */}
              <div ref={eyebrowRef} className="flex items-center gap-2 mb-6 opacity-0">
                <Stethoscope className="w-4 h-4 text-mint" />
                <span className="font-mono text-xs uppercase tracking-[0.1em] text-mint">
                  Multilingual AI Health Companion
                </span>
              </div>

              {/* Title */}
              <h1
                ref={titleRef}
                className="font-display font-light text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6 text-glow opacity-0"
              >
                <span className="text-mint">Sehat AI</span>
              </h1>

              {/* Subtitle */}
              <p ref={subtitleRef} className="font-body text-lg text-white/80 max-w-md mb-8 opacity-0">
                Speak to Sehat AI in Urdu, Roman Urdu, or English. Describe your symptoms naturally — our AI understands, translates, and guides you toward better health.
              </p>

              {/* CTA */}
              <button
                ref={ctaRef}
                onClick={onStartChat}
                className="group flex items-center gap-3 px-8 py-4 bg-emerald text-white rounded-full font-heading font-medium text-base transition-all duration-300 hover:scale-105 hover:shadow-glow-lg opacity-0"
              >
                <MessageSquareIcon className="w-5 h-5" />
                Start Consultation
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>

              {/* Language badges */}
              <div ref={badgesRef} className="flex flex-wrap gap-3 mt-8 opacity-0">
                <span className="glass px-4 py-2 rounded-full text-sm text-white/80 font-urdu">اردو</span>
                <span className="glass px-4 py-2 rounded-full text-sm text-white/80">Roman Urdu</span>
                <span className="glass px-4 py-2 rounded-full text-sm text-white/80">English</span>
                <span className="flex items-center gap-1.5 text-xs text-mint/80 ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                  Supported
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE: Vertical page-dot nav (click to jump) ── */}
      <nav
        aria-label="Page navigation"
        className="absolute right-5 md:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4"
      >
        {PAGES.map((page, idx) => (
          <button
            key={page.id}
            onClick={() => navigateTo(page.id)}
            title={page.label}
            aria-label={`Go to ${page.label}`}
            className={`group relative flex items-center justify-end gap-2 transition-all duration-300`}
          >
            {/* Tooltip label — visible on hover */}
            <span className="absolute right-6 whitespace-nowrap text-xs font-mono text-mint/80 bg-dark-void/80 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-mint/20">
              {page.label}
            </span>

            {/* Dot */}
            <span
              className={`
                block rounded-full border transition-all duration-300
                ${idx === 0
                  ? 'w-3 h-3 bg-mint border-mint shadow-[0_0_8px_rgba(116,198,157,0.8)]'           /* active = hero */
                  : 'w-2 h-2 bg-transparent border-mint/40 group-hover:border-mint group-hover:bg-mint/40'
                }
              `}
            />
          </button>
        ))}
      </nav>

      {/* ── BOTTOM: Animated "go to next section" click arrow ── */}
      <button
        onClick={() => navigateTo('chat')}
        aria-label="Go to Chat section"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 group"
      >
        {/* Pulsing ring */}
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-mint/30 bg-white/5 backdrop-blur-sm group-hover:border-mint/70 group-hover:bg-mint/10 transition-all duration-300">
          <span className="absolute inset-0 rounded-full border border-mint/20 animate-ping opacity-50" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-mint animate-bounce"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
        <span className="text-[10px] font-mono text-mint/50 group-hover:text-mint/80 transition-colors uppercase tracking-widest">
          Chat
        </span>
      </button>
    </section>
  );
}

function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
