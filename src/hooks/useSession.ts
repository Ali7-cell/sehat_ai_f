import { useState, useCallback, useEffect } from 'react';

const SESSION_KEY = 'sehat_session_id';

function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function useSession() {
  const [sessionId, setSessionId] = useState<string>(() => {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = generateSessionId();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  });

  const resetSession = useCallback(() => {
    const newId = generateSessionId();
    localStorage.setItem(SESSION_KEY, newId);
    setSessionId(newId);
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        setSessionId(e.newValue || generateSessionId());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { sessionId, resetSession };
}
