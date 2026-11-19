import { useState } from 'react';
import Analyzer from './components/Analyzer';
import Dashboard from './components/Dashboard';
import History from './components/History';

export default function App() {
  const [tick, setTick] = useState(0);
  return (
    <div className="wrap">
      <header>
        <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13 2 4 14h6l-1 8 9-12h-6z" fill="#E0B03A" />
        </svg>
        <h1 className="logo">JsentiAI</h1>
        <p className="muted">Type or speak. See the mood.</p>
      </header>
      <Analyzer onDone={() => setTick((t) => t + 1)} />
      <h2 className="sec">Mood dashboard</h2>
      <Dashboard refreshKey={tick} />
      <History refreshKey={tick} />
    </div>
  );
}
