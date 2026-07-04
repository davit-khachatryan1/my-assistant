import type { Message } from '../../state/appState.types';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import { DocumentCard } from './DocumentCard';
import styles from './Transcript.module.css';

export function Transcript({ messages }: { messages: Message[] }) {
  return (
    <div className={styles.transcript}>
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
