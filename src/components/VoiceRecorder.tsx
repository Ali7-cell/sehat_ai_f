import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Send, Trash2, Play, Pause, Loader2 } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface VoiceRecorderProps {
  /** Called with the Whisper-transcribed text when the user sends the recording */
  onTranscribed: (text: string) => void;
  /** Base URL of the backend API */
  apiBase?: string;
  /** UI language for labels */
  uiLanguage?: 'english' | 'roman' | 'urdu';
  /** Disabled while the chat is loading a prediction */
  disabled?: boolean;
}

type RecorderState = 'idle' | 'recording' | 'preview' | 'uploading';

// ── Bilingual labels ───────────────────────────────────────────────────────────
const LABELS = {
  english: {
    hold: 'Hold to record',
    recording: 'Recording…',
    preview: 'Preview — send or discard',
    uploading: 'Transcribing…',
    permissionError: 'Microphone permission denied. Please allow access and try again.',
    uploadError: 'Could not transcribe audio. Please try again.',
    emptyError: 'No audio recorded. Please hold the button and speak.',
    tooShort: 'Recording too short. Please speak for at least 1 second.',
  },
  roman: {
    hold: 'Record karne ke liye pakdein',
    recording: 'Recording ho rahi hai…',
    preview: 'Preview — bhejein ya mitaein',
    uploading: 'Transcribe ho raha hai…',
    permissionError: 'Microphone permission denied. Kripya access allow karein.',
    uploadError: 'Audio transcribe nahi ho saki. Dobara koshish karein.',
    emptyError: 'Koi audio record nahi hua. Button pakad kar bolein.',
    tooShort: 'Recording bahut choti hai. Kam az kam 1 second bolein.',
  },
  urdu: {
    hold: 'ریکارڈ کرنے کے لیے پکڑیں',
    recording: 'ریکارڈنگ ہو رہی ہے…',
    preview: 'پیش نظارہ — بھیجیں یا حذف کریں',
    uploading: 'ٹرانسکرائب ہو رہا ہے…',
    permissionError: 'مائیکروفون اجازت نہیں ملی۔ براہ کرم رسائی کی اجازت دیں۔',
    uploadError: 'آڈیو ٹرانسکرائب نہیں ہو سکی۔ دوبارہ کوشش کریں۔',
    emptyError: 'کوئی آڈیو ریکارڈ نہیں ہوئی۔ بٹن پکڑ کر بولیں۔',
    tooShort: 'ریکارڈنگ بہت چھوٹی ہے۔ کم از کم 1 سیکنڈ بولیں۔',
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function VoiceRecorder({
  onTranscribed,
  apiBase = 'https://alee-7-healhtchatbot.hf.space',
  uiLanguage = 'roman',
  disabled = false,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobEvent['data'][]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const t = LABELS[uiLanguage];

  // ── Clean up on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [audioUrl]);

  // ── Clear error after 5s ────────────────────────────────────────────────────
  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(null), 5000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  // ── Start recording ─────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    if (disabled || state !== 'idle') return;
    setErrorMsg(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErrorMsg(t.permissionError);
      return;
    }
    streamRef.current = stream;

    // Pick best supported mime
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', '']
      .find(m => !m || MediaRecorder.isTypeSupported(m)) ?? '';

    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime || 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
      setState('preview');
      stream.getTracks().forEach(track => track.stop());
    };

    recorder.start(100); // collect every 100 ms
    mediaRecorderRef.current = recorder;
    setElapsedSeconds(0);
    setState('recording');

    // Timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  }, [disabled, state, t.permissionError]);

  // ── Stop recording ──────────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
  }, []);

  // ── Discard ─────────────────────────────────────────────────────────────────
  const discard = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioElRef.current?.pause();
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setElapsedSeconds(0);
    setState('idle');
  }, [audioUrl]);

  // ── Play / Pause preview ────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const el = audioElRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // ── Upload & transcribe ─────────────────────────────────────────────────────
  const sendAudio = useCallback(async () => {
    if (!audioBlob) return;
    if (elapsedSeconds < 1) {
      setErrorMsg(t.tooShort);
      return;
    }

    setState('uploading');
    const formData = new FormData();
    const ext = audioBlob.type.includes('ogg') ? '.ogg' : '.webm';
    formData.append('audio', audioBlob, `recording${ext}`);

    try {
      const res = await fetch(`${apiBase}/transcribe/`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.detail || `Server error ${res.status}`);
      }

      const data: { text: string } = await res.json();

      if (!data.text?.trim()) {
        throw new Error(t.emptyError);
      }

      discard(); // reset recorder
      onTranscribed(data.text.trim());
    } catch (err: any) {
      setErrorMsg(err.message || t.uploadError);
      setState('preview'); // allow retry
    }
  }, [audioBlob, elapsedSeconds, apiBase, t, discard, onTranscribed]);

  // ── Mouse / Touch handlers (hold-to-record) ──────────────────────────────────
  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    startRecording();
  };

  const handlePressEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (state === 'recording') stopRecording();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const isRecording = state === 'recording';
  const isPreview = state === 'preview';
  const isUploading = state === 'uploading';

  return (
    <div className="voice-recorder-root">
      {/* Hidden audio element for preview playback */}
      {audioUrl && (
        <audio
          ref={audioElRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />
      )}

      {/* Error toast */}
      {errorMsg && (
        <div className="vr-error-toast" role="alert">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {/* ── IDLE: hold-to-record mic button ───────────────────────────────── */}
      {state === 'idle' && (
        <button
          id="voice-recorder-mic-btn"
          className={`vr-mic-btn${disabled ? ' vr-mic-btn--disabled' : ''}`}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          disabled={disabled}
          aria-label={t.hold}
          title={t.hold}
          type="button"
        >
          <Mic size={20} />
        </button>
      )}

      {/* ── RECORDING: red pulse + timer + waveform + stop button ─────────── */}
      {isRecording && (
        <div className="vr-recording-bar">
          <span className="vr-rec-dot" aria-hidden="true" />
          <span className="vr-timer">{formatTime(elapsedSeconds)}</span>
          <div className="vr-waveform" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="vr-waveform-bar" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
          <button
            className="vr-stop-btn"
            name="stopRecording"
            onClick={stopRecording}
            type="button"
            aria-label="Stop recording"
            title="Stop"
          >
            <Square size={16} fill="currentColor" />
          </button>
        </div>
      )}

      {/* ── PREVIEW: play/pause + send + discard ──────────────────────────── */}
      {(isPreview || isUploading) && (
        <div className="vr-preview-bar">
          <button
            className="vr-play-btn"
            name="playPreview"
            onClick={togglePlay}
            disabled={isUploading}
            type="button"
            aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <div className="vr-preview-waveform" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="vr-preview-bar-seg"
                style={{ height: `${30 + Math.sin(i * 0.9) * 22}%` }}
              />
            ))}
          </div>
          <span className="vr-preview-time">{formatTime(elapsedSeconds)}</span>
          {isUploading ? (
            <Loader2 size={18} className="vr-uploading-spinner" aria-label={t.uploading} />
          ) : (
            <>
              <button
                className="vr-send-btn"
                name="sendAudio"
                onClick={sendAudio}
                type="button"
                aria-label="Send voice message"
                title="Send"
              >
                <Send size={15} />
              </button>
              <button
                className="vr-discard-btn"
                name="discardAudio"
                onClick={discard}
                type="button"
                aria-label="Discard recording"
                title="Discard"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Inline CSS ────────────────────────────────────────────────────── */}
      <style>{`
        .voice-recorder-root {
          position: relative;
          display: flex;
          align-items: center;
        }

        /* ── Error toast ── */
        .vr-error-toast {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          background: #ef4444cc;
          color: #fff;
          font-size: 0.72rem;
          padding: 6px 12px;
          border-radius: 8px;
          white-space: nowrap;
          z-index: 50;
          animation: vr-fade-in 0.2s ease;
          pointer-events: none;
        }

        /* ── Idle mic button ── */
        .vr-mic-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          flex-shrink: 0;
          user-select: none;
          -webkit-user-select: none;
        }
        .vr-mic-btn:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.2);
        }
        .vr-mic-btn:active:not(:disabled) {
          transform: scale(0.95);
        }
        .vr-mic-btn--disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ── Recording bar ── */
        .vr-recording-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 20px;
          padding: 6px 12px;
          animation: vr-fade-in 0.2s ease;
        }

        .vr-rec-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ef4444;
          animation: vr-pulse 1s ease-in-out infinite;
          flex-shrink: 0;
        }

        .vr-timer {
          font-size: 0.78rem;
          font-variant-numeric: tabular-nums;
          color: #ef4444;
          font-weight: 600;
          min-width: 36px;
        }

        /* ── Animated waveform ── */
        .vr-waveform {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 20px;
        }
        .vr-waveform-bar {
          display: block;
          width: 3px;
          border-radius: 2px;
          background: #ef4444;
          animation: vr-wave 0.6s ease-in-out infinite alternate;
        }
        .vr-waveform-bar:nth-child(1) { height: 50%; }
        .vr-waveform-bar:nth-child(2) { height: 80%; }
        .vr-waveform-bar:nth-child(3) { height: 100%; }
        .vr-waveform-bar:nth-child(4) { height: 70%; }
        .vr-waveform-bar:nth-child(5) { height: 40%; }

        .vr-stop-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: #ef4444;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }
        .vr-stop-btn:hover { transform: scale(1.1); }

        /* ── Preview bar ── */
        .vr-preview-bar {
          display: flex;
          align-items: center;
          gap: 7px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.35);
          border-radius: 20px;
          padding: 5px 10px;
          animation: vr-fade-in 0.2s ease;
        }

        .vr-play-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: none;
          background: #10b981;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }
        .vr-play-btn:hover:not(:disabled) { transform: scale(1.1); }
        .vr-play-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .vr-preview-waveform {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 18px;
          min-width: 56px;
        }
        .vr-preview-bar-seg {
          display: block;
          width: 3px;
          border-radius: 2px;
          background: rgba(16, 185, 129, 0.55);
        }

        .vr-preview-time {
          font-size: 0.72rem;
          font-variant-numeric: tabular-nums;
          color: rgba(255,255,255,0.6);
          min-width: 32px;
        }

        .vr-uploading-spinner {
          color: #10b981;
          animation: vr-spin 1s linear infinite;
        }

        .vr-send-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: none;
          background: #10b981;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }
        .vr-send-btn:hover { transform: scale(1.1); }

        .vr-discard-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: none;
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s ease, background 0.15s;
        }
        .vr-discard-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          transform: scale(1.1);
        }

        /* ── Keyframes ── */
        @keyframes vr-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }
        @keyframes vr-wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.0); }
        }
        @keyframes vr-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes vr-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
