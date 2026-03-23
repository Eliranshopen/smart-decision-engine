import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Shield, ExternalLink, Star, Volume2, VolumeX } from 'lucide-react';
import VideoModal from './VideoModal';

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function ScoreRing({ value, max = 15 }) {
  const pct = Math.min((value || 0) / max, 1);
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <div className="relative w-[52px] h-[52px] shrink-0">
      <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="#ffffff08" strokeWidth="4" />
        <circle cx="26" cy="26" r={r} fill="none" stroke="#f59e0b" strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-xs font-bold text-amber-400">{(value || 0).toFixed(1)}</span>
      </div>
    </div>
  );
}

export default function AffiliateCard({ affiliate, index = 0 }) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { site_name, affiliate_link, category, commission_pct,
    composite_score, risk_score, trend_score, trustworthiness,
    preview_video_url } = affiliate;

  const ytId = getYouTubeId(preview_video_url);
  const embedSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${ytId}&rel=0`
    : null;

  const catLabel = t(`card.categories.${category}`, { defaultValue: category });
  const isHot = (composite_score || 0) > 11;

  const riskBadge = (score) => {
    if ((score || 0) <= 3) return <span className="badge-green">{t('card.riskLevels.low')}</span>;
    if ((score || 0) <= 6) return <span className="badge-amber">{t('card.riskLevels.medium')}</span>;
    return <span className="badge-red">{t('card.riskLevels.high')}</span>;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
        whileHover={{ scale: embedSrc ? 1.025 : 1.01 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="glass-card flex flex-col overflow-hidden cursor-default"
        style={{ transition: 'box-shadow 0.3s ease' }}
      >
        {/* ── Hover video preview ── */}
        <AnimatePresence>
          {isHovered && embedSrc && (
            <motion.div
              key="video-preview"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 176, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              className="relative overflow-hidden bg-black"
              style={{ flexShrink: 0 }}
            >
              <iframe
                src={embedSrc}
                allow="autoplay; encrypted-media"
                className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                title={site_name}
              />
              {/* Gradient fade at bottom */}
              <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-ink-800/80 to-transparent pointer-events-none" />
              {/* Muted badge + click-to-sound */}
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                <VolumeX className="w-3 h-3 text-gray-300" />
                <span className="text-[10px] text-gray-300 font-mono">muted</span>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full
                           bg-amber-500/90 hover:bg-amber-400 text-ink-950 text-[11px] font-mono font-semibold
                           transition-colors backdrop-blur-sm"
              >
                <Volume2 className="w-3 h-3" />
                Watch with sound
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Card body ── */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="badge-gray">{catLabel}</span>
                {isHot && <span className="badge bg-amber-500/20 text-amber-300 border border-amber-400/30">{t('common.hot')}</span>}
              </div>
              <h3 className="font-display font-semibold text-white text-base leading-tight truncate" title={site_name}>
                {site_name}
              </h3>
            </div>
            <ScoreRing value={composite_score} />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-ink-900/60 rounded-lg p-2">
              <div className="font-mono text-amber-400 font-bold text-sm">
                {(commission_pct || 0) >= 100 ? `$${commission_pct}` : `${commission_pct}%`}
              </div>
              <div className="text-gray-500 text-[10px] font-mono mt-0.5">{t('card.commission')}</div>
            </div>
            <div className="bg-ink-900/60 rounded-lg p-2">
              <div className="flex items-center justify-center gap-0.5">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="font-mono text-emerald-400 font-bold text-sm">{(trend_score || 0).toFixed(1)}</span>
              </div>
              <div className="text-gray-500 text-[10px] font-mono mt-0.5">{t('card.trend')}</div>
            </div>
            <div className="bg-ink-900/60 rounded-lg p-2">
              <div className="flex items-center justify-center gap-0.5">
                <Shield className="w-3 h-3 text-gray-400" />
                <span className="font-mono text-gray-300 font-bold text-sm">{(trustworthiness || 0).toFixed(0)}/10</span>
              </div>
              <div className="text-gray-500 text-[10px] font-mono mt-0.5">Trust</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {riskBadge(risk_score)}
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-3 h-3 ${i <= Math.round((trustworthiness||0)/2) ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} />
              ))}
            </div>
          </div>

          <a
            href={affiliate_link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="amber-btn flex items-center justify-center gap-2 no-underline"
            onClick={(e) => !affiliate_link && e.preventDefault()}
          >
            {t('card.cta')} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </motion.div>

      {showModal && (
        <VideoModal
          url={preview_video_url}
          title={site_name}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
