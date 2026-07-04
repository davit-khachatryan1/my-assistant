import { MODEL_CONFIGS, isModelConfigured } from '../../../../lib/providers/modelRouter';

export const runtime = 'nodejs';

export async function GET() {
  const status: Record<string, boolean> = {};
  for (const config of MODEL_CONFIGS) {
    status[config.id] = isModelConfigured(config.id);
  }
  return Response.json(status);
}
