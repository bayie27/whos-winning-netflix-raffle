import { useState } from 'react';
import type { SessionConfig } from './types';
import SetupScreen from './setup/SetupScreen';
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
        <div id="raffle-placeholder" style={{ padding: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>Raffle Screen Placeholder</h1>
          <p style={{ color: '#8c8c8c', marginBottom: '8px' }}>
            Suspense Duration: <strong>{sessionConfig?.suspenseDuration}s</strong>
          </p>
          <p style={{ color: '#8c8c8c', marginBottom: '24px' }}>
            Participants Count: <strong>{sessionConfig?.participants.length}</strong>
          </p>
          <button
            onClick={() => {
              setView('setup');
              setSessionConfig(null);
            }}
            style={{
              background: '#e50914',
              color: '#fff',
              border: 0,
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '16px',
            }}
          >
            Go Back to Setup
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
