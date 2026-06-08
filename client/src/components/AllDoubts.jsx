import { useState } from 'react';
import { getAllDoubts, resolveDoubt } from '../api';
import { StatusBadge, PriorityBadge } from './Badges';

const inputClass = 'flex-1 rounded border border-gray-300 px-3 py-2 text-sm';

export default function AllDoubts() {
  const [teacherId, setTeacherId] = useState('');
  const [doubts, setDoubts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  const load = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (!teacherId.trim()) {
      setError('Enter a teacher ID.');
      return;
    }

    setLoading(true);
    try {
      const data = await getAllDoubts(teacherId.trim());
      setDoubts(data);
      setLoaded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    setError(null);
    setResolvingId(id);
    try {
      await resolveDoubt(id, teacherId.trim());
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={load} className="flex gap-2">
        <input
          className={inputClass}
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          placeholder="your teacher ID"
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
