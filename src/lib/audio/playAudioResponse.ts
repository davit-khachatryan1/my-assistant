export async function playAudioStream(response: Response, signal?: AbortSignal): Promise<void> {
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      signal?.removeEventListener('abort', onAbort);
      URL.revokeObjectURL(url);
    };

    const onAbort = () => {
      audio.pause();
      audio.currentTime = 0;
      cleanup();
      reject(new DOMException('Audio playback stopped', 'AbortError'));
    };

    if (signal?.aborted) {
      onAbort();
      return;
    }

    signal?.addEventListener('abort', onAbort, { once: true });

    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error('Audio playback failed'));
    };
    audio.play().catch(reject);
  });
}
