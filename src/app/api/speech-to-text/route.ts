import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!process.env.ELEVENLABS_API_KEY) {
    return Response.json({ error: 'provider_not_configured', envVar: 'ELEVENLABS_API_KEY' }, { status: 503 });
  }

  try {
    const arrayBuffer = await request.arrayBuffer();
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    const result = await client.speechToText.convert({
      file: Buffer.from(arrayBuffer),
      modelId: 'scribe_v1',
    });

    if ('text' in result) {
      return Response.json({ text: result.text });
    }
    return Response.json({ error: 'stt_failed', message: 'Unexpected transcription response shape' }, { status: 502 });
  } catch (err) {
    return Response.json(
      { error: 'stt_failed', message: err instanceof Error ? err.message : 'Transcription failed' },
      { status: 502 },
    );
  }
}
