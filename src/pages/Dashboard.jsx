import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Plus, Search, AlertTriangle, CheckCircle2, Clock,
  FileWarning, ChevronRight, ListChecks, AlertCircle
} from 'lucide-react';
import { useCARContext } from '../context/CARContext';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/LanguageContext';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { CAR_STATUS, CAR_TYPES, PRIORITY_LEVELS } from '../utils/constants';

export function Dashboard({ onNavigate }) {
  const { cars, role } = useCARContext();
  const { currentUser: authUser } = useAuth();
  const t = useT();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const stats = useMemo(() => {
    const open = cars.filter((c) => c.status !== CAR_STATUS.CLOSED);
    const pending = cars.filter((c) => [CAR_STATUS.RCA_SUBMITTED, CAR_STATUS.ACTION_SUBMITTED].includes(c.status));
    return {
      total: cars.length,
      open: open.length,
      pending: pending.length,
      closed: cars.filter((c) => c.status === CAR_STATUS.CLOSED).length,
    };
  }, [cars]);

  const STAT_CONFIG = [
    { key: 'total', label: t('dashboard', 'totalCARs'), icon: ListChecks, color: 'bg-slate-700' },
    { key: 'open', label: t('dashboard', 'open'), icon: AlertCircle, color: 'bg-blue-600' },
    { key: 'pending', label: t('dashboard', 'pendingReview'), icon: Clock, color: 'bg-amber-500' },
    { key: 'closed', label: t('dashboard', 'closed'), icon: CheckCircle2, color: 'bg-emerald-600' },
  ];

  const statusLabels = {
    DRAFT: t('status', 'DRAFT'),
    ISSUED: t('status', 'ISSUED'),
    RCA_SUBMITTED: t('status', 'RCA_SUBMITTED'),
    RCA_APPROVED: t('status', 'RCA_APPROVED'),
    RCA_REJECTED: t('status', 'RCA_REJECTED'),
    ACTION_SUBMITTED: t('status', 'ACTION_SUBMITTED'),
    CLOSED: t('status', 'CLOSED'),
  };

  const filtered = useMemo(() => {
    let list = cars;
    if (role === 'stakeholder') {
      // Hide drafts and only show CARs assigned to this user
      list = list.filter((c) => c.status !== CAR_STATUS.DRAFT);
      if (authUser) {
        list = list.filter((c) =>
          // new: multi-user array
          c.responsibleUsers?.some((u) => u.id === authUser.id) ||
          // legacy: single responsibleUserId
          c.responsibleUserId === authUser.id ||
          // backward-compat: name match when no userId recorded
          (!c.responsibleUserId && !c.responsibleUsers?.length &&
            c.responsiblePerson?.toLowerCase() === authUser.name?.toLowerCase()),
        );
      }
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.carNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.responsiblePerson?.toLowerCase().includes(q) ||
          c.responsibleOrganization?.toLowerCase().includes(q)
      );
    }
    if (filterStatus) list = list.filter((c) => c.status === filterStatus);
    if (filterType) list = list.filter((c) => c.carType === filterType);
    if (filterPriority) list = list.filter((c) => c.priority === filterPriority);
    return list;
  }, [cars, role, search, filterStatus, filterType, filterPriority]);

  const statusCounts = useMemo(() => {
    const counts = {};
    (role === 'stakeholder' ? cars.filter((c) => c.status !== CAR_STATUS.DRAFT) : cars).forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return counts;
  }, [cars, role]);

  const visibleTotal = useMemo(() => {
    if (role !== 'stakeholder') return cars.length;
    const nonDraft = cars.filter((c) => c.status !== CAR_STATUS.DRAFT);
    if (!authUser) return nonDraft.length;
    return nonDraft.filter((c) =>
      c.responsibleUsers?.some((u) => u.id === authUser.id) ||
      c.responsibleUserId === authUser.id ||
      (!c.responsibleUserId && !c.responsibleUsers?.length &&
        c.responsiblePerson?.toLowerCase() === authUser.name?.toLowerCase()),
    ).length;
  }, [cars, role, authUser]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CONFIG.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
            <div className={`${color} p-3 rounded-xl`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats[key]}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {role === 'safety' ? t('dashboard', 'titleAll') : t('dashboard', 'titleMy')}
          </h2>
          {role === 'safety' && (
            <button
              onClick={() => onNavigate('create')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> {t('dashboard', 'newCAR')}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-gray-50 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('dashboard', 'searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
          >
            <option value="">{t('dashboard', 'allStatuses')}</option>
            {Object.entries(statusLabels).map(([k, v]) => (
              <option key={k} value={k}>{v} {statusCounts[k] ? `(${statusCounts[k]})` : ''}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
          >
            <option value="">{t('dashboard', 'allTypes')}</option>
            {CAR_TYPES.map((type) => (
              <option key={type} value={type}>{t('carTypes', type)}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
          >
            <option value="">{t('dashboard', 'allPriorities')}</option>
            {PRIORITY_LEVELS.map((p) => (
              <option key={p} value={p}>{t('priority', p)}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileWarning className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {cars.length === 0 ? t('dashboard', 'noCARsYet') : t('dashboard', 'searchPlaceholder')}
            </p>
            {role === 'safety' && cars.length === 0 && (
              <button onClick={() => onNavigate('create')} className="mt-4 text-sm text-blue-600 hover:underline">
                {t('dashboard', 'createNewCAR')}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium">{t('dashboard', 'colCAR')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('dashboard', 'colTitle')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('dashboard', 'colType')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('dashboard', 'colPriority')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('dashboard', 'colResponsible')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('dashboard', 'colStatus')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('dashboard', 'colDue')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((car) => {
                  const overdue = car.dueDate && new Date(car.dueDate) < new Date() && car.status !== CAR_STATUS.CLOSED;
                  return (
                    <tr
                      key={car.id}
                      onClick={() => onNavigate('detail', car.id)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono font-medium text-blue-700 text-xs whitespace-nowrap">
                        {car.carNumber}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-medium text-gray-900 truncate">{car.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{car.findingLocation || '—'}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {t('carTypes', car.carType)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <PriorityBadge priority={car.priority} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-gray-700 truncate max-w-[150px]">{car.responsiblePerson || '—'}</div>
                        <div className="text-xs text-gray-400 truncate">{car.responsibleOrganization || ''}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={car.status} />
                      </td>
                      <td className={`px-4 py-3.5 text-xs whitespace-nowrap ${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        {car.dueDate ? (
                          <span className="flex items-center gap-1">
                            {overdue && <AlertTriangle className="w-3 h-3" />}
                            {format(new Date(car.dueDate), 'dd MMM yyyy')}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
          {t('dashboard', 'showing')} {filtered.length} {t('dashboard', 'of')} {visibleTotal} {t('dashboard', 'records')}
        </div>
      </div>
    </div>
  );
}
