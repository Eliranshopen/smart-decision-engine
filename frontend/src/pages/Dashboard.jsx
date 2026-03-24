import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Wand2, BookOpen, PenTool, Image, Video, Mic, Code2, Bot, Crown, TrendingUp, Clock, Tag } from 'lucide-react';
import { useAffiliates } from '../hooks/useAffiliates';
import AffiliateCard from '../components/AffiliateCard';
import FeaturedSection from '../components/FeaturedSection';
import NewsletterSection from '../components/NewsletterSection';

// AI Tool subcategories
const TOOL_SUBCATS = [
  { key: 'all',        label: 'All Tools',   icon: Wand2 },
  { key: 'writing',    label: 'Writing',     icon: PenTool },
  { key: 'images',     label: 'Images',      icon: Image },
  { key: 'video',      label: 'Video',       icon: Video },
  { key: 'voice',      label: 'Voice',       icon: Mic },
  { key: 'coding',     label: 'Coding',      icon: Code2 },
  { key: 'automation', label: 'Automation',  icon: Bot },
];

const SKILL_LEVELS = [
  { key: 'all',          label: 'All levels' },
  { key: 'beginner',     label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced',     label: 'Advanced' },
];

const SORT_OPTIONS = [
  { key: 'composite_score', label: 'Top Rated',  icon: Crown },
  { key: 'trend_score',     label: 'Trending',   icon: TrendingUp },
  { key: 'created_at',      label: 'Newest',     icon: Clock },
  { key: 'free_first',      label: 'Free First', icon: Tag },
];

const PILL = (active) =>
  active
    ? 'bg-white/10 text-white border-white/25'
    : 'bg-white/[0.03] text-white/45 border-white/[0.06] hover:bg-white/[0.07] hover:text-white/70';

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="p-4 flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-white/5 rounded w-3/4" />
          <div className="h-2.5 bg-white/5 rounded w-1/2" />
        </div>
      </div>
      <div className="px-4 pb-4 space-y-3">
        <div className="h-2.5 bg-white/5 rounded w-full" />
        <div className="h-2.5 bg-white/5 rounded w-4/5" />
        <div className="h-8 bg-white/5 rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState('tools');
  const [search, setSearch] = useState('');
  const [subcat, setSubcat] = useState('all');
  const [skillLevel, setSkillLevel] = useState('all');
  const [langFilter, setLangFilter] = useState('all');
  const [sortKey, setSortKey] = useState('composite_score');

  // Map our sort key to API params
  const apiSort = sortKey === 'free_first' ? 'composite_score' : sortKey;
  const { data, isLoading, error } = useAffiliates({ limit: 100, sort: apiSort });
  const allItems = data?.data ?? [];

  const filtered = useMemo(() => {
    let items = allItems;

    // Tab filter
    if (tab === 'tools') items = items.filter(i => i.category === 'ai-tools');
    else items = items.filter(i => i.category === 'courses');

    // Subcategory (tools tab)
    if (tab === 'tools' && subcat !== 'all') items = items.filter(i => i.subcategory === subcat);

    // Skill level (courses tab)
    if (tab === 'courses' && skillLevel !== 'all') items = items.filter(i => i.skill_level === skillLevel);

    // Language
    if (langFilter !== 'all') items = items.filter(i => (i.language || 'en') === langFilter);

    // Search — searches name and description
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.site_name?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.subcategory?.toLowerCase().includes(q)
      );
    }

    // Free first sort (client-side since API doesn't support it directly)
    if (sortKey === 'free_first') {
      const order = { free: 0, freemium: 1, paid: 2 };
      items = [...items].sort((a, b) => (order[a.pricing_model] ?? 3) - (order[b.pricing_model] ?? 3));
    }

    return items;
  }, [allItems, tab, subcat, skillLevel, langFilter, search, sortKey]);

  const toolCount = allItems.filter(i => i.category === 'ai-tools').length;
  const courseCount = allItems.filter(i => i.category === 'courses').length;

  // Count per subcategory for badges
  const subcatCounts = useMemo(() => {
    const tools = allItems.filter(i => i.category === 'ai-tools');
    return TOOL_SUBCATS.reduce((acc, s) => {
      acc[s.key] = s.key === 'all' ? tools.length : tools.filter(t => t.subcategory === s.key).length;
      return acc;
    }, {});
  }, [allItems]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden pt-14 pb-10 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.06] blur-3xl" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          <div className="absolute top-8 right-1/4 w-80 h-80 rounded-full opacity-[0.05] blur-3xl" style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
        </div>

        <div className="relative max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/25 mb-3">AI Discovery</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-3">
              <span className="text-white">The best </span>
              <span style={{ backgroundImage: 'linear-gradient(90deg, #10b981, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                AI tools & courses
              </span>
            </h1>
            <p className="text-white/35 text-sm max-w-md mx-auto">
              Curated and ranked — only what's actually worth your time and money.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative mt-7 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none group-focus-within:text-white/50 transition-colors" />
            <input
              type="text"
              placeholder={tab === 'tools' ? 'Search AI tools...' : 'Search courses...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full py-3.5 pl-11 pr-10 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={e => { e.target.style.border = '1px solid rgba(139,92,246,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
              onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
            />
            <AnimatePresence>
              {search && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                  <X className="w-3 h-3 text-white/50" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Main Tabs */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex gap-2">
            {[
              { key: 'tools',   label: 'AI Tools',  icon: Wand2,    count: toolCount },
              { key: 'courses', label: 'Courses',   icon: BookOpen,  count: courseCount },
            ].map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setSubcat('all'); setSkillLevel('all'); setSortKey('composite_score'); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  tab === key
                    ? key === 'tools'
                      ? 'bg-violet-500/15 text-violet-300 border-violet-500/40'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/[0.03] text-white/45 border-white/[0.06] hover:text-white/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {count > 0 && <span className="text-xs px-1.5 py-0.5 rounded-md font-mono bg-white/10">{count}</span>}
              </button>
            ))}
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setSortKey(key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${PILL(sortKey === key)}`}>
                <Icon className="w-3 h-3" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <AnimatePresence mode="wait">
            {tab === 'tools' ? (
              <motion.div key="tool-filters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-2">
                {TOOL_SUBCATS.map(({ key, label, icon: Icon }) => {
                  const count = subcatCounts[key] || 0;
                  return (
                    <button key={key} onClick={() => setSubcat(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${PILL(subcat === key)}`}>
                      <Icon className="w-3 h-3" />
                      {label}
                      {count > 0 && key !== 'all' && (
                        <span className="text-[10px] font-mono opacity-50">{count}</span>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div key="course-filters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-2">
                {SKILL_LEVELS.map(({ key, label }) => (
                  <button key={key} onClick={() => setSkillLevel(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${PILL(skillLevel === key)}`}>
                    {label}
                  </button>
                ))}
                <div className="w-px bg-white/10 mx-1" />
                {[{ key: 'all', label: 'All languages' }, { key: 'en', label: '🌍 English' }, { key: 'he', label: '🇮🇱 עברית' }].map(({ key, label }) => (
                  <button key={key} onClick={() => setLangFilter(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${PILL(langFilter === key)}`}>
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Top Picks (only on "All Tools" tab with no search) */}
        {tab === 'tools' && subcat === 'all' && !search && sortKey === 'composite_score' && (
          <FeaturedSection />
        )}

        {/* Content */}
        <div className="pb-8">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono">{error.message}</div>
          )}

          {!isLoading && !error && filtered.length > 0 && (
            <>
              <p className="text-xs font-mono text-white/25 mb-4">
                {filtered.length} {tab === 'tools' ? 'tools' : 'courses'}
                {search && <> matching "<span className="text-white/40">{search}</span>"</>}
                {subcat !== 'all' && <> in <span className="text-white/40 capitalize">{subcat}</span></>}
              </p>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                  {filtered.map((item, i) => (
                    <AffiliateCard key={item.id} affiliate={item} index={i} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                   style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Search className="w-5 h-5 text-white/25" />
              </div>
              <p className="font-semibold text-white">Nothing found</p>
              <p className="text-white/30 text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Newsletter — shown after grid */}
        {!isLoading && <NewsletterSection />}
      </div>
    </div>
  );
}
