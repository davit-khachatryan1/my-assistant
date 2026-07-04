import { useRef } from 'react';
import { setMicStream } from '../components/InputBar/micStreamRegistry';

export function useRealMicrophone() {
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async (): Promise<void> => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    setMicStream(stream);

    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorderRef.current = recorder;
    recorder.start();
  };

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      const stream = streamRef.current;

      if (!recorder) {
        resolve(new Blob([]));
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        stream?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setMicStream(null);
        resolve(blob);
      };
      recorder.stop();
    });
  };

  return { startRecording, stopRecording };
}
