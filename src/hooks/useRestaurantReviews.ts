import { useEffect, useState } from 'react';
import { getRestaurantReviews } from '../api/apiConfig';

export const useRestaurantReviews = (restaurantId: string) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getRestaurantReviews(restaurantId);
        setReviews(response.data.content);
      } catch (err) {
        console.error('Lỗi khi lấy review:', err);
        setError('Không thể tải đánh giá');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [restaurantId]);

  return { reviews, loading, error };
};
