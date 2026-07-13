import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/sections/Hero';
import ChatInterface from '@/sections/ChatInterface';
import HistorySection from '@/sections/HistorySection';
import SpecialtiesSection from '@/sections/SpecialtiesSection';
import Footer from '@/sections/Footer';
import { useTheme } from '@/hooks/useTheme';
import { useSession } from '@/hooks/useSession';
import { useApi } from '@/hooks/useApi';
import type { HistoryItem } from '@/types/api';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { sessionId } = useSession();
  const { getHistory } = useApi();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartChat = () => {
    handleNavigate('chat');
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Navigation
        theme={theme}
        toggleTheme={toggleTheme}
        onNavigate={handleNavigate}
      />
      <main className="min-h-screen">
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
    </div>
  );
}
