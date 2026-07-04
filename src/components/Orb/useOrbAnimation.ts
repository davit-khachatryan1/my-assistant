import type { OrbState, ThinkingLabel } from './orb.types';

const THINKING_LABEL_TEXT: Record<ThinkingLabel, string> = {
  thinking: 'ՄՏԱԾՈՒՄ Է',
  searching: 'ՓՆՏՐՈՒՄ Է',
  writing: 'ԳՐՈՒՄ Է ՓԱՍՏԱԹՈՒՂԹ',
};

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
): OrbAnimationConfig {
  const arcDuration =
    state === 'listening' ? 'var(--duration-listening-rotation)' : 'var(--duration-idle-rotation)';

  const statusText =
    state === 'idle'
      ? 'Հպեք՝ խոսելու համար'
      : state === 'listening'
        ? 'ԼՍՈՒՄ Է'
        : state === 'thinking'
          ? THINKING_LABEL_TEXT[thinkingLabel]
          : 'ԽՈՍՈՒՄ Է';

  return {
    statusText,
    statusVariant: state,
    arcDuration,
    showParticles: state === 'thinking' && !reducedMotion,
    showWaveform: (state === 'listening' || state === 'speaking') && !reducedMotion,
    waveformColor: state === 'speaking' ? 'ember' : 'cyan',
  };
}
