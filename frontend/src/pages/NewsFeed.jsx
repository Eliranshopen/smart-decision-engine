import { useState } from 'react';
import { useNews } from '../hooks/useNews';
import NewsItem from '../components/NewsItem';
import FilterBar from '../components/FilterBar';

export default function NewsFeed() {
  const [filters, setFilters] = useState({});
  const { data, isLoading, error } = useNews(filters);

  const items = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">News Digest</h1>
        <p className="text-gray-400 mt-1">
          Latest signals from HackerNews, Reddit, and ProductHunt — scored for risk and opportunity.
        </p>
      </div>

      <FilterBar onChange={setFilters} />

      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950 border border-red-800 rounded-xl text-red-300 text-sm">
          Failed to load news: {error.message}
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <>
          <div className="text-xs text-gray-500 mb-3">
            Showing {items.length} of {meta.count || items.length} items
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <NewsItem key={item.id} item={item} />
            ))}
          </div>
        </>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">📰</p>
          <p className="text-lg font-medium">No news yet</p>
          <p className="text-sm mt-1">Run the NewsDigestAgent to populate this feed.</p>
        </div>
      )}
    </div>
  );
}
