import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  ShieldCheck, Search, Filter, RefreshCw, Download,
  Trash2, PlusCircle, Edit3, AlertTriangle, Clock,
  User, Database, ArrowUpDown, ChevronDown, X, Activity
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────
const ACTION_CONFIG = {
  CREATE: {
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    Icon: PlusCircle,
  },
  DELETE: {
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
    Icon: Trash2,
  },
  UPDATE: {
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
    Icon: Edit3,
  },
  USER_STATUS_CHANGE: {
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
    Icon: AlertTriangle,
  },
};

const DEFAULT_CONFIG = {
  color: 'text-slate-700 dark:text-slate-300',
  bg: 'bg-slate-50 dark:bg-slate-800/30',
  border: 'border-slate-200 dark:border-slate-700',
  dot: 'bg-slate-400',
  Icon: Activity,
};

const ENTITIES = ['User', 'QuestionBank', 'PlacementDrive', 'Company', 'MockSession'];
const ACTION_TYPES = ['CREATE', 'DELETE', 'UPDATE', 'USER_STATUS_CHANGE'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getActionConfig = (type) => ACTION_CONFIG[type] || DEFAULT_CONFIG;

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true,
  });
};

const formatTimeAgo = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── Sub-components ──────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, border }) => (
  <div className={`bg-white dark:bg-[#1f2028] rounded-2xl border ${border} p-5 flex items-center gap-4 shadow-sm`}>
    <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shadow-sm`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{value}</p>
      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">{label}</p>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefresh] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setAction] = useState('');
  const [entityFilter, setEntity] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [expandedId, setExpanded] = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefresh(true);
    try {
      const res = await axios.get('/api/admin/logs');
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const filtered = logs
    .filter(l => {
      const matchSearch = !search ||
        l.details?.toLowerCase().includes(search.toLowerCase()) ||
        l.AdminUser?.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.target_entity?.toLowerCase().includes(search.toLowerCase());
      const matchAction = !actionFilter || l.action_type === actionFilter;
      const matchEntity = !entityFilter || l.target_entity === entityFilter;
      return matchSearch && matchAction && matchEntity;
    })
    .sort((a, b) => {
      const diff = new Date(b.createdAt) - new Date(a.createdAt);
      return sortDesc ? diff : -diff;
    });

  const stats = {
    total: logs.length,
    creates: logs.filter(l => l.action_type === 'CREATE').length,
    deletes: logs.filter(l => l.action_type === 'DELETE').length,
    updates: logs.filter(l => l.action_type === 'UPDATE' || l.action_type === 'USER_STATUS_CHANGE').length,
  };

  // ── CSV export ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const header = ['ID', 'Timestamp', 'Admin', 'Action', 'Entity', 'Details'].join(',');
    const rows = filtered.map(l => [
      l.id,
      new Date(l.createdAt).toISOString(),
      `"${l.AdminUser?.name || 'Unknown'}"`,
      l.action_type,
      l.target_entity,
      `"${(l.details || '').replace(/"/g, "'")}"`,
    ].join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/25">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Audit Trail</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm ml-14">
            Immutable chronological log of all administrative actions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="refresh-logs-btn"
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-[#2e303a] bg-white dark:bg-[#1f2028] rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            id="export-logs-btn"
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-700 dark:hover:bg-slate-100 transition shadow-md"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Total Events" value={stats.total} color="bg-slate-700" border="border-slate-200 dark:border-[#2e303a]" />
        <StatCard icon={PlusCircle} label="Create Actions" value={stats.creates} color="bg-emerald-600" border="border-emerald-100 dark:border-emerald-900/30" />
        <StatCard icon={Trash2} label="Delete Actions" value={stats.deletes} color="bg-red-600" border="border-red-100 dark:border-red-900/30" />
        <StatCard icon={Edit3} label="Modify Actions" value={stats.updates} color="bg-blue-600" border="border-blue-100 dark:border-blue-900/30" />
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1f2028] border border-slate-200 dark:border-[#2e303a] rounded-2xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="audit-search"
            type="text"
            placeholder="Search by admin, entity, or details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-[#16171d] border border-slate-200 dark:border-[#2e303a] rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Type Filter */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#16171d] border border-slate-200 dark:border-[#2e303a] rounded-xl px-3 py-2.5 min-w-[160px]">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            id="action-filter"
            value={actionFilter}
            onChange={e => setAction(e.target.value)}
            className="bg-black text-sm font-bold text-slate-700 dark:text-slate-200 outline-none flex-1"
          >
            <option value="">All Actions</option>
            {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Entity Filter */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#16171d] border border-slate-200 dark:border-[#2e303a] rounded-xl px-3 py-2.5 min-w-[160px]">
          <Database size={14} className="text-slate-400 shrink-0" />
          <select
            id="entity-filter"
            value={entityFilter}
            onChange={e => setEntity(e.target.value)}
            className="bg-black text-sm font-bold text-slate-700 dark:text-slate-200 outline-none flex-1"
          >
            <option value="">All Entities</option>
            {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {/* Sort toggle */}
        <button
          id="sort-toggle-btn"
          onClick={() => setSortDesc(prev => !prev)}
          className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-[#16171d] border border-slate-200 dark:border-[#2e303a] rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowUpDown size={14} />
          {sortDesc ? 'Newest First' : 'Oldest First'}
        </button>

        {(search || actionFilter || entityFilter) && (
          <button
            onClick={() => { setSearch(''); setAction(''); setEntity(''); }}
            className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Log count ─────────────────────────────────────────────────── */}
      {!loading && (
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Showing {filtered.length} of {logs.length} events
        </p>
      )}

      {/* ── Log List ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white dark:bg-[#1f2028] rounded-2xl border border-slate-100 dark:border-[#2e303a] p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-2/3" />
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-20 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#1f2028] rounded-3xl border border-dashed border-slate-200 dark:border-[#2e303a] text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck size={28} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-black text-slate-700 dark:text-slate-200">No Audit Events Found</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 max-w-xs">
            {logs.length === 0
              ? 'No administrative actions have been recorded yet.'
              : 'No events match your current filters. Try adjusting your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((log, idx) => {
            const cfg = getActionConfig(log.action_type);
            const isExpanded = expandedId === log.id;
            return (
              <div
                key={log.id}
                className={`bg-white dark:bg-[#1f2028] rounded-2xl border transition-all duration-200 overflow-hidden ${isExpanded
                  ? `border-l-4 ${cfg.border} shadow-md`
                  : `border-slate-100 dark:border-[#2e303a] hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm`
                  }`}
              >
                {/* Main row */}
                <button
                  id={`audit-row-${log.id}`}
                  onClick={() => setExpanded(isExpanded ? null : log.id)}
                  className="w-full flex items-center gap-4 p-4 sm:p-5 text-left"
                >
                  {/* Action Icon */}
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                    <cfg.Icon size={18} className={cfg.color} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {/* Action badge */}
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                        {log.action_type}
                      </span>
                      {/* Entity badge */}
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-[#2e303a] bg-slate-50 dark:bg-[#16171d] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Database size={8} /> {log.target_entity}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {log.details || 'No details recorded.'}
                    </p>
                  </div>

                  {/* Admin + time */}
                  <div className="shrink-0 text-right hidden sm:block">
                    <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      <User size={11} />
                      <span>{log.AdminUser?.name || 'Unknown Admin'}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      <Clock size={10} />
                      <span>{formatTimeAgo(log.createdAt)}</span>
                    </div>
                  </div>

                  {/* Expand icon */}
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Expanded details panel */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-[#2e303a] px-5 py-4 bg-slate-50/50 dark:bg-[#16171d]/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">Log ID</p>
                        <p className="font-bold text-slate-700 dark:text-slate-200 font-mono">#{log.id}</p>
                      </div>
                      <div>
                        <p className="font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">Admin</p>
                        <p className="font-bold text-slate-700 dark:text-slate-200">{log.AdminUser?.name || '—'}</p>
                        <p className="text-slate-400 dark:text-slate-500">{log.AdminUser?.email || ''}</p>
                      </div>
                      <div>
                        <p className="font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">Timestamp</p>
                        <p className="font-bold text-slate-700 dark:text-slate-200">{formatDate(log.createdAt)}</p>
                      </div>
                      <div>
                        <p className="font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">Full Details</p>
                        <p className="font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{log.details || 'No additional details.'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Live indicator footer ─────────────────────────────────────── */}
      {!loading && logs.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-slate-400 dark:text-slate-500">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          Audit trail is live · Last synced {formatTimeAgo(logs[0]?.createdAt)}
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
