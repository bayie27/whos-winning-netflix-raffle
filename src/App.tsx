import { useState } from 'react';
import type { SessionConfig, RaffleType, Participant } from './types';
import SetupScreen from './setup/SetupScreen';
import RaffleScreen from './raffle/RaffleScreen';
import RouletteScreen from './raffle/RouletteScreen';
import styles from './App.module.css';

function App() {
  const [view, setView] = useState<'setup' | 'raffle'>('setup');
  const [rawText, setRawText] = useState('');
  const [suspenseDuration, setSuspenseDuration] = useState(5.0);
  const [raffleType, setRaffleType] = useState<RaffleType>('default');
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);

  const handleStartRaffle = (config: SessionConfig) => {
    setSessionConfig(config);
    setView('raffle');
  };

  // Drop drawn winners from the names box so the next session only has who's left.
  const handleBack = (remaining: Participant[]) => {
    if (sessionConfig) {
      const remainingIds = new Set(remaining.map((p) => p.id));
      setRawText(
        sessionConfig.participants
          .filter((p) => remainingIds.has(p.id))
          .map((p) => p.name)
          .join('\n'),
      );
    }
    setView('setup');
  };

  return (
    <div className={styles.container}>
      {view === 'setup' ? (
        <SetupScreen
          initialRawText={rawText}
          initialSuspenseDuration={suspenseDuration}
          initialRaffleType={raffleType}
          onChangeRawText={setRawText}
          onChangeSuspenseDuration={setSuspenseDuration}
          onChangeRaffleType={setRaffleType}
          onStart={handleStartRaffle}
        />
      ) : sessionConfig?.raffleType === 'roulette' ? (
        <RouletteScreen
          config={sessionConfig}
          onBack={handleBack}
        />
      ) : (
        <RaffleScreen
          config={sessionConfig!}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default App;
