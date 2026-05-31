import { STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';
import { useT } from '../context/LanguageContext';

export function StatusBadge({ status }) {
  const t = useT();
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
      {t('status', status) || status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const t = useT();
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${PRIORITY_COLORS[priority] || 'bg-gray-400 text-white'}`}>
      {t('priority', priority) || priority}
    </span>
  );
}
