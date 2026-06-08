import { useState } from 'react';
import { getMyDoubts } from '../api';
import { StatusBadge, PriorityBadge } from './Badges';

const inputClass = 'flex-1 rounded border border-gray-300 px-3 py-2 text-sm';

export default function MyDoubts() {
  const [userId, setUserId] = useState('');
  const [doubts, setDoubts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async (e) => {
    e.preventDefault();
    setError(null);

    if (!userId.trim()) {
      setError('Enter a user ID.');
      return;
    }

    setLoading(true);
    try {
      const data = await getMyDoubts(userId.trim());
      setDoubts(data);
      setLoaded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={load} className="flex gap-2">
        <input
          className={inputClass}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="your user ID"
        />
        <button
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Load'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loaded && !error && doubts.length === 0 && (
        <p className="text-sm text-gray-500">No doubts found.</p>
      )}

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
    </div>
  );
}
