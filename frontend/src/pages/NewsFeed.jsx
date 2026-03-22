import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNews } from '../hooks/useNews';
import NewsItem from '../components/NewsItem';
import FilterBar from '../components/FilterBar';
import { Radio } from 'lucide-react';

export default function NewsFeed() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({});
  const { data, isLoading, error } = useNews(filters);

  const items = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Radio className="w-4 h-4 text-amber-500" />
          <h1 className="page-title">{t('news.title')}</h1>
        </div>
        <p className="text-gray-500 font-mono text-sm">{t('news.subtitle')}</p>
      </div>

      <FilterBar onChange={setFilters} />

      {isLoading && (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 glass-card text-red-400 text-sm font-mono">
          {t('dashboard.error')} — {error.message}
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <>
          <div className="text-xs text-gray-600 font-mono mb-4">
            {items.length} / {meta.count || items.length} signals
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <NewsItem key={item.id} item={item} index={i} />
            ))}
          </div>
        </>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-ink-800 border border-white/5 flex items-center justify-center mx-auto mb-4">
            <Radio className="w-7 h-7 text-amber-500" />
          </div>
          <p className="font-display font-semibold text-white">{t('news.empty')}</p>
        </div>
      )}
    </div>
  );
}
