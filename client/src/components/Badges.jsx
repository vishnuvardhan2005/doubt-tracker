const base = 'inline-block rounded px-2 py-0.5 text-xs font-medium';

export function StatusBadge({ status }) {
  const style =
    status === 'RESOLVED'
      ? 'bg-green-100 text-green-800'
      : 'bg-amber-100 text-amber-800';
  return <span className={`${base} ${style}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  const styles = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-red-100 text-red-800',
  };
  return <span className={`${base} ${styles[priority] || ''}`}>{priority}</span>;
}
