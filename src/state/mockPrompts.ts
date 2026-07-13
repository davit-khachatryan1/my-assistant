import type { Mode } from './appState.types';

export type PromptChipIcon = 'search' | 'summary';

export interface PromptChip {
  id: string;
  label: string;
  seedUserMessage: string;
  icon: PromptChipIcon;
  forceMode?: Mode;
}

export const promptChips: PromptChip[] = [
  {
    id: 'chip-tech-updates',
    label: 'Տեխ նորություններ',
    seedUserMessage: 'Ի՞նչ կարևոր տեխնոլոգիական նորություններ կան այսօր',
    icon: 'search',
    forceMode: 'digest',
  },
  {
    id: 'chip-ai-updates',
    label: 'AI նորություններ',
    seedUserMessage: 'Ի՞նչ նոր բան կա արհեստական բանականության ոլորտում այս օրերին',
    icon: 'search',
    forceMode: 'digest',
  },
];
