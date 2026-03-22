import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Zap, Shield } from 'lucide-react';

export default function NewsItem({ item, index = 0 }) {
  const { t } = useTranslation();
  const { headline, source_url, summary, risk_level, opportunity_level, credibility, published_at } = item;

  const date = published_at
    ? new Date(published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const riskClass = {
    low: 'badge-green',
    medium: 'badge-amber',
    high: 'badge-red',
  }[risk_level] || 'badge-gray';

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="glass-card p-5 flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-white text-sm leading-snug mb-1">
            {source_url ? (
              <a href={source_url} target="_blank" rel="noopener noreferrer"
                className="hover:text-amber-400 transition-colors no-underline">
                {headline}
              </a>
            ) : headline}
          </h3>
          {summary && (
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{summary}</p>
          )}
        </div>
        {source_url && (
          <a href={source_url} target="_blank" rel="noopener noreferrer"
            className="shrink-0 text-gray-600 hover:text-amber-400 transition-colors no-underline">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {risk_level && <span className={riskClass}>{t(`news.filters.${risk_level}`, { defaultValue: risk_level })}</span>}
          {date && <span className="text-[10px] text-gray-600 font-mono">{date}</span>}
        </div>
        <div className="flex items-center gap-3">
          {credibility != null && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-gray-500">
              <Shield className="w-3 h-3" />{credibility}/10
            </span>
          )}
          {opportunity_level != null && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-amber-500">
              <Zap className="w-3 h-3" />{opportunity_level}/10
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
