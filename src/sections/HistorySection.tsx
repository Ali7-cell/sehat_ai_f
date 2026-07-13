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
      case 'Mild': return <CheckCircle className="w-4 h-4 text-emerald" />;
      case 'Moderate': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'Severe': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <CheckCircle className="w-4 h-4 text-emerald" />;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'Mild': return 'bg-emerald/10 border-emerald/20';
      case 'Moderate': return 'bg-amber-500/10 border-amber-500/20';
      case 'Severe': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-emerald/10 border-emerald/20';
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
      className="relative w-full py-20 bg-dark-void"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12 history-animate">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-mint" />
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-mint">
              Session History
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
            Your <span className="text-mint">Consultations</span>
          </h2>
          <p className="font-body text-white/60 max-w-lg mx-auto">
            Review your past symptom checks and diagnosis history.
          </p>
        </div>

        {/* Search and Refresh */}
        <div className="flex gap-4 mb-8 history-animate max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search your history..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-mint/50 transition-all duration-300 text-sm"
            />
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-3 rounded-xl bg-emerald/20 text-emerald border border-emerald/30 hover:bg-emerald/30 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* History List */}
        <div className="max-w-3xl mx-auto history-animate">
          {filteredHistory.length === 0 ? (
            <div className="glass-dark rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white/30" />
              </div>
              <h3 className="font-heading text-lg text-white mb-2">
                {searchTerm ? 'No matching results' : 'No history yet'}
              </h3>
              <p className="text-sm text-white/40">
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
                  className={`glass-dark rounded-xl p-5 border transition-all duration-300 hover:border-mint/30 hover:bg-mint/5 cursor-pointer group`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${getSeverityBg(item.severity)} text-white/80`}>
                          {item.severity}
                        </span>
                        <span className="text-[10px] text-white/30 font-mono">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 font-urdu mb-1 truncate">{item.user_input}</p>
                      <p className="text-xs text-mint/70">{item.xgb_prediction}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getSeverityIcon(item.severity)}
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-mint/60 transition-colors" />
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
