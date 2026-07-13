import { createWebAudioAdapter } from './WebAudioAdapter';
import type { AudioAdapter } from './AudioAdapter';

// The one seam a future React Native entry point swaps (createWebAudioAdapter
// -> createNativeAudioAdapter). No component should import WebAudioAdapter directly.
let instance: AudioAdapter | null = null;

export function getAudioAdapter(): AudioAdapter {
  if (!instance) instance = createWebAudioAdapter();
  return instance;
}
