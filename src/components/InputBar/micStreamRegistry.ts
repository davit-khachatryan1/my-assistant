type Listener = (stream: MediaStream | null) => void;

let currentStream: MediaStream | null = null;
const listeners = new Set<Listener>();

export function setMicStream(stream: MediaStream | null): void {
  currentStream = stream;
  listeners.forEach((listener) => listener(stream));
}

export function subscribeMicStream(listener: Listener): () => void {
  listeners.add(listener);
  listener(currentStream);
  return () => {
    listeners.delete(listener);
  };
}
