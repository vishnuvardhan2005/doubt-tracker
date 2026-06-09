import { useCallback, useEffect, useState } from 'react';
import { getMyDoubts } from '../api';
import { StatusBadge, PriorityBadge } from './Badges';

export default function MyDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [sortByPriority, setSortByPriority] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      // Identity comes from the auth cookie; only the sort is sent.
      const data = await getMyDoubts(
        sortByPriority ? { sort: 'priority' } : {}
      );
      setDoubts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoaded(true);
    }
  }, [sortByPriority]);

  // Reload on mount and whenever the sort toggles.
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setSortByPriority((v) => !v)}
        className={`rounded border px-3 py-1 text-sm font-medium ${
          sortByPriority
            ? 'border-blue-600 text-blue-700'
            : 'border-gray-300 text-gray-600'
        }`}
      >
        Sort by priority {sortByPriority ? '✓' : ''}
      </button>

      {!loaded && <p className="text-sm text-gray-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loaded && !error && doubts.length === 0 && (
        <p className="text-sm text-gray-500">No doubts yet.</p>
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
