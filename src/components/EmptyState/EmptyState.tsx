import { Orb } from '../Orb/Orb';
import { SuggestionTile } from './SuggestionTile';
import { promptChips } from '../../state/mockPrompts';
import { useAppState } from '../../state/AppStateContext';
import { useResponsiveOrbSize } from '../../hooks/useResponsiveOrbSize';
import styles from './EmptyState.module.css';

export function EmptyState() {
  const { sendUserMessage, updateSettings } = useAppState();
  const orbSize = useResponsiveOrbSize(220, 288);

  const handleChipClick = (chip: (typeof promptChips)[number]) => {
    if (chip.forceMode) updateSettings({ mode: chip.forceMode });
    sendUserMessage(chip.seedUserMessage, chip.forceMode);
  };

  return (
    <div className={styles.emptyState}>
      <Orb state="idle" size={orbSize} />
      <h2 className={`${styles.headline} text-empty-headline`}>Ասա ինձ ինչ է պետք</h2>
      <div className={styles.tiles}>
        {promptChips.map((chip, i) => (
          <SuggestionTile
            key={chip.id}
            label={chip.label}
            icon={chip.icon}
            tint={i % 2 === 0 ? 'plum' : 'chartreuse'}
            onClick={() => handleChipClick(chip)}
          />
        ))}
      </div>
    </div>
  );
}
