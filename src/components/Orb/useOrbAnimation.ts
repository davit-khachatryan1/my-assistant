import type { OrbState, ThinkingLabel } from './orb.types';
import { UI_STRINGS } from '../../lib/i18n/uiStrings';

export interface OrbAnimationConfig {
  statusText: string;
  statusVariant: 'idle' | 'listening' | 'thinking' | 'speaking';
  arcDuration: string;
  showParticles: boolean;
  showWaveform: boolean;
  waveformColor: 'cyan' | 'ember';
}

export function useOrbAnimation(
  state: OrbState,
  thinkingLabel: ThinkingLabel,
  reducedMotion: boolean,
  uiLanguage: 'hy' | 'en' = 'hy',
): OrbAnimationConfig {
  const t = UI_STRINGS[uiLanguage];
  const thinkingLabelText: Record<ThinkingLabel, string> = {
    thinking: t.orbThinking,
    searching: t.orbSearching,
    writing: t.orbWriting,
  };

  const arcDuration =
    state === 'listening' ? 'var(--duration-listening-rotation)' : 'var(--duration-idle-rotation)';

  const statusText =
    state === 'idle'
      ? t.orbTapToSpeak
      : state === 'listening'
        ? t.orbListening
        : state === 'thinking'
          ? thinkingLabelText[thinkingLabel]
          : t.orbSpeaking;

  return {
    statusText,
    statusVariant: state,
    arcDuration,
    showParticles: state === 'thinking' && !reducedMotion,
    showWaveform: (state === 'listening' || state === 'speaking') && !reducedMotion,
    waveformColor: state === 'speaking' ? 'ember' : 'cyan',
  };
}
