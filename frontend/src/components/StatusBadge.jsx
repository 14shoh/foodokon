const STATUS_CONFIG = {
  pending:    { label: 'Ожидает',     color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', dot: 'bg-yellow-400' },
  confirmed:  { label: 'Принят',      color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',    dot: 'bg-blue-400' },
  preparing:  { label: 'Готовится',   color: 'bg-violet-500/20 text-violet-300 border border-violet-500/30', dot: 'bg-violet-400 animate-pulse' },
  delivering: { label: 'В доставке',  color: 'bg-accent/20 text-accent border border-accent/30',          dot: 'bg-accent animate-pulse' },
  delivered:  { label: 'Доставлен',   color: 'bg-green-500/20 text-green-300 border border-green-500/30', dot: 'bg-green-400' },
  cancelled:  { label: 'Отменён',     color: 'bg-red-500/20 text-red-300 border border-red-500/30',       dot: 'bg-red-400' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`status-badge ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
