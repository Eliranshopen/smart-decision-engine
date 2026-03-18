import { useState } from 'react';

const RISK_LEVELS = ['', 'low', 'medium', 'high'];

export default function FilterBar({ onChange }) {
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
    <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-900 rounded-xl border border-gray-800">
      {/* Risk filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium">Risk:</span>
        {RISK_LEVELS.map((level) => (
          <button
            key={level || 'all'}
            onClick={() => handleRisk(level)}
            className={`badge transition-colors cursor-pointer ${
              riskLevel === level
                ? 'bg-brand-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {level || 'All'}
          </button>
        ))}
      </div>

      {/* Opportunity slider */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 font-medium">Min Opportunity:</span>
        <input
          type="range"
          min={1}
          max={10}
          value={minOpportunity}
          onChange={handleSlider}
          className="w-24 accent-brand-500"
        />
        <span className="text-xs text-brand-400 font-bold w-6">{minOpportunity}</span>
      </div>
    </div>
  );
}
