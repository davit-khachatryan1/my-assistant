import type { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const CACHE_TTL_MS = 5 * 60 * 1000;

interface CachedVoice {
  voiceId: string;
  gender?: string;
}

let cachedVoices: CachedVoice[] | null = null;
let cachedAt = 0;

async function getAvailableVoices(client: ElevenLabsClient): Promise<CachedVoice[]> {
  const now = Date.now();
  if (cachedVoices && now - cachedAt < CACHE_TTL_MS) {
    return cachedVoices;
  }

  const response = await client.voices.getAll({ showLegacy: true });
  cachedVoices = response.voices.map((voice) => ({
    voiceId: voice.voiceId,
    gender: voice.labels?.gender,
  }));
  cachedAt = now;
  return cachedVoices;
}

/**
 * Resolves the app's internal voice id (e.g. 'hy-female'/'hy-male') to a real
 * ElevenLabs voice id belonging to the caller's own account. There is no
 * universal "stock" voice id shared across all ElevenLabs accounts, so this
 * fetches the account's actual available voices (cached briefly) and picks a
 * gender match, falling back to the first available voice.
 */
export async function resolveVoiceId(client: ElevenLabsClient, appVoiceId: string): Promise<string> {
  const voices = await getAvailableVoices(client);
  if (voices.length === 0) {
    throw new Error('No ElevenLabs voices are available on this account.');
  }

  const wantsFemale = appVoiceId.includes('female');
  const wantsMale = appVoiceId.includes('male') && !wantsFemale;

  if (wantsFemale) {
    const match = voices.find((v) => v.gender === 'female');
    if (match) return match.voiceId;
  }
  if (wantsMale) {
    const match = voices.find((v) => v.gender === 'male');
    if (match) return match.voiceId;
  }

  return voices[0].voiceId;
}
