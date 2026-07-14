import type { Mode } from './appState.types';
import type { UILanguage } from '../lib/i18n/uiStrings';

export type PromptChipIcon = 'search' | 'summary';

export interface PromptChip {
  id: string;
  label: Record<UILanguage, string>;
  seedUserMessage: Record<UILanguage, string>;
  icon: PromptChipIcon;
  forceMode?: Mode;
}

export const promptChips: PromptChip[] = [
  {
    id: 'chip-tech-updates',
    label: { hy: 'Տեխ նորություններ', en: 'Tech news' },
    seedUserMessage: {
      hy: 'Ի՞նչ կարևոր տեխնոլոգիական նորություններ կան այսօր',
      en: 'What important tech news is there today',
    },
    icon: 'search',
    forceMode: 'digest',
  },
  {
    id: 'chip-ai-updates',
    label: { hy: 'AI նորություններ', en: 'AI news' },
    seedUserMessage: {
      hy: 'Ի՞նչ նոր բան կա արհեստական բանականության ոլորտում այս օրերին',
      en: "What's new in artificial intelligence these days",
    },
    icon: 'search',
    forceMode: 'digest',
  },
];
