import { useEffect, useState } from 'react';
import { useAppState, useUIStrings } from '../../state/AppStateContext';
import { resolveModel } from '../../lib/providers/modelRouter';
import styles from './SettingsPanel.module.css';

const MODEL_GROUPS = [
  {
    provider: 'OpenAI',
    versions: [
      { id: 'gpt-5', label: 'GPT-5' },
      { id: 'gpt-5-mini-free', label: 'GPT-5 Mini', free: true },
    ],
  },
  {
    provider: 'Anthropic',
    versions: [
      { id: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
      { id: 'claude-haiku-free', label: 'Claude Haiku', free: true },
    ],
  },
  {
    provider: 'Google',
    versions: [
      { id: 'gemini-3-pro', label: 'Gemini 3 Pro' },
      { id: 'gemini-3-flash-free', label: 'Gemini 3 Flash', free: true },
    ],
  },
  {
    provider: 'DeepSeek',
    versions: [
      { id: 'deepseek-r1-free', label: 'DeepSeek R1', free: true },
      { id: 'deepseek-v3-free', label: 'DeepSeek V3', free: true },
    ],
  },
  {
    provider: 'xAI',
    versions: [
      { id: 'grok-4', label: 'Grok 4' },
      { id: 'grok-3-mini-free', label: 'Grok 3 Mini', free: true },
    ],
  },
];

export function ModelPicker() {
  const { settings, updateSettings } = useAppState();
  const t = useUIStrings();
  const [configured, setConfigured] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    fetch('/api/models/status')
      .then((res) => res.json())
      .then(setConfigured)
      .catch(() => setConfigured(null));
  }, []);

  const searchRequired = settings.mode === 'digest';

  return (
    <div className={styles.modelGrid}>
      {MODEL_GROUPS.map((group) => (
        <div key={group.provider} className={styles.modelGroup}>
          <p className={`${styles.modelProvider} text-timestamp`}>{group.provider}</p>
          <div className={styles.modelVersions}>
            {group.versions.map((version) => {
              const supportsSearch = Boolean(resolveModel(version.id)?.supportsSearch);
              const disabled = searchRequired && !supportsSearch;
              return (
                <button
                  key={version.id}
                  type="button"
                  className={`${styles.modelOption} ${styles.pillMono}`}
                  data-selected={settings.model === version.id}
                  disabled={disabled}
                  onClick={() => updateSettings({ model: version.id })}
                >
                  <span>{version.label}</span>
                  {version.free && <span className={styles.freeBadge}>FREE</span>}
                  {configured && !configured[version.id] && (
                    <span className={styles.notConfiguredBadge} title="API key not set">
                      !
                    </span>
                  )}
                  {disabled && (
                    <span className={styles.notConfiguredBadge} title={t.modelSearchLockTitle}>
                      ×
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
