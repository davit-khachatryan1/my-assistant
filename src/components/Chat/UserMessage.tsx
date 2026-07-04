import { useState } from 'react';
import type { TextMessage } from '../../state/appState.types';
import { useLongPress } from '../../hooks/useLongPress';
import { MessageTimestamp } from './MessageTimestamp';
import styles from './Transcript.module.css';

export function UserMessage({ message }: { message: TextMessage }) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const longPress = useLongPress(
    () => setShowTimestamp(true),
    () => setShowTimestamp(false),
  );

  return (
    <div className={styles.userRow}>
      <div className={styles.userBubble} {...longPress}>
        <p className={`${styles.userText} text-user-message`}>{message.content}</p>
      </div>
      <MessageTimestamp timestamp={message.timestamp} visible={showTimestamp} />
    </div>
  );
}
