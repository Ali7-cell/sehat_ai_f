import { useState, useCallback } from 'react';
import type { PredictRequest, PredictResponse, FeedbackRequest, HistoryItem } from '@/types/api';

const API_BASE = 'https://alee-7-healhtchatbot.hf.space';
export { API_BASE };

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (data: PredictRequest): Promise<PredictResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/predict/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          accumulated_symptoms: data.accumulated_symptoms ?? [],
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return await res.json();
    } catch (err: any) {
      setError(err.message || 'Failed to get prediction');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);


  const submitFeedback = useCallback(async (data: FeedbackRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/feedback/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistory = useCallback(async (sessionId: string, limit: number = 20): Promise<HistoryItem[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/history/?session_id=${encodeURIComponent(sessionId)}&limit=${limit}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return await res.json();
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const transcribeAudio = useCallback(
    async (formData: FormData): Promise<{ text: string; audio_url: string; duration: number } | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/transcribe/`, {
          method: 'POST',
          body: formData, // no Content-Type header — browser sets multipart boundary
        });
        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          throw new Error(detail?.detail || `API error: ${res.status}`);
        }
        return await res.json();
      } catch (err: any) {
        setError(err.message || 'Failed to transcribe audio');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getSymptomTranslations = useCallback(async (): Promise<Record<string, { en: string; ur: string; roman: string }> | null> => {
    try {
      const res = await fetch(`${API_BASE}/predict/translations`, { method: 'GET' });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error('Failed to load translations', err);
      return null;
    }
  }, []);

  return { predict, submitFeedback, getHistory, checkHealth, transcribeAudio, getSymptomTranslations, loading, error };
}
