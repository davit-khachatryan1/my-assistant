import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { resolveVoiceId } from '../../../lib/providers/voiceMap';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!process.env.ELEVENLABS_API_KEY) {
    return Response.json({ error: 'provider_not_configured', envVar: 'ELEVENLABS_API_KEY' }, { status: 503 });
  }

  try {
    const { text, voiceId } = (await request.json()) as { text: string; voiceId: string };
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    const realVoiceId = await resolveVoiceId(client, voiceId);

    const audioStream = await client.textToSpeech.convert(realVoiceId, {
      text,
      modelId: 'eleven_v3',
    });

    return new Response(audioStream as unknown as ReadableStream<Uint8Array>, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (err) {
    return Response.json(
      { error: 'tts_failed', message: err instanceof Error ? err.message : 'Speech synthesis failed' },
      { status: 502 },
    );
  }
}
