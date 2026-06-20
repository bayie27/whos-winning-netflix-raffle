import { useState } from 'react';
import type { SessionConfig } from './types';
import SetupScreen from './setup/SetupScreen';
import RaffleScreen from './raffle/RaffleScreen';
import styles from './App.module.css';

function App() {
  const [view, setView] = useState<'setup' | 'raffle'>('setup');
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);

  const handleStartRaffle = (config: SessionConfig) => {
    setSessionConfig(config);
    setView('raffle');
  };

  return (
    <div className={styles.container}>
      {view === 'setup' ? (
        <SetupScreen onStart={handleStartRaffle} />
      ) : (
        <RaffleScreen
          config={sessionConfig!}
          onBack={() => {
            setView('setup');
            setSessionConfig(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
