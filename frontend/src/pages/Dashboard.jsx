import { useRecommendations } from '../hooks/useRecommendations';
import RecommendationSection from '../components/RecommendationSection';

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-40 bg-gray-800 rounded-xl" />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data: sections, isLoading, error } = useRecommendations();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Opportunities Dashboard</h1>
        <p className="text-gray-400 mt-1">AI-curated affiliate picks, scored daily by our agents.</p>
      </div>

      {isLoading && <Skeleton />}

      {error && (
        <div className="p-4 bg-red-950 border border-red-800 rounded-xl text-red-300 text-sm">
          Failed to load recommendations: {error.message}
        </div>
      )}

      {sections && sections.map((section) => (
        <RecommendationSection key={section.key} section={section} />
      ))}

      {sections && sections.every(s => s.items.length === 0) && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">🤖</p>
          <p className="text-lg font-medium">Agents are still scanning...</p>
          <p className="text-sm mt-1">Check back in a few minutes after running the CrewAI agents.</p>
        </div>
      )}
    </div>
  );
}
