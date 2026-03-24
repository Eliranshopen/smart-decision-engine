import { motion } from 'framer-motion';
import { ExternalLink, Star, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAffiliates } from '../hooks/useAffiliates';

const SUBCAT_COLOR = {
  writing:    '#10b981',
  images:     '#8b5cf6',
  video:      '#ef4444',
  voice:      '#f97316',
  coding:     '#3b82f6',
  automation: '#06b6d4',
};
const CAT_COLOR = {
  'ai-tools': '#8b5cf6',
  courses:    '#10b981',
};

function getColor(item) {
  return SUBCAT_COLOR[item.subcategory] || CAT_COLOR[item.category] || '#8b5cf6';
}

function getLogoDomain(link) {
  try { return new URL(link).hostname.replace('www.', ''); } catch { return null; }
}

function ScoreStars({ score, max = 10 }) {
  const stars = Math.round(Math.min((score || 0) / max, 1) * 5);
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= stars ? 'text-amber-400 fill-amber-400' : 'text-white/10 fill-white/10'}`} />
      ))}
    </div>
  );
}

function FeaturedCard({ item, index }) {
  const color = getColor(item);
  const domain = getLogoDomain(item.affiliate_link);
  const [imgErr, setImgErr] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}10 0%, rgba(255,255,255,0.02) 100%)`,
        border: `1px solid ${color}25`,
      }}
    >
      <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: color }} />

      <div className="p-5 flex-1">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
            {domain && !imgErr ? (
              <img src={`https://logo.clearbit.com/${domain}`} alt={item.site_name}
                className="w-7 h-7 object-contain" onError={() => setImgErr(true)} />
            ) : (
              <span className="text-base font-bold" style={{ color }}>{item.site_name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link to={`/tool/${item.slug || item.id}`}
              className="font-bold text-white text-sm hover:underline truncate block">
              {item.site_name}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <ScoreStars score={item.composite_score} />
              <span className="text-[10px] font-mono text-white/30">{((item.composite_score||0)/10).toFixed(1)}/10</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/45 leading-relaxed line-clamp-2 mb-4">
          {item.description}
        </p>

        <div className="flex gap-1 flex-wrap mb-4">
          {item.pricing_model && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              item.pricing_model === 'free' ? 'bg-green-500/15 text-green-300 border-green-500/25' :
              item.pricing_model === 'freemium' ? 'bg-blue-500/15 text-blue-300 border-blue-500/25' :
              'bg-white/10 text-white/50 border-white/15'
            }`}>
              {item.pricing_model === 'free' ? 'Free' : item.pricing_model === 'freemium' ? 'Freemium' : 'Paid'}
            </span>
          )}
          {item.subcategory && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
              style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
              {item.subcategory}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 flex gap-2">
        <a href={item.affiliate_link || '#'} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-semibold no-underline transition-all active:scale-95"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
          {item.pricing_model === 'paid' ? 'Get Started' : 'Try it Free'} <ExternalLink className="w-3 h-3" />
        </a>
        <Link to={`/tool/${item.slug || item.id}`}
          className="px-3 py-2 rounded-xl text-xs text-white/40 border border-white/10 hover:text-white/70 hover:border-white/20 transition-all">
          Details
        </Link>
      </div>
    </motion.div>
  );
}

// Need useState for FeaturedCard
import { useState } from 'react';

export default function FeaturedSection() {
  const { data, isLoading } = useAffiliates({ featured: 'true', limit: 6, sort: 'composite_score' });
  const items = data?.data ?? [];

  if (isLoading || items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-semibold text-white">Top Picks</span>
        <span className="text-xs text-white/25 font-mono">— editor's choice</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <FeaturedCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
