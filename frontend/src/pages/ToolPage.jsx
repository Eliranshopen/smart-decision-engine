import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ExternalLink, ArrowLeft, Star, CheckCircle, Globe, Zap, TrendingUp } from 'lucide-react';
import api from '../lib/api';
import AffiliateCard from '../components/AffiliateCard';
import { useAffiliates } from '../hooks/useAffiliates';

const SUBCAT_COLOR = {
  writing:    '#10b981',
  images:     '#8b5cf6',
  video:      '#ef4444',
  voice:      '#f97316',
  coding:     '#3b82f6',
  automation: '#06b6d4',
};
const CAT_COLOR = { 'ai-tools': '#8b5cf6', courses: '#10b981' };

function getColor(item) {
  return SUBCAT_COLOR[item?.subcategory] || CAT_COLOR[item?.category] || '#8b5cf6';
}

function ScoreBar({ score, max = 10, label }) {
  const pct = Math.min((score || 0) / max, 1);
  const color = pct >= 0.8 ? '#10b981' : pct >= 0.6 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-white/40 w-28">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct * 100}%`, background: color }} />
      </div>
      <span className="text-xs font-mono text-white/40 w-8 text-right">{(pct * 10).toFixed(1)}</span>
    </div>
  );
}

function StarRating({ score, max = 10 }) {
  const stars = Math.round(Math.min((score || 0) / max, 1) * 5);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-5 h-5 ${i <= stars ? 'text-amber-400 fill-amber-400' : 'text-white/10 fill-white/10'}`} />
      ))}
    </div>
  );
}

export default function ToolPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);

  const { data: resp, isLoading, error } = useQuery({
    queryKey: ['tool', slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/affiliates/${slug}`);
      return data;
    },
  });

  const tool = resp?.data;
  const color = getColor(tool);

  // Related tools: same subcategory
  const { data: relatedResp } = useAffiliates({
    limit: 4, sort: 'composite_score',
  });
  const related = (relatedResp?.data ?? [])
    .filter(t => t.id !== tool?.id && (t.subcategory === tool?.subcategory || t.category === tool?.category))
    .slice(0, 4);

  // SEO: update document title
  useEffect(() => {
    if (tool) document.title = `${tool.site_name} — AI Tool Review | Smart Decision Engine`;
    return () => { document.title = 'Smart Decision Engine'; };
  }, [tool]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !tool) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-white/50">Tool not found.</p>
      <Link to="/dashboard" className="text-violet-400 hover:underline text-sm">← Back to Dashboard</Link>
    </div>
  );

  const domain = (() => { try { return new URL(tool.affiliate_link).hostname.replace('www.', ''); } catch { return null; } })();
  const score = tool.composite_score || 0;

  return (
    <div className="min-h-screen">
      {/* Back */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-8 pb-2">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
          style={{
            background: `linear-gradient(135deg, ${color}10 0%, rgba(255,255,255,0.02) 100%)`,
            border: `1px solid ${color}25`,
          }}>
          <div className="absolute top-0 inset-x-0 h-[3px]" style={{ background: color }} />

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              {domain && !imgErr ? (
                <img src={`https://logo.clearbit.com/${domain}`} alt={tool.site_name}
                  className="w-10 h-10 object-contain" onError={() => setImgErr(true)} />
              ) : (
                <span className="text-2xl font-bold" style={{ color }}>{tool.site_name.charAt(0)}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-white">{tool.site_name}</h1>
                {tool.is_featured && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                    ★ Top Pick
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {tool.subcategory && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                    {tool.subcategory}
                  </span>
                )}
                {tool.pricing_model && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    tool.pricing_model === 'free' ? 'bg-green-500/15 text-green-300 border-green-500/25' :
                    tool.pricing_model === 'freemium' ? 'bg-blue-500/15 text-blue-300 border-blue-500/25' :
                    'bg-white/10 text-white/50 border-white/15'
                  }`}>
                    {tool.pricing_model === 'freemium' ? 'Freemium' : tool.pricing_model === 'free' ? 'Free' : 'Paid'}
                  </span>
                )}
                {tool.language === 'he' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                    🇮🇱 עברית
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <StarRating score={score} />
                <span className="text-xl font-bold text-white">{(score / 10).toFixed(1)}</span>
                <span className="text-sm text-white/30">/ 10</span>
              </div>

              {tool.description && (
                <p className="text-sm text-white/55 leading-relaxed">{tool.description}</p>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={tool.affiliate_link || '#'} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white no-underline transition-all active:scale-95"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
              {tool.pricing_model === 'paid' ? 'Get Started' : tool.pricing_model === 'free' ? 'Use for Free' : 'Try it Free'}
              <ExternalLink className="w-4 h-4" />
            </a>
            {domain && (
              <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-white/50 border border-white/10 hover:text-white/70 hover:border-white/20 transition-all no-underline">
                <Globe className="w-4 h-4" /> Visit Website
              </a>
            )}
          </div>
        </motion.div>

        {/* Scores breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-4 rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-white/30" /> Score Breakdown
          </h2>
          <div className="space-y-3">
            <ScoreBar score={tool.popularity_score} label="Popularity" />
            <ScoreBar score={tool.trend_score} label="Trending" />
            <ScoreBar score={tool.trustworthiness} label="Trustworthiness" />
            <ScoreBar score={tool.conversion_score} label="Conversion" />
            <ScoreBar score={tool.ease_of_joining} label="Ease of Use" />
          </div>
        </motion.div>

        {/* Why we recommend it */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mt-4 rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Why We Recommend It
          </h2>
          <ul className="space-y-2">
            {tool.composite_score >= 8 && (
              <li className="flex items-center gap-2 text-sm text-white/55">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                Top-rated in its category with a score of {(score/10).toFixed(1)}/10
              </li>
            )}
            {tool.pricing_model !== 'paid' && (
              <li className="flex items-center gap-2 text-sm text-white/55">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                {tool.pricing_model === 'free' ? 'Completely free — no credit card required' : 'Free plan available — try before you pay'}
              </li>
            )}
            {(tool.trustworthiness || 0) >= 8 && (
              <li className="flex items-center gap-2 text-sm text-white/55">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                Trusted platform with a strong track record
              </li>
            )}
            {(tool.trend_score || 0) >= 8 && (
              <li className="flex items-center gap-2 text-sm text-white/55">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                Trending rapidly — growing user base in 2025
              </li>
            )}
          </ul>
        </motion.div>

        {/* Related tools */}
        {related.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-8">
            <h2 className="text-sm font-semibold text-white mb-4">Similar Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((item, i) => (
                <AffiliateCard key={item.id} affiliate={item} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
