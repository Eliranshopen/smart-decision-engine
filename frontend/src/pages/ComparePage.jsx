import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Crown, ExternalLink, GitCompare } from 'lucide-react';
import { COMPARISONS, getComparison } from '../data/comparisons';

const CAT_COLOR = {
  writing:    '#10b981',
  images:     '#8b5cf6',
  video:      '#ef4444',
  voice:      '#f97316',
  coding:     '#3b82f6',
  automation: '#06b6d4',
};

// List of all comparisons
function CompareList() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-12">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-white/25 mb-2">Compare</p>
        <h1 className="text-3xl font-bold text-white mb-2">AI Tool Comparisons</h1>
        <p className="text-white/35 text-sm">Side-by-side comparisons to help you choose the right tool.</p>
      </div>

      <div className="grid gap-4">
        {COMPARISONS.map((comp, i) => {
          const color = CAT_COLOR[comp.category] || '#8b5cf6';
          return (
            <motion.div key={comp.slug}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <Link to={`/compare/${comp.slug}`}
                className="block rounded-xl p-5 no-underline transition-all hover:scale-[1.01]"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <GitCompare className="w-4 h-4" style={{ color }} />
                      <span className="text-xs font-semibold capitalize" style={{ color }}>{comp.category}</span>
                    </div>
                    <h2 className="text-white font-semibold mb-1">{comp.title}</h2>
                    <p className="text-white/35 text-sm">{comp.description}</p>
                  </div>
                  <span className="text-white/20 text-sm flex-shrink-0">→</span>
                </div>
                <div className="flex gap-2 mt-3">
                  {comp.tools.map(t => (
                    <span key={t.name} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">{t.name}</span>
                  ))}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Individual comparison page
function CompareDetail({ comp }) {
  useEffect(() => {
    document.title = `${comp.title} — AI Tool Comparison`;
    return () => { document.title = 'Smart Decision Engine'; };
  }, [comp]);

  const color = CAT_COLOR[comp.category] || '#8b5cf6';

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-8">
      {/* Back */}
      <Link to="/compare" className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-sm mb-6 no-underline">
        <ArrowLeft className="w-4 h-4" /> All comparisons
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <GitCompare className="w-4 h-4" style={{ color }} />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color }}>{comp.category}</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{comp.title}</h1>
        <p className="text-white/40">{comp.description}</p>
      </motion.div>

      {/* Tool cards */}
      <div className={`grid gap-4 mb-8 ${comp.tools.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {comp.tools.map((tool, i) => (
          <motion.div key={tool.name}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative rounded-2xl overflow-hidden p-5"
            style={{
              background: `linear-gradient(135deg, ${tool.color}10, rgba(255,255,255,0.02))`,
              border: `1px solid ${comp.winner === tool.slug ? tool.color + '50' : 'rgba(255,255,255,0.07)'}`,
            }}>
            <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: tool.color }} />

            {comp.winner === tool.slug && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                <Crown className="w-3 h-3" /> Winner
              </div>
            )}

            <h2 className="text-lg font-bold text-white mb-1">{tool.name}</h2>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold" style={{ color: tool.color }}>{tool.score.toFixed(1)}</span>
              <span className="text-white/30 text-sm">/10</span>
            </div>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-3 ${
              tool.pricing === 'Freemium' ? 'bg-blue-500/15 text-blue-300' :
              tool.pricing === 'Free' ? 'bg-green-500/15 text-green-300' : 'bg-white/10 text-white/50'
            }`}>{tool.pricing}</span>

            <p className="text-xs text-white/35 mb-4">Best for: <span className="text-white/55">{tool.best_for}</span></p>

            {/* Pros */}
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-emerald-400 mb-1.5 uppercase tracking-wider">Pros</p>
              <ul className="space-y-1">
                {tool.pros.map(p => (
                  <li key={p} className="flex items-start gap-1.5 text-xs text-white/50">
                    <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />{p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="mb-4">
              <p className="text-[10px] font-semibold text-red-400 mb-1.5 uppercase tracking-wider">Cons</p>
              <ul className="space-y-1">
                {tool.cons.map(c => (
                  <li key={c} className="flex items-start gap-1.5 text-xs text-white/50">
                    <X className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />{c}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-white/40 italic mb-4">"{tool.verdict}"</p>

            <a href={tool.affiliate_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white no-underline transition-all"
              style={{ background: `linear-gradient(135deg, ${tool.color}, ${tool.color}aa)` }}>
              Try {tool.name} <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        ))}
      </div>

      {/* Verdict */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl p-6"
        style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
        <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" /> Our Verdict
        </h2>
        <p className="text-sm text-white/55 leading-relaxed">{comp.winner_reason}</p>
        {comp.winner && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-white/30">Recommended:</span>
            <span className="text-sm font-semibold text-white">
              {comp.tools.find(t => t.slug === comp.winner)?.name}
            </span>
          </div>
        )}
      </motion.div>

      {/* Other comparisons */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-white/50 mb-4">More Comparisons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMPARISONS.filter(c => c.slug !== comp.slug).slice(0, 4).map(c => (
            <Link key={c.slug} to={`/compare/${c.slug}`}
              className="rounded-xl p-4 no-underline hover:bg-white/[0.04] transition-all"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-medium text-white/70 hover:text-white">{c.title}</p>
              <p className="text-xs text-white/25 mt-0.5">{c.tools.map(t => t.name).join(' vs ')}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { slug } = useParams();
  if (!slug) return <CompareList />;
  const comp = getComparison(slug);
  if (!comp) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-white/50">Comparison not found.</p>
      <Link to="/compare" className="text-violet-400 hover:underline text-sm">← All comparisons</Link>
    </div>
  );
  return <CompareDetail comp={comp} />;
}
