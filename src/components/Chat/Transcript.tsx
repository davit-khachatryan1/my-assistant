import type { Message } from '../../state/appState.types';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import { DocumentCard } from './DocumentCard';
import { useAppState } from '../../state/AppStateContext';
import styles from './Transcript.module.css';

export function Transcript({ messages }: { messages: Message[] }) {
  const { orbState, stopAssistantSpeech } = useAppState();
  const isSpeaking = orbState === 'speaking';

  return (
    <div className={styles.transcript}>
      {isSpeaking && (
        <button
          type="button"
          className={styles.pauseSpeechButton}
          onClick={stopAssistantSpeech}
          aria-label="Pause Luka speech"
        >
          <span className={styles.pauseIcon} aria-hidden="true">
            <span />
            <span />
          </span>
          <span className="text-button-label">Pause speech</span>
        </button>
      )}

      {messages.map((message) => {
        if (message.kind === 'document') {
          return <DocumentCard key={message.id} message={message} />;
        }
        return message.role === 'assistant' ? (
          <AssistantMessage key={message.id} message={message} />
        ) : (
          <UserMessage key={message.id} message={message} />
        );
      })}
    </div>
  );
}
