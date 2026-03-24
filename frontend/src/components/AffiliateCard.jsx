import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles, Star, Zap } from 'lucide-react';
import VideoModal from './VideoModal';

// Subcategory colors for AI tools
const SUBCAT = {
  writing:    { label: 'Writing',    color: '#10b981', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  images:     { label: 'Images',     color: '#8b5cf6', bg: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  video:      { label: 'Video',      color: '#ef4444', bg: 'bg-red-500/15 text-red-300 border-red-500/30' },
  voice:      { label: 'Voice',      color: '#f97316', bg: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
  coding:     { label: 'Coding',     color: '#3b82f6', bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  automation: { label: 'Automation', color: '#06b6d4', bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
};

// Category colors for courses
const CAT = {
  courses:    { color: '#10b981', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', btn: 'from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400', glow: 'rgba(16,185,129,0.25)' },
  'ai-tools': { color: '#8b5cf6', bg: 'bg-violet-500/15 text-violet-300 border-violet-500/30', btn: 'from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500', glow: 'rgba(139,92,246,0.25)' },
};

const PRICING_BADGE = {
  free:      'bg-green-500/20 text-green-300 border-green-500/30',
  freemium:  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  paid:      'bg-white/10 text-white/50 border-white/20',
};

const SKILL_BADGE = {
  beginner:     { label: 'Beginner',     style: 'bg-green-500/15 text-green-300' },
  intermediate: { label: 'Intermediate', style: 'bg-yellow-500/15 text-yellow-300' },
  advanced:     { label: 'Advanced',     style: 'bg-red-500/15 text-red-300' },
  all:          { label: 'All levels',   style: 'bg-white/10 text-white/40' },
};

function ScoreBar({ score, max = 10 }) {
  const pct = Math.min((score || 0) / max, 1);
  const stars = Math.round(pct * 5);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-3 h-3 ${i <= stars ? 'text-amber-400 fill-amber-400' : 'text-white/10 fill-white/10'}`} />
        ))}
      </div>
      <span className="text-xs font-mono text-white/40">{(pct * 10).toFixed(1)}</span>
    </div>
  );
}

function getLogoUrl(affiliateLink) {
  try {
    const domain = new URL(affiliateLink).hostname.replace('www.', '');
    return `https://logo.clearbit.com/${domain}`;
  } catch { return null; }
}

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function AffiliateCard({ affiliate, index = 0, mode = 'tool' }) {
  const [imgError, setImgError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const {
    site_name, affiliate_link, category, subcategory,
    commission_pct, composite_score, preview_video_url,
    description, language, pricing_model, skill_level,
  } = affiliate;

  const logoUrl = getLogoUrl(affiliate_link);
  const ytId = getYouTubeId(preview_video_url);
  const isHot = (composite_score || 0) > 11;

  const subcat = SUBCAT[subcategory];
  const cat = CAT[category] || CAT['ai-tools'];
  const accentColor = subcat?.color || cat.color;
  const badgeBg = subcat?.bg || cat.bg;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative flex flex-col rounded-2xl overflow-hidden cursor-default group"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: accentColor }} />

        {/* Card Header */}
        <div className="p-4 flex items-start gap-3">
          {/* Logo */}
          <div
            className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
          >
            {logoUrl && !imgError ? (
              <img
                src={logoUrl}
                alt={site_name}
                className="w-8 h-8 object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-lg font-bold" style={{ color: accentColor }}>
                {site_name.charAt(0)}
              </span>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <h3 className="font-semibold text-white text-sm leading-tight truncate">
                {site_name}
              </h3>
              {isHot && <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
            </div>
            <div className="flex flex-wrap gap-1">
              {/* Subcategory or category badge */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeBg}`}>
                {subcat?.label || (category === 'courses' ? 'Course' : 'AI Tool')}
              </span>
              {/* Pricing badge (tools) */}
              {pricing_model && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${PRICING_BADGE[pricing_model]}`}>
                  {pricing_model === 'freemium' ? 'Freemium' : pricing_model === 'free' ? 'Free' : 'Paid'}
                </span>
              )}
              {/* Skill level badge (courses) */}
              {skill_level && SKILL_BADGE[skill_level] && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${SKILL_BADGE[skill_level].style}`}>
                  {SKILL_BADGE[skill_level].label}
                </span>
              )}
              {/* Hebrew badge */}
              {language === 'he' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  🇮🇱 עברית
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-4 pb-3 flex-1">
          {description && (
            <p className="text-xs text-white/45 leading-relaxed line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex flex-col gap-2.5">
          {/* Score + commission */}
          <div className="flex items-center justify-between">
            <ScoreBar score={composite_score} />
            {commission_pct > 0 && (
              <span className="text-[10px] font-mono" style={{ color: accentColor }}>
                {commission_pct >= 100 ? `$${commission_pct}` : `${commission_pct}%`} commission
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="flex gap-2">
            <a
              href={affiliate_link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => !affiliate_link && e.preventDefault()}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                          text-white text-xs font-semibold bg-gradient-to-r no-underline
                          transition-all duration-200 active:scale-95 ${cat.btn}`}
            >
              Try it free <ExternalLink className="w-3 h-3" />
            </a>
            {ytId && (
              <button
                onClick={() => setShowModal(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-all"
              >
                <Zap className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {showModal && (
        <VideoModal url={preview_video_url} title={site_name} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
