'use client';

import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { MotionPreferenceProvider } from './state/MotionPreferenceContext';
import { AppStateProvider, useAppState } from './state/AppStateContext';
import { TopBar } from './components/TopBar/TopBar';
import { Orb } from './components/Orb/Orb';
import { VoiceModeToggle } from './components/VoiceModeToggle/VoiceModeToggle';
import { Transcript } from './components/Chat/Transcript';
import { EmptyState } from './components/EmptyState/EmptyState';
import { InputBar } from './components/InputBar/InputBar';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { DevPanel } from './components/DevPanel/DevPanel';
import { useResponsiveOrbSize } from './hooks/useResponsiveOrbSize';
import styles from './App.module.css';

function AppShell() {
  const { messages, orbState, thinkingLabel, setOrbState } = useAppState();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const lukaSize = useResponsiveOrbSize(190, 248);

  const handleOrbTap = () => {
    if (orbState === 'speaking') setOrbState('idle');
  };

  return (
    <div className={styles.app}>
      <div className={styles.ambientField} aria-hidden="true">
        <span className={styles.lightBloom} />
        <span className={styles.scanBeam} />
      </div>
      <TopBar onOpenSettings={() => setSettingsOpen(true)} />

      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className={styles.lukaStage}>
            <Orb state={orbState} thinkingLabel={thinkingLabel} onTap={handleOrbTap} size={lukaSize} />
            <VoiceModeToggle />
          </div>
          <div className={styles.transcriptArea} aria-label="Conversation">
            <Transcript messages={messages} />
          </div>
        </>
      )}

      <InputBar />
      {process.env.NODE_ENV !== 'production' && <DevPanel />}
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <MotionPreferenceProvider>
        <AppStateProvider>
          <AppShell />
        </AppStateProvider>
      </MotionPreferenceProvider>
    </SessionProvider>
  );
}
