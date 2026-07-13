import { setMicStream } from '../../components/InputBar/micStreamRegistry';
import type { AudioAdapter } from './AudioAdapter';

/**
 * Web implementation of AudioAdapter — consolidates what used to be the
 * useRealMicrophone hook and playAudioResponse.ts. Plain closure variables
 * stand in for the hook's useRef cells, since adapter methods are ordinary
 * async functions with no React lifecycle.
 */
export function createWebAudioAdapter(): AudioAdapter {
  let stream: MediaStream | null = null;
  let recorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];

  const startRecording = async (): Promise<void> => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream = mediaStream;
    setMicStream(mediaStream);

    chunks = [];
    const mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder = mediaRecorder;
    mediaRecorder.start();
  };

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const activeRecorder = recorder;
      const activeStream = stream;

      if (!activeRecorder) {
        resolve(new Blob([]));
        return;
      }

      const finalizeRecording = () => {
        const blob = new Blob(chunks, { type: activeRecorder.mimeType || 'audio/webm' });
        activeStream?.getTracks().forEach((track) => track.stop());
        stream = null;
        recorder = null;
        setMicStream(null);
        resolve(blob);
      };

      activeRecorder.onstop = finalizeRecording;

      if (activeRecorder.state === 'inactive') {
        finalizeRecording();
        return;
      }

      activeRecorder.stop();
    });
  };

  const play = (audioBuffer: ArrayBuffer, signal: AbortSignal): Promise<'ok' | 'failed' | 'stopped'> => {
    const blob = new Blob([audioBuffer]);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    return new Promise((resolve) => {
      const cleanup = () => {
        signal.removeEventListener('abort', onAbort);
        URL.revokeObjectURL(url);
      };

      const onAbort = () => {
        audio.pause();
        audio.currentTime = 0;
        cleanup();
        resolve('stopped');
      };

      if (signal.aborted) {
        onAbort();
        return;
      }

      signal.addEventListener('abort', onAbort, { once: true });

      audio.onended = () => {
        cleanup();
        resolve('ok');
      };
      audio.onerror = () => {
        cleanup();
        resolve('failed');
      };
      audio.play().catch(() => {
        cleanup();
        resolve('failed');
      });
    });
  };

  return { startRecording, stopRecording, play };
}
