import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import type { LanguageCode } from '../../../state/appState.types';

export const runtime = 'nodejs';

const SCRIBE_LANGUAGE_CODES: Record<LanguageCode, string> = {
  hy: 'hye',
  en: 'eng',
  ru: 'rus',
};

function getInputLanguage(request: Request): LanguageCode {
  const language = request.headers.get('X-Luka-Input-Language');
  return language === 'hy' || language === 'en' || language === 'ru' ? language : 'hy';
}

export async function POST(request: Request) {
  if (!process.env.ELEVENLABS_API_KEY) {
    return Response.json({ error: 'provider_not_configured', envVar: 'ELEVENLABS_API_KEY' }, { status: 503 });
  }

  try {
    const inputLanguage = getInputLanguage(request);
    const arrayBuffer = await request.arrayBuffer();
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    const result = await client.speechToText.convert({
      file: Buffer.from(arrayBuffer),
      modelId: 'scribe_v2',
      languageCode: SCRIBE_LANGUAGE_CODES[inputLanguage],
      tagAudioEvents: true,
      diarize: true,
      timestampsGranularity: 'word',
    });

    if ('text' in result) {
      return Response.json({
        text: result.text,
        languageCode: result.languageCode,
        languageProbability: result.languageProbability,
        words: result.words,
      });
    }
    return Response.json({ error: 'stt_failed', message: 'Unexpected transcription response shape' }, { status: 502 });
  } catch (err) {
    return Response.json(
      { error: 'stt_failed', message: err instanceof Error ? err.message : 'Transcription failed' },
      { status: 502 },
    );
  }
}
