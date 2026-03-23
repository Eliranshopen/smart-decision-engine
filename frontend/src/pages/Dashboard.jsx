import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Cpu, BookOpen, Wrench, TrendingUp, DollarSign, Layers } from 'lucide-react';
import { useAffiliates } from '../hooks/useAffiliates';
import AffiliateCard from '../components/AffiliateCard';

const CATEGORIES = [
  { key: 'all',       label: 'All',        icon: Layers },
  { key: 'courses',   label: 'Courses',    icon: BookOpen },
  { key: 'ai-tools',  label: 'AI Tools',   icon: Cpu },
  { key: 'saas',      label: 'SaaS',       icon: Wrench },
  { key: 'finance',   label: 'Finance',    icon: DollarSign },
  { key: 'trending',  label: 'Trending',   icon: TrendingUp },
];

function SkeletonCard() {
  return <div className="skeleton h-64 rounded-2xl" />;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { data, isLoading, error } = useAffiliates({
    limit: 100,
    sort: 'composite_score',
  });

  const allItems = data?.data ?? [];

  const filtered = useMemo(() => {
    let items = allItems;

    if (activeCategory !== 'all') {
      items = items.filter(item => item.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(item =>
        item.site_name?.toLowerCase().includes(q)
      );
    }

    return items;
  }, [allItems, activeCategory, search]);

  // Group by category for display when "all" is selected and no search
  const showGrouped = activeCategory === 'all' && !search.trim();

  const grouped = useMemo(() => {
    if (!showGrouped) return null;
    const groups = {};
    for (const item of filtered) {
      const cat = item.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [filtered, showGrouped]);

  const categoryLabel = (key) => {
    const cat = CATEGORIES.find(c => c.key === key);
    return cat?.label ?? key;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">{t('dashboard.title')}</h1>
        <p className="text-gray-500 mt-2 font-mono text-sm">{t('dashboard.subtitle')}</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search courses, AI tools, and more..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-ink-900/80 border border-white/8 rounded-xl pl-11 pr-4 py-3
                     text-sm text-white placeholder-gray-500 font-mono
                     focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30
                     transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs font-mono"
          >
            clear
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-semibold
                        border transition-all duration-150
                        ${activeCategory === key
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-white/5 text-gray-400 border-white/8 hover:bg-white/10 hover:text-white'
                        }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 glass-card border-red-500/20 text-red-400 text-sm font-mono">
          {error.message}
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <>
          {/* Grouped view — "All" tab, no search */}
          {showGrouped && grouped && Object.keys(grouped).length > 0 && (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-12">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-5 bg-amber-500 rounded-full" />
                  <h2 className="font-display font-semibold text-white text-lg">
                    {categoryLabel(cat)}
                  </h2>
                  <span className="badge-gray">{items.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item, i) => (
                    <AffiliateCard key={item.id} affiliate={item} index={i} />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Flat filtered view — specific category or search active */}
          {!showGrouped && (
            <>
              {filtered.length > 0 ? (
                <>
                  <p className="text-gray-500 text-xs font-mono mb-4">
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                    {search ? ` for "${search}"` : ''}
                    {activeCategory !== 'all' ? ` in ${categoryLabel(activeCategory)}` : ''}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((item, i) => (
                      <AffiliateCard key={item.id} affiliate={item} index={i} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-24">
                  <div className="w-16 h-16 rounded-2xl bg-ink-800 border border-white/5 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 text-amber-500" />
                  </div>
                  <p className="font-display font-semibold text-white text-lg">No results found</p>
                  <p className="text-gray-500 text-sm font-mono mt-2">Try a different search or category</p>
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {showGrouped && (!grouped || Object.keys(grouped).length === 0) && (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-ink-800 border border-white/5 flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-7 h-7 text-amber-500" />
              </div>
              <p className="font-display font-semibold text-white text-lg">{t('dashboard.empty')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
