import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Volume2, VolumeX, Sparkles, Star } from 'lucide-react';
import VideoModal from './VideoModal';

// Category visual identity
const CAT = {
  'courses':  {
    label: 'Course',
    from: '#10b981', to: '#0d9488',
    glow: 'rgba(16,185,129,0.3)',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    btn: 'from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400',
  },
  'ai-tools': {
    label: 'AI Tool',
    from: '#8b5cf6', to: '#6d28d9',
    glow: 'rgba(139,92,246,0.3)',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    btn: 'from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500',
  },
  'saas': {
    label: 'SaaS',
    from: '#3b82f6', to: '#0891b2',
    glow: 'rgba(59,130,246,0.3)',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    btn: 'from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400',
  },
  'finance': {
    label: 'Finance',
    from: '#f97316', to: '#d97706',
    glow: 'rgba(249,115,22,0.3)',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    btn: 'from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400',
  },
};

const DEFAULT_CAT = {
  label: 'Other',
  from: '#ec4899', to: '#be185d',
  glow: 'rgba(236,72,153,0.3)',
  badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  btn: 'from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400',
};

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function ScoreStars({ score, max = 10 }) {
  const normalized = Math.min((score || 0) / max, 1);
  const stars = Math.round(normalized * 5);
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 transition-colors ${
            i <= stars ? 'text-amber-400 fill-amber-400' : 'text-white/10 fill-white/10'
          }`}
        />
      ))}
      <span className="ml-1.5 text-xs font-mono text-white/40">{(normalized * 10).toFixed(1)}</span>
    </div>
  );
}

export default function AffiliateCard({ affiliate, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const {
    site_name, affiliate_link, category,
    commission_pct, composite_score, preview_video_url,
  } = affiliate;

  const cat = CAT[category] || DEFAULT_CAT;
  const ytId = getYouTubeId(preview_video_url);
  const embedSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${ytId}&rel=0`
    : null;

  const isHot = (composite_score || 0) > 11;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -4 }}
        className="relative flex flex-col rounded-2xl overflow-hidden cursor-default group"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: isHovered
            ? `0 20px 60px -10px ${cat.glow}, 0 0 0 1px rgba(255,255,255,0.1)`
            : '0 4px 24px rgba(0,0,0,0.3)',
          transition: 'box-shadow 0.4s ease',
        }}
      >
        {/* ── Colored top accent line ── */}
        <div
          className="absolute top-0 inset-x-0 h-[2px] z-10"
          style={{ background: `linear-gradient(90deg, ${cat.from}, ${cat.to})` }}
        />

        {/* ── Banner: thumbnail → video on hover ── */}
        <div className="relative h-36 overflow-hidden flex-shrink-0">
          {/* YouTube thumbnail (always visible when available) */}
          {ytId ? (
            <img
              src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
              alt={site_name}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              style={{ opacity: isHovered ? 0 : 1 }}
            />
          ) : (
            <>
              {/* Fallback gradient background */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${cat.from}40 0%, ${cat.to}20 50%, rgba(0,0,0,0) 100%)`,
                }}
              />
              {/* Decorative blobs */}
              <div
                className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20 blur-2xl"
                style={{ background: cat.from }}
              />
              <div
                className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full opacity-10 blur-xl"
                style={{ background: cat.to }}
              />
            </>
          )}

          {/* Category label in banner */}
          <div className="absolute top-3 left-3 z-10">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${cat.badge}`}>
              {cat.label}
              {isHot && <Sparkles className="w-3 h-3 fill-current" />}
            </span>
          </div>

          {/* Video preview */}
          <AnimatePresence>
            {isHovered && embedSrc && (
              <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black"
              >
                <iframe
                  src={embedSrc}
                  allow="autoplay; encrypted-media"
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                  title={site_name}
                />
                {/* Gradient fade at bottom */}
                <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                {/* Controls */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 backdrop-blur-sm">
                  <VolumeX className="w-3 h-3 text-white/70" />
                  <span className="text-[10px] text-white/70 font-mono">muted</span>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full
                             bg-white/90 hover:bg-white text-black text-[11px] font-semibold
                             transition-colors backdrop-blur-sm"
                >
                  <Volume2 className="w-3 h-3" />
                  Watch
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Card body ── */}
        <div className="flex flex-col flex-1 p-4 gap-3">
          {/* Name */}
          <h3
            className="font-display font-semibold text-white leading-snug line-clamp-2 text-[15px]"
            title={site_name}
          >
            {site_name}
          </h3>

          {/* Score */}
          <ScoreStars score={composite_score} />

          {/* Commission */}
          {commission_pct > 0 && (
            <p className="text-xs font-mono text-white/40">
              Earn{' '}
              <span className="font-bold" style={{ color: cat.from }}>
                {commission_pct >= 100 ? `$${commission_pct}` : `${commission_pct}%`}
              </span>
              {' '}per sale
            </p>
          )}

          {/* CTA */}
          <a
            href={affiliate_link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => !affiliate_link && e.preventDefault()}
            className={`mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl
                        text-white text-sm font-semibold bg-gradient-to-r no-underline
                        transition-all duration-200 active:scale-95 ${cat.btn}`}
            style={{ boxShadow: `0 4px 15px ${cat.glow}` }}
          >
            Explore Now <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </motion.div>

      {showModal && (
        <VideoModal url={preview_video_url} title={site_name} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
