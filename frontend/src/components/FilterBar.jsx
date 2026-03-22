import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';

const RISK_LEVELS = ['', 'low', 'medium', 'high'];

export default function FilterBar({ onChange }) {
  const { t } = useTranslation();
  const [riskLevel, setRiskLevel] = useState('');
  const [minOpportunity, setMinOpportunity] = useState(1);

  function handleRisk(level) {
    setRiskLevel(level);
    onChange({ risk_level: level || undefined, min_opportunity: minOpportunity > 1 ? minOpportunity : undefined });
  }

  function handleSlider(e) {
    const val = Number(e.target.value);
    setMinOpportunity(val);
    onChange({ risk_level: riskLevel || undefined, min_opportunity: val > 1 ? val : undefined });
  }

  return (
    <div className="glass-card px-5 py-4 flex flex-wrap items-center gap-4 mb-6">
      <div className="flex items-center gap-2 text-gray-500">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span className="text-xs font-mono uppercase tracking-wider">{t('card.risk')}</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {RISK_LEVELS.map((level) => (
          <button
            key={level || 'all'}
            onClick={() => handleRisk(level)}
            className={`badge cursor-pointer transition-all duration-150 border-none
              ${riskLevel === level
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
          >
            {level ? t(`news.filters.${level}`) : t('news.filters.all')}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <span className="text-xs font-mono text-gray-500">{t('news.filters.opportunityMin')}</span>
        <input
          type="range" min={1} max={10} value={minOpportunity}
          onChange={handleSlider}
          className="w-24 accent-amber-500"
        />
        <span className="text-xs font-mono text-amber-400 font-bold w-4">{minOpportunity}</span>
      </div>
    </div>
  );
}
