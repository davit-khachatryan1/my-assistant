export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type ThinkingLabel = 'thinking' | 'searching' | 'writing';

export interface OrbProps {
  state: OrbState;
  thinkingLabel?: ThinkingLabel;
  size?: number;
  statusLine?: string;
  onTap?: () => void;
  /** Skip all animation/state visuals — used for the frozen TopBar mini-orb. */
  frozen?: boolean;
  uiLanguage?: 'hy' | 'en';
}
