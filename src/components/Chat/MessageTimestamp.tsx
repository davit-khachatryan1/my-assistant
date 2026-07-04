import { formatTimestamp } from '../../utils/formatTimestamp';
import styles from './Transcript.module.css';

interface MessageTimestampProps {
  timestamp: string;
  visible: boolean;
}

export function MessageTimestamp({ timestamp, visible }: MessageTimestampProps) {
  if (!visible) return null;
  return (
    <span className={`${styles.timestamp} text-timestamp`}>{formatTimestamp(timestamp)}</span>
  );
}
