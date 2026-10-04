import { useState } from 'react';
import type { SessionConfig, RaffleType } from './types';
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
          onBack={() => setView('setup')}
        />
      ) : (
        <RaffleScreen
          config={sessionConfig!}
          onBack={() => {
            setView('setup');
          }}
        />
      )}
    </div>
  );
}

export default App;
