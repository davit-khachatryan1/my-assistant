export type ProviderId = 'anthropic' | 'openai' | 'google' | 'deepseek' | 'xai';

export interface ModelConfig {
  id: string;
  provider: ProviderId;
  apiModel: string;
  envVar: string;
  baseURL?: string;
  deepseekThinking?: 'enabled' | 'disabled';
  // True only for models with a confirmed-workable native search tool
  // (Anthropic web_search, Gemini google_search). Digest mode is
  // restricted to these — see chat/route.ts and ModelPicker.tsx.
  supportsSearch?: boolean;
}

// Single source of truth mapping every ModelPicker.tsx id to its provider
// config. Verified against each vendor's live docs on 2026-07-04 — re-verify
// periodically since these strings drift/deprecate over time.
export const MODEL_CONFIGS: ModelConfig[] = [
  { id: 'gpt-5', provider: 'openai', apiModel: 'gpt-5', envVar: 'OPENAI_API_KEY' },
  { id: 'gpt-5-mini-free', provider: 'openai', apiModel: 'gpt-5.4-mini', envVar: 'OPENAI_API_KEY' },
  {
    id: 'claude-sonnet-5',
    provider: 'anthropic',
    apiModel: 'claude-sonnet-5',
    envVar: 'ANTHROPIC_API_KEY',
    supportsSearch: true,
  },
  {
    id: 'claude-haiku-free',
    provider: 'anthropic',
    apiModel: 'claude-haiku-4-5',
    envVar: 'ANTHROPIC_API_KEY',
    supportsSearch: true,
  },
  {
    id: 'gemini-3-pro',
    provider: 'google',
    apiModel: 'gemini-3.1-pro-preview',
    envVar: 'GOOGLE_API_KEY',
    supportsSearch: true,
  },
  {
    id: 'gemini-3-flash-free',
    provider: 'google',
    apiModel: 'gemini-3-flash-preview',
    envVar: 'GOOGLE_API_KEY',
    supportsSearch: true,
  },
  {
    id: 'deepseek-r1-free',
    provider: 'deepseek',
    apiModel: 'deepseek-v4-pro',
    envVar: 'DEEPSEEK_API_KEY',
    baseURL: 'https://api.deepseek.com',
    deepseekThinking: 'enabled',
  },
  {
    id: 'deepseek-v3-free',
    provider: 'deepseek',
    apiModel: 'deepseek-v4-pro',
    envVar: 'DEEPSEEK_API_KEY',
    baseURL: 'https://api.deepseek.com',
    deepseekThinking: 'disabled',
  },
  {
    id: 'grok-4',
    provider: 'xai',
    apiModel: 'grok-4.3',
    envVar: 'XAI_API_KEY',
    baseURL: 'https://api.x.ai/v1',
  },
  {
    id: 'grok-3-mini-free',
    provider: 'xai',
    apiModel: 'grok-3-mini-beta',
    envVar: 'XAI_API_KEY',
    baseURL: 'https://api.x.ai/v1',
  },
];

export function resolveModel(modelId: string): ModelConfig | null {
  return MODEL_CONFIGS.find((m) => m.id === modelId) ?? null;
}

export function isModelConfigured(modelId: string): boolean {
  const config = resolveModel(modelId);
  if (!config) return false;
  return Boolean(process.env[config.envVar]);
}
