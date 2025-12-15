import { useState, useEffect } from 'react';
import { getRecommendations } from '../api/apiConfig';
import { getUserId } from '../utils/auth';

interface Recommendation {
  id: string;
  score: number;
  rank: number;
}

interface RecommendationResponse {
  user_id: string;
  context_hour: number;
  context_label: string;
  target_type: 'restaurant' | 'dish';
  recommendations: Recommendation[];
}

interface UseRecommendationsParams {
  k?: number;
  targetType?: 'restaurant' | 'dish';
  enabled?: boolean;
}

export const useRecommendations = ({
  k = 5,
  targetType = 'restaurant',
  enabled = true,
}: UseRecommendationsParams = {}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextLabel, setContextLabel] = useState<string>('');

  const fetchRecommendations = async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const userId = await getUserId();
      // Cho phép userId null vì API hỗ trợ

      // Lấy giờ hiện tại
      const currentHour = new Date().getHours();

      const response = await getRecommendations({
        hour: currentHour,
        k,
        target_type: targetType,
        user_id: userId || '',
      });

      if (response.data) {
        setRecommendations(response.data.recommendations || []);
        setContextLabel(response.data.context_label || '');
      }
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      setError(err.message || 'Failed to fetch recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [k, targetType, enabled]);

  return {
    recommendations,
    loading,
    error,
    contextLabel,
    refetch: fetchRecommendations,
  };
};
