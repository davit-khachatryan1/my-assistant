export async function playAudioStream(response: Response): Promise<void> {
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  return new Promise((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Audio playback failed'));
    };
    audio.play().catch(reject);
  });
}
