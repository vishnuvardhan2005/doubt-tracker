import { useCallback, useEffect, useState } from 'react';
import { getAllDoubts, resolveDoubt } from '../api';
import { StatusBadge, PriorityBadge } from './Badges';
import { PRIORITIES } from '../constants';

const STATUSES = ['OPEN', 'RESOLVED'];
const selectClass = 'rounded border border-gray-300 px-2 py-1 text-sm';

export default function AllDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      // Empty string = no filter, so omit it from the request.
      const data = await getAllDoubts({
        priority: priority || undefined,
        status: status || undefined,
      });
      setDoubts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoaded(true);
    }
  }, [priority, status]);

  // Reload on mount and whenever a filter changes.
  useEffect(() => {
    load();
  }, [load]);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">
          Priority{' '}
          <select
            className={selectClass}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-gray-600">
          Status{' '}
          <select
            className={selectClass}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loaded && !error && doubts.length === 0 && (
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
