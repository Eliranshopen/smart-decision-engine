import { AnimatePresence } from 'framer-motion';
import AffiliateCard from './AffiliateCard';

export default function RecommendationSection({ section }) {
  const { label, description, items } = section;

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">{label}</h2>
        {description && (
          <p className="text-sm text-gray-400 mt-0.5">{description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {items.map((affiliate) => (
            <AffiliateCard
              key={affiliate.id}
              affiliate={affiliate}
              label={label.split(' ').slice(0, 2).join(' ')}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
