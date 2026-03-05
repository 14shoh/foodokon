import { motion } from 'framer-motion';

export default function StatCard({ icon, label, value, sub, color = 'accent', delay = 0 }) {
  const colors = {
    accent:  'from-accent/20 to-accent/5 border-accent/30',
    violet:  'from-violet/20 to-violet/5 border-violet/30',
    green:   'from-green-500/20 to-green-500/5 border-green-500/30',
    red:     'from-red-500/20 to-red-500/5 border-red-500/30',
    blue:    'from-blue-500/20 to-blue-500/5 border-blue-500/30',
  };
  const iconColors = {
    accent: 'text-accent', violet: 'text-violet-400', green: 'text-green-400',
    red: 'text-red-400', blue: 'text-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`glass-card bg-gradient-to-br ${colors[color]} border p-6 rounded-2xl`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {sub && <p className="text-white/40 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`text-3xl ${iconColors[color]}`}>{icon}</div>
      </div>
    </motion.div>
  );
}
