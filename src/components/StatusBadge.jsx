import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${PRIORITY_COLORS[priority] || 'bg-gray-400 text-white'}`}>
      {priority}
    </span>
  );
}
