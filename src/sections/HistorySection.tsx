import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { HistoryItem } from '@/types/api';
import { Clock, Search, ChevronRight, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HistorySectionProps {
  history: HistoryItem[];
  loading: boolean;
  onRefresh: () => void;
}

export default function HistorySection({ history, loading, onRefresh }: HistorySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.history-animate',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Mild': return <CheckCircle className="w-4 h-4 text-[#10a37f]" />;
      case 'Moderate': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'Severe': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle className="w-4 h-4 text-[#10a37f]" />;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'Mild':     return 'bg-[#10a37f]/10 border-[#10a37f]/20 text-[#10a37f] dark:bg-emerald/10 dark:border-emerald/20 dark:text-emerald';
      case 'Moderate': return 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400';
      case 'Severe':   return 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400';
      default:         return 'bg-[#10a37f]/10 border-[#10a37f]/20 text-[#10a37f]';
    }
  };

  const filteredHistory = history.filter(item =>
    item.user_input.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.xgb_prediction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section
      id="history"
      ref={sectionRef}
      className="relative w-full py-20 bg-white dark:bg-[#0a140f] transition-colors duration-300"
    >
      {/* Subtle light mode tint */}
      <div className="absolute inset-0 pointer-events-none dark:hidden bg-gradient-to-b from-[#f0fdf9]/40 via-white to-[#f0fdf9]/40" />
      {/* Dark mode gradient */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block bg-gradient-to-b from-[#0a140f] via-[#0d1f17] to-[#0a140f]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12 history-animate">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#10a37f] dark:text-mint" />
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#10a37f] dark:text-mint">
              Session History
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 dark:text-white mb-4">
            Your <span className="text-[#10a37f] dark:text-mint">Consultations</span>
          </h2>
          <p className="font-body text-gray-500 dark:text-white/60 max-w-lg mx-auto">
            Review your past symptom checks and diagnosis history.
          </p>
        </div>

        {/* Search and Refresh */}
        <div className="flex gap-4 mb-8 history-animate max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search your history..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#10a37f]/50 dark:focus:border-mint/50 focus:ring-2 focus:ring-[#10a37f]/10 dark:focus:ring-mint/10 transition-all duration-300 text-sm shadow-sm dark:shadow-none"
            />
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-3 rounded-xl bg-[#10a37f]/10 dark:bg-emerald/20 text-[#10a37f] dark:text-emerald border border-[#10a37f]/25 dark:border-emerald/30 hover:bg-[#10a37f]/20 dark:hover:bg-emerald/30 transition-all duration-300 disabled:opacity-50 shadow-sm dark:shadow-none"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* History List */}
        <div className="max-w-3xl mx-auto history-animate">
          {filteredHistory.length === 0 ? (
            <div className="rounded-2xl p-12 text-center bg-white dark:bg-transparent border border-gray-100 dark:border-transparent shadow-md dark:shadow-none dark:glass-dark">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-300 dark:text-white/30" />
              </div>
              <h3 className="font-heading text-lg text-gray-800 dark:text-white mb-2">
                {searchTerm ? 'No matching results' : 'No history yet'}
              </h3>
              <p className="text-sm text-gray-400 dark:text-white/40">
                {searchTerm
                  ? 'Try a different search term'
                  : 'Your consultation history will appear here after your first checkup.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map(item => (
                <div
                  key={item.id}
                  className="rounded-xl p-5 border transition-all duration-300 cursor-pointer group bg-white dark:bg-transparent border-gray-100 dark:border-white/10 hover:border-[#10a37f]/30 dark:hover:border-mint/30 hover:shadow-md dark:hover:bg-mint/5 shadow-sm dark:shadow-none"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getSeverityBg(item.severity)}`}>
                          {item.severity}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-white/30 font-mono">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-white/80 font-urdu mb-1 truncate">{item.user_input}</p>
                      <p className="text-xs text-[#10a37f] dark:text-mint/70">{item.xgb_prediction}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getSeverityIcon(item.severity)}
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-white/20 group-hover:text-[#10a37f] dark:group-hover:text-mint/60 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
