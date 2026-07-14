import { useState } from 'react';
import { useAppState, useUIStrings } from '../../state/AppStateContext';
import { getAudioAdapter } from '../../lib/audio/getAudioAdapter';
import { MicButton } from './MicButton';
import { SendButton } from './SendButton';
import styles from './InputBar.module.css';

const PLACEHOLDER = {
  hy: 'Հարցրու ինչ ուզում ես…',
  en: 'Ask anything…',
  ru: 'Спроси что угодно…',
};

export function InputBar() {
  const { orbState, setOrbState, settings, sendUserMessage, stopAssistantSpeech } = useAppState();
  const t = useUIStrings();
  const audioAdapter = getAudioAdapter();
  const [value, setValue] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [processingVoice, setProcessingVoice] = useState(false);

  const isListening = orbState === 'listening';
  const isSpeaking = orbState === 'speaking';

  const transcribeAndSendRecording = async () => {
    setProcessingVoice(true);
    setOrbState('thinking');
    try {
      const recording = await audioAdapter.stopRecording();
      // Web's WebAudioAdapter always resolves a Blob; ArrayBuffer is a
      // future React Native adapter's shape, which has no .type to read.
      const contentType = recording instanceof Blob ? recording.type || 'audio/webm' : 'audio/webm';
      const res = await fetch('/api/speech-to-text', {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
          'X-Luka-Input-Language': settings.inputLanguage,
        },
        body: recording,
      });

      if (res.status === 503) {
        setMicError(t.voiceNotConfigured);
        setOrbState('idle');
        return;
      }
      if (!res.ok) throw new Error('transcription failed');

      const { text } = (await res.json()) as { text: string };
      if (text.trim().length > 0) {
        sendUserMessage(text);
      } else {
        setMicError(t.micNoSpeech);
        setOrbState('idle');
      }
    } catch {
      setMicError(t.micProcessFailed);
      setOrbState('idle');
    } finally {
      setProcessingVoice(false);
    }
  };

  const stopRecordingOnly = async () => {
    try {
      await audioAdapter.stopRecording();
    } catch {
      // The send path should still continue with typed text if stopping media
      // cleanup fails after the browser has already ended the recorder.
    }
  };

  const handleMicToggle = async () => {
    if (processingVoice) return;
    setMicError(null);

    if (!isListening) {
      try {
        await audioAdapter.startRecording();
        setOrbState('listening');
      } catch {
        setMicError(t.micPermission);
      }
      return;
    }

    await transcribeAndSendRecording();
  };

  const handleSend = async () => {
    if (processingVoice) return;

    const trimmed = value.trim();
    if (trimmed.length > 0) {
      if (isListening) {
        await stopRecordingOnly();
      }
      sendUserMessage(trimmed);
      setValue('');
      return;
    }

    if (isListening) {
      setMicError(null);
      await transcribeAndSendRecording();
    }
  };

  return (
    <div className={styles.inputBar} data-speaking={isSpeaking}>
      {micError && <p className={`${styles.micError} text-timestamp`}>{micError}</p>}
      <MicButton active={isListening} onToggle={handleMicToggle} />
      <textarea
        className={`${styles.textField} text-input`}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={PLACEHOLDER[settings.inputLanguage]}
      />
      {isSpeaking && (
        <button
          type="button"
          className={styles.stopSpeechButton}
          onClick={stopAssistantSpeech}
          aria-label="Stop Luka speech"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
          </svg>
        </button>
      )}
      <SendButton enabled={value.trim().length > 0 || isListening} onSend={handleSend} />
    </div>
  );
}
