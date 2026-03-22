import { useTranslation } from 'react-i18next';
import { useRecommendations } from '../hooks/useRecommendations';
import RecommendationSection from '../components/RecommendationSection';
import { Cpu } from 'lucide-react';

function SkeletonGrid() {
  return (
    <div className="mb-12">
      <div className="skeleton h-6 w-48 mb-5 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-52 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { data: sections, isLoading, error } = useRecommendations();

  const SECTION_LABELS = {
    trending: t('dashboard.sections.trending'),
    beginner: t('dashboard.sections.beginner'),
    top: t('dashboard.sections.top'),
    risky: t('dashboard.sections.risky'),
    gems: t('dashboard.sections.gems'),
  };

  const labeledSections = sections?.map(s => ({
    ...s,
    label: SECTION_LABELS[s.key] || s.label,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="page-title">{t('dashboard.title')}</h1>
        <p className="text-gray-500 mt-2 font-mono text-sm">{t('dashboard.subtitle')}</p>
      </div>

      {isLoading && (
        <>
          <SkeletonGrid />
          <SkeletonGrid />
        </>
      )}

      {error && (
        <div className="p-4 glass-card border-red-500/20 text-red-400 text-sm font-mono">
          {t('dashboard.error')} — {error.message}
        </div>
      )}

      {labeledSections?.map((section) => (
        <RecommendationSection key={section.key} section={section} />
      ))}

      {labeledSections && labeledSections.every(s => !s.items || s.items.length === 0) && (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-ink-800 border border-white/5 flex items-center justify-center mx-auto mb-4">
            <Cpu className="w-7 h-7 text-amber-500" />
          </div>
          <p className="font-display font-semibold text-white text-lg">{t('dashboard.empty')}</p>
        </div>
      )}
    </div>
  );
}
