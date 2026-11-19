import { useEffect, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Tooltip, Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);
ChartJS.defaults.color = '#8A97AD';
ChartJS.defaults.borderColor = '#9AA7B822';

export default function Dashboard({ refreshKey }) {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/stats')
      .then((r) => { setS(r.data); setErr(''); })
      .catch(() => setErr('Stats unavailable. Is the backend running?'));
  }, [refreshKey]);

  if (err) return <p className="err">{err}</p>;
  if (!s) return <p className="muted">Loading stats...</p>;
  if (!s.total) return <p className="muted">No analyses yet. Analyze some text to fill the charts.</p>;

  const pct = Math.round((s.counts[0] / s.total) * 100);
  return (
    <>
      <div className="stats">
        <div><span className="num gold">{s.total}</span> analyses</div>
        <div><span className="num bolt">{pct}%</span> positive</div>
        <div><span className="num">{s.recent_scores.at(-1)}</span> latest score</div>
      </div>
      <div className="grid">
        <div className="panel">
          <Bar data={{
            labels: s.labels,
            datasets: [{ label: 'Predictions', data: s.counts,
              backgroundColor: ['#4CC9F0', '#9AA7B8', '#C1121F'] }],
          }} />
        </div>
        <div className="panel">
          <Line data={{
            labels: s.recent_scores.map((_, i) => `#${i + 1}`),
            datasets: [{ label: 'Recent scores', data: s.recent_scores,
              borderColor: '#E0B03A', backgroundColor: '#E0B03A', tension: 0.3 }],
          }} />
        </div>
      </div>
    </>
  );
}
