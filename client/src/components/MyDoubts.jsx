import { useEffect, useState } from 'react';
import { getMyDoubts } from '../api';
import { StatusBadge, PriorityBadge } from './Badges';

export default function MyDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Identity comes from the auth cookie, so just load on mount.
  useEffect(() => {
    getMyDoubts()
      .then((data) => setDoubts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return <p className="text-sm text-gray-500">Loading…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (doubts.length === 0)
    return <p className="text-sm text-gray-500">No doubts yet.</p>;

  return (
    <ul className="space-y-2">
      {doubts.map((d) => (
        <li key={d.id} className="rounded border border-gray-200 p-3">
          <p className="text-sm">{d.question}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
            <span>{d.subject}</span>
            <PriorityBadge priority={d.priority} />
            <StatusBadge status={d.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}
