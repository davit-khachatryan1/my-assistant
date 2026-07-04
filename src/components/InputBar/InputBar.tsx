import { useState } from 'react';
import { useAppState } from '../../state/AppStateContext';
import { useRealMicrophone } from '../../hooks/useRealMicrophone';
import { MicButton } from './MicButton';
import { SendButton } from './SendButton';
import styles from './InputBar.module.css';

const PLACEHOLDER = {
  hy: 'Հարցրու ինչ ուզում ես…',
  en: 'Ask anything…',
  ru: 'Спроси что угодно…',
};

export function InputBar() {
  const { orbState, setOrbState, settings, sendUserMessage } = useAppState();
  const { startRecording, stopRecording } = useRealMicrophone();
  const [value, setValue] = useState('');
  const [micError, setMicError] = useState<string | null>(null);

  const isListening = orbState === 'listening';

  const handleMicToggle = async () => {
    setMicError(null);

    if (!isListening) {
      try {
        await startRecording();
        setOrbState('listening');
      } catch {
        setMicError('Խնդրում ենք թույլատրել մուտք դեպի խոսափողը։');
      }
      return;
    }

    setOrbState('thinking');
    try {
      const blob = await stopRecording();
      const res = await fetch('/api/speech-to-text', {
        method: 'POST',
        headers: { 'Content-Type': blob.type || 'audio/webm' },
        body: blob,
      });

      if (res.status === 503) {
        setMicError('Ձայնային մուտքը կարգավորված չէ (ELEVENLABS_API_KEY բացակայում է)։');
        setOrbState('idle');
        return;
      }
      if (!res.ok) throw new Error('transcription failed');

      const { text } = (await res.json()) as { text: string };
      sendUserMessage(text);
    } catch {
      setMicError('Ձայնագրությունը հնարավոր չեղավ մշակել։ Փորձիր նորից։');
      setOrbState('idle');
    }
  };

  const handleSend = () => {
    if (value.trim().length === 0) return;
    sendUserMessage(value);
    setValue('');
  };

  return (
    <div className={styles.inputBar}>
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
      <SendButton enabled={value.trim().length > 0} onSend={handleSend} />
    </div>
  );
}
