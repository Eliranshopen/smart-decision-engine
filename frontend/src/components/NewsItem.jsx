import { motion } from 'framer-motion';

const RISK_BADGE = {
  low:    'bg-green-900 text-green-300',
  medium: 'bg-yellow-900 text-yellow-300',
  high:   'bg-red-900   text-red-300',
};

export default function NewsItem({ item }) {
  const { headline, source_url, summary, risk_level, opportunity_level, credibility, published_at } = item;

  const date = published_at
    ? new Date(published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <motion.article
      className="card hover:border-gray-700 transition-all"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm leading-snug mb-1">
            {source_url ? (
              <a href={source_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">
                {headline}
              </a>
            ) : headline}
          </h3>
          {summary && (
            <p className="text-xs text-gray-400 line-clamp-2">{summary}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {risk_level && (
            <span className={`badge ${RISK_BADGE[risk_level] || 'bg-gray-800 text-gray-300'}`}>
              {risk_level} risk
            </span>
          )}
          {opportunity_level && (
            <span className="badge bg-brand-900/50 text-brand-300">
              ⚡ {opportunity_level}/10
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
        {date && <span>{date}</span>}
        {credibility && <span>Credibility: {credibility}/10</span>}
      </div>
    </motion.article>
  );
}
