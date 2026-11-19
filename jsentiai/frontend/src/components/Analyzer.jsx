import { useRef, useState } from 'react';
import api from '../services/api';

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function Analyzer({ onDone }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const rec = useRef(null);

  function toggleVoice() {
    if (listening) return rec.current.stop();
    rec.current = new SR();
    rec.current.lang = 'en-IN';
    rec.current.interimResults = true;
    rec.current.onresult = (e) =>
      setText(Array.from(e.results).map((r) => r[0].transcript).join(''));
    rec.current.onend = () => setListening(false);
    rec.current.start();
    setListening(true);
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/sentiment', { text });
      setResult(res.data);
      onDone();
    } catch (err) {
      setError(err.response?.data?.error || 'Cannot reach the backend. Start Flask on port 5000.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel hero">
      <h2>What mood is this text in?</h2>
      <form onSubmit={submit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a review, a message, or tap Speak instead"
          rows={4}
        />
        <div className="row">
          <button className="btn" disabled={loading || !text.trim()}>
            {loading ? 'Analyzing...' : 'Analyze sentiment'}
          </button>
          {SR && (
            <button type="button" className="btn ghost" onClick={toggleVoice}>
              {listening ? 'Stop listening' : 'Speak instead'}
            </button>
          )}
        </div>
      </form>
      {error && <p className="err">{error}</p>}
      {result && (
        <div className={`result ${result.label}`}>
          <strong>{result.label}</strong>
          <span>score {result.score}</span>
          {!result.saved && <span className="muted">not saved: database unreachable</span>}
        </div>
      )}
    </section>
  );
}
