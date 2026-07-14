import { Orb } from '../Orb/Orb';
import { SuggestionTile } from './SuggestionTile';
import { promptChips } from '../../state/mockPrompts';
import { useAppState, useUIStrings } from '../../state/AppStateContext';
import { useResponsiveOrbSize } from '../../hooks/useResponsiveOrbSize';
import styles from './EmptyState.module.css';

export function EmptyState() {
  const { sendUserMessage, updateSettings, settings } = useAppState();
  const t = useUIStrings();
  const orbSize = useResponsiveOrbSize(220, 288);

  const handleChipClick = (chip: (typeof promptChips)[number]) => {
    if (chip.forceMode) updateSettings({ mode: chip.forceMode });
    sendUserMessage(chip.seedUserMessage[settings.uiLanguage], chip.forceMode);
  };

  return (
    <div className={styles.emptyState}>
      <Orb state="idle" size={orbSize} uiLanguage={settings.uiLanguage} />
      <h2 className={`${styles.headline} text-empty-headline`}>{t.emptyStateHeadline}</h2>
      <div className={styles.tiles}>
        {promptChips.map((chip, i) => (
          <SuggestionTile
            key={chip.id}
            label={chip.label[settings.uiLanguage]}
            icon={chip.icon}
            tint={i % 2 === 0 ? 'plum' : 'chartreuse'}
            onClick={() => handleChipClick(chip)}
          />
        ))}
      </div>
    </div>
  );
}
