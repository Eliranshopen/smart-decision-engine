import AffiliateCard from './AffiliateCard';

export default function RecommendationSection({ section }) {
  const { label, items } = section;
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 bg-amber-500 rounded-full" />
        <h2 className="section-title">{label}</h2>
        <span className="badge-gray font-mono">{items.length}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((affiliate, i) => (
          <AffiliateCard key={affiliate.id || affiliate.site_name} affiliate={affiliate} index={i} />
        ))}
      </div>
    </section>
  );
}
