import { useEffect, useState } from 'react';
import { getAllDoubts, resolveDoubt } from '../api';
import { StatusBadge, PriorityBadge } from './Badges';

export default function AllDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const data = await getAllDoubts();
      setDoubts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoaded(true);
    }
  };

  // Identity comes from the auth cookie, so just load on mount.
  useEffect(() => {
    load();
  }, []);

  const handleResolve = async (id) => {
    setError(null);
    setResolvingId(id);
    try {
      await resolveDoubt(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setResolvingId(null);
    }
  };

  if (!loaded) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {doubts.length === 0 && !error && (
        <p className="text-sm text-gray-500">No doubts.</p>
      )}

      <ul className="space-y-2">
        {doubts.map((d) => (
          <li
            key={d.id}
            className="flex items-start justify-between rounded border border-gray-200 p-3"
          >
            <div>
              <p className="text-sm">{d.question}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                <span className="font-medium">{d.student?.name ?? 'Unknown'}</span>
                <span>·</span>
                <span>{d.subject}</span>
                <PriorityBadge priority={d.priority} />
                <StatusBadge status={d.status} />
              </div>
            </div>

            {d.status === 'OPEN' && (
              <button
                onClick={() => handleResolve(d.id)}
                disabled={resolvingId === d.id}
                className="ml-3 shrink-0 rounded border border-green-600 px-3 py-1 text-xs font-medium text-green-700 disabled:opacity-50"
              >
                {resolvingId === d.id ? 'Resolving…' : 'Resolve'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
