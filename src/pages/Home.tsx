import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/sections/Hero';
import ChatInterface from '@/sections/ChatInterface';
import HistorySection from '@/sections/HistorySection';
import SpecialtiesSection from '@/sections/SpecialtiesSection';
import Footer from '@/sections/Footer';
import DiseasesPage from '@/sections/DiseasesPage';
import { useTheme } from '@/hooks/useTheme';
import { useSession } from '@/hooks/useSession';
import { useApi } from '@/hooks/useApi';
import type { HistoryItem } from '@/types/api';

type Page = 'home' | 'diseases';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { sessionId } = useSession();
  const { getHistory } = useApi();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // ── On mount: scroll to hero (top) ──
  useEffect(() => {
    if (currentPage === 'home') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      const t = setTimeout(() => {
        const heroEl = document.getElementById('hero');
        if (heroEl) heroEl.scrollIntoView({ behavior: 'instant', block: 'start' });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [currentPage]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    const data = await getHistory(sessionId, 20);
    setHistory(data);
    setHistoryLoading(false);
  }, [getHistory, sessionId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleNavigate = (section: string) => {
    // 'diseases' nav item → switch to diseases page
    if (section === 'diseases') {
      setCurrentPage('diseases');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Back to main home page first, then scroll
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartChat = () => {
    handleNavigate('chat');
  };

  const handleBackFromDiseases = () => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Navigation
        theme={theme}
        toggleTheme={toggleTheme}
        onNavigate={handleNavigate}
      />

      {/* ── Diseases Page ── */}
      {currentPage === 'diseases' && (
        <DiseasesPage theme={theme} onBack={handleBackFromDiseases} />
      )}

      {/* ── Main Home Page ── */}
      {currentPage === 'home' && (
        <main className={`min-h-screen transition-colors duration-300 ${
          theme === 'dark' ? 'bg-[#0a140f]' : 'bg-white'
        }`}>
          <Hero onStartChat={handleStartChat} />
          <ChatInterface
            historyItems={history}
            onHistoryUpdate={fetchHistory}
          />
          <HistorySection
            history={history}
            loading={historyLoading}
            onRefresh={fetchHistory}
          />
          <SpecialtiesSection />
          <Footer onStartChat={handleStartChat} />
        </main>
      )}
    </div>
  );
}
