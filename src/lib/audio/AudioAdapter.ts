export interface AudioAdapter {
  startRecording(): Promise<void>;
  stopRecording(): Promise<Blob | ArrayBuffer>;
  play(stream: ArrayBuffer, signal: AbortSignal): Promise<'ok' | 'failed' | 'stopped'>;
}
