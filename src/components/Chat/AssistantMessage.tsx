import { useState } from 'react';
import type { TextMessage } from '../../state/appState.types';
import { useLongPress } from '../../hooks/useLongPress';
import { MessageTimestamp } from './MessageTimestamp';
import styles from './Transcript.module.css';

export function AssistantMessage({ message }: { message: TextMessage }) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const longPress = useLongPress(
    () => setShowTimestamp(true),
    () => setShowTimestamp(false),
  );

  return (
    <div className={styles.assistantRow} {...longPress}>
      <span className={styles.lukaMarker} aria-hidden="true">
        <span className={styles.lukaMarkerScreen}>
          <span className={styles.lukaMarkerEyeLeft} />
          <span className={styles.lukaMarkerEyeRight} />
          <span className={styles.lukaMarkerSmile} />
        </span>
      </span>
      <div className={styles.assistantBody}>
        <p className={`${styles.assistantText} text-assistant-reply`}>{message.content}</p>
        <MessageTimestamp timestamp={message.timestamp} visible={showTimestamp} />
      </div>
    </div>
  );
}
