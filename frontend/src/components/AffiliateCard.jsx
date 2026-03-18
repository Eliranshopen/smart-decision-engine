import { motion } from 'framer-motion';

const RISK_COLOR = {
  low: 'bg-green-900 text-green-300',
  medium: 'bg-yellow-900 text-yellow-300',
  high: 'bg-red-900 text-red-300',
};

function TrustBadge({ score }) {
  const pct = Math.round((score / 10) * 100);
  const color =
    pct >= 70 ? 'text-green-400' :
    pct >= 40 ? 'text-yellow-400' :
    'text-red-400';

  return (
    <span className={`text-xs font-semibold ${color}`}>
      ★ {(score || 0).toFixed(1)}/10
    </span>
  );
}

export default function AffiliateCard({ affiliate, label }) {
  const {
    site_name,
    affiliate_link,
    category,
    commission_pct,
    composite_score,
    trend_score,
    risk_score,
  } = affiliate;

  const riskColor = risk_score > 6 ? RISK_COLOR.high : risk_score > 3 ? RISK_COLOR.medium : RISK_COLOR.low;

  return (
    <motion.div
      className="card hover:border-gray-600 hover:-translate-y-0.5 hover:shadow-xl cursor-default flex flex-col gap-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          {label && (
            <span className="badge bg-gray-800 text-gray-300 mb-1">{label}</span>
          )}
          <h3 className="font-semibold text-white text-base leading-snug">{site_name}</h3>
          <span className="text-xs text-gray-400 capitalize">{category?.replace('-', ' ')}</span>
        </div>
        <TrustBadge score={composite_score} />
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2 text-xs">
        {commission_pct && (
          <span className="badge bg-brand-700/40 text-brand-300">
            {commission_pct}% commission
          </span>
        )}
        {trend_score && (
          <span className="badge bg-gray-800 text-gray-300">
            📈 Trend {trend_score.toFixed(1)}
          </span>
        )}
        {risk_score !== null && (
          <span className={`badge ${riskColor}`}>
            Risk {risk_score.toFixed(1)}
          </span>
        )}
      </div>

      {/* CTA */}
      <a
        href={affiliate_link || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto block text-center text-sm font-semibold py-2 px-4 rounded-lg
          bg-brand-600 hover:bg-brand-500 text-white no-underline transition-colors"
        onClick={(e) => !affiliate_link && e.preventDefault()}
      >
        View Opportunity →
      </a>
    </motion.div>
  );
}
