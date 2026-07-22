import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageSquare, ExternalLink } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface FooterProps {
  onStartChat: () => void;
}

export default function Footer({ onStartChat }: FooterProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.footer-animate',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={sectionRef}
      className="relative w-full py-24 bg-gradient-to-b from-[#1a3a2e] to-[#0a140f] dark:from-deep dark:to-dark-void"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Main CTA */}
        <div className="text-center mb-20 footer-animate">
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-white mb-8 leading-tight">
            Your Health,
            <br />
            <span className="text-[#74c69d]">Your Language</span>
          </h2>
          <button
            onClick={onStartChat}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-[#10a37f] hover:bg-[#0d9571] text-white rounded-full font-heading font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(16,163,127,0.5)] shadow-[0_4px_20px_rgba(16,163,127,0.35)]"
          >
            <MessageSquare className="w-5 h-5" />
            Start Chatting Now
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 py-12 border-t border-white/10 footer-animate">
          {/* Product */}
          <div>
            <h4 className="font-heading text-sm font-medium text-white mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              {['Chat', 'History', 'About'].map(link => (
                <li key={link}>
                  <button
                    onClick={() => {
                      const el = document.getElementById(link.toLowerCase() === 'chat' ? 'chat' : link.toLowerCase() === 'history' ? 'history' : 'specialties');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-sm text-white/50 hover:text-mint transition-colors duration-300 flex items-center gap-1"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h4 className="font-heading text-sm font-medium text-white mb-4 uppercase tracking-wider">Languages</h4>
            <ul className="space-y-3">
              <li className="text-sm text-white/50 font-urdu">اردو</li>
              <li className="text-sm text-white/50">Roman Urdu</li>
              <li className="text-sm text-white/50">English</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading text-sm font-medium text-white mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service'].map(link => (
                <li key={link}>
                  <span className="text-sm text-white/50 hover:text-mint transition-colors duration-300 cursor-pointer flex items-center gap-1">
                    {link}
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 footer-animate">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-mint">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                fill="currentColor"
              />
            </svg>
            <span className="font-heading text-sm text-white/70">Sehat AI</span>
          </div>
          <p className="font-mono text-xs text-mint/60">
            © 2025 Sehat AI. Built for Pakistan.
          </p>
        </div>
      </div>
    </footer>
  );
}
