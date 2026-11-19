import { useEffect, useState } from 'react';
import api from '../services/api';

export default function History({ refreshKey }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/predictions', { params: { limit: 10 } })
      .then((r) => setRows(r.data))
      .catch(() => setRows([]));
  }, [refreshKey]);

  if (!rows.length) return null;
  return (
    <section className="panel">
      <h2>Recent analyses</h2>
      <div className="scroll">
        <table>
          <thead>
            <tr><th>Text</th><th>Mood</th><th>Score</th><th>When</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="clip">{r.text}</td>
                <td><span className={`badge ${r.label}`}>{r.label}</span></td>
                <td>{r.score}</td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
