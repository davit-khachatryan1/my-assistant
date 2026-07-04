export type PromptChipIcon = 'search' | 'summary';

export interface PromptChip {
  id: string;
  label: string;
  seedUserMessage: string;
  icon: PromptChipIcon;
}

export const promptChips: PromptChip[] = [
  {
    id: 'chip-news',
    label: 'Փնտրիր նորություններ Հայաստանից',
    seedUserMessage: 'Փնտրիր նորություններ Հայաստանից',
    icon: 'search',
  },
  {
    id: 'chip-summary',
    label: 'Պատրաստիր ինձ ամփոփագիր',
    seedUserMessage: 'Պատրաստիր ինձ ամփոփագիր',
    icon: 'summary',
  },
];
