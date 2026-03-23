import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Cpu, BookOpen, Wrench, DollarSign, Layers, X } from 'lucide-react';
import { useAffiliates } from '../hooks/useAffiliates';
import AffiliateCard from '../components/AffiliateCard';

const CATEGORIES = [
  { key: 'all',      label: 'All',      icon: Layers,      color: null },
  { key: 'courses',  label: 'Courses',  icon: BookOpen,    color: 'emerald' },
  { key: 'ai-tools', label: 'AI Tools', icon: Cpu,         color: 'violet' },
  { key: 'saas',     label: 'SaaS',     icon: Wrench,      color: 'blue' },
  { key: 'finance',  label: 'Finance',  icon: DollarSign,  color: 'orange' },
];

const CAT_ACTIVE = {
  all:       'bg-white/10 text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]',
  courses:   'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  'ai-tools':'bg-violet-500/15 text-violet-300 border-violet-500/40 shadow-[0_0_20px_rgba(139,92,246,0.15)]',
  saas:      'bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  finance:   'bg-orange-500/15 text-orange-300 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.15)]',
};

const CAT_IDLE = 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:bg-white/[0.07] hover:text-white/80';

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="h-36 bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/5 rounded-lg w-4/5" />
        <div className="h-3 bg-white/5 rounded-lg w-3/5" />
        <div className="h-9 bg-white/5 rounded-xl mt-4" />
      </div>
    </div>
  );
}

const SECTION_HEADING = {
  courses:   { color: '#10b981', label: 'Courses' },
  'ai-tools':{ color: '#8b5cf6', label: 'AI Tools' },
  saas:      { color: '#3b82f6', label: 'SaaS' },
  finance:   { color: '#f97316', label: 'Finance' },
};

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { data, isLoading, error } = useAffiliates({ limit: 100, sort: 'composite_score' });
  const allItems = data?.data ?? [];

  const filtered = useMemo(() => {
    let items = allItems;
    if (activeCategory !== 'all') items = items.filter(i => i.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i => i.site_name?.toLowerCase().includes(q));
    }
    return items;
  }, [allItems, activeCategory, search]);

  const showGrouped = activeCategory === 'all' && !search.trim();

  const grouped = useMemo(() => {
    if (!showGrouped) return null;
    const g = {};
    for (const item of filtered) {
      const cat = item.category || 'other';
      if (!g[cat]) g[cat] = [];
      g[cat].push(item);
    }
    return g;
  }, [filtered, showGrouped]);

  const counts = useMemo(() => {
    const c = {};
    for (const item of allItems) c[item.category] = (c[item.category] || 0) + 1;
    return c;
  }, [allItems]);

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-16 pb-12 px-4">
        {/* Background glow mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.07] blur-3xl"
               style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          <div className="absolute top-8 right-1/4 w-80 h-80 rounded-full opacity-[0.06] blur-3xl"
               style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 opacity-[0.08] blur-2xl"
               style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        </div>

        <div className="relative max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/30 mb-4">
              AI & Course Discovery
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-3">
              <span className="text-white">Find what's </span>
              <span style={{
                backgroundImage: 'linear-gradient(90deg, #10b981, #8b5cf6, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                actually worth it
              </span>
            </h1>
            <p className="text-white/40 text-base font-light max-w-md mx-auto">
              The market is flooded. We filter the noise — only the best AI courses and tools, ranked by real quality.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-8 group"
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none transition-colors group-focus-within:text-white/60" />
            <input
              type="text"
              placeholder="Search courses, AI tools, and more..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full py-4 pl-14 pr-12 rounded-2xl text-sm text-white placeholder-white/25
                         font-sans outline-none transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'none',
              }}
              onFocus={e => {
                e.target.style.border = '1px solid rgba(139,92,246,0.4)';
                e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1), 0 8px 32px rgba(0,0,0,0.3)';
              }}
              onBlur={e => {
                e.target.style.border = '1px solid rgba(255,255,255,0.08)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full
                             bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white/60" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* ── Category tabs ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="px-4 sm:px-6 lg:px-8 mb-8 max-w-7xl mx-auto"
      >
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ key, label, icon: Icon }) => {
            const isActive = activeCategory === key;
            const count = key === 'all' ? allItems.length : (counts[key] || 0);
            return (
              <motion.button
                key={key}
                onClick={() => setActiveCategory(key)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                            border transition-all duration-200 ${isActive ? CAT_ACTIVE[key] : CAT_IDLE}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-mono
                    ${isActive ? 'bg-white/15' : 'bg-white/5 text-white/30'}`}>
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Content ── */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto">

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono">
            {error.message}
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && (
          <>
            {/* Grouped view */}
            {showGrouped && grouped && Object.keys(grouped).map(cat => {
              const heading = SECTION_HEADING[cat] || { color: '#94a3b8', label: cat };
              return (
                <div key={cat} className="mb-12">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-5 rounded-full" style={{ background: heading.color }} />
                    <h2 className="font-display font-bold text-white text-xl">{heading.label}</h2>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-lg text-white/30"
                          style={{ background: 'rgba(255,255,255,0.04)' }}>
                      {grouped[cat].length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {grouped[cat].map((item, i) => (
                      <AffiliateCard key={item.id} affiliate={item} index={i} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Filtered flat view */}
            {!showGrouped && (
              <>
                {filtered.length > 0 ? (
                  <>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs font-mono text-white/30 mb-5"
                    >
                      {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                      {search && <> for <span className="text-white/50">"{search}"</span></>}
                    </motion.p>
                    <motion.div
                      layout
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                      <AnimatePresence>
                        {filtered.map((item, i) => (
                          <AffiliateCard key={item.id} affiliate={item} index={i} />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-28"
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                         style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <Search className="w-6 h-6 text-white/30" />
                    </div>
                    <p className="font-display font-semibold text-white text-lg">Nothing found</p>
                    <p className="text-white/30 text-sm mt-2">Try a different search term or category</p>
                  </motion.div>
                )}
              </>
            )}

            {/* Empty state */}
            {showGrouped && (!grouped || Object.keys(grouped).length === 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-28"
              >
                <p className="font-display font-semibold text-white text-lg">No content yet</p>
                <p className="text-white/30 text-sm mt-2">The agents are working on finding the best courses.</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
