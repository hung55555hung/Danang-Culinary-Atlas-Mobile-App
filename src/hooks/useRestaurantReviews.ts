import { useEffect, useState } from 'react';
import { getRestaurantReviews } from '../api/apiConfig';

export const useRestaurantReviews = (restaurantId: string) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getRestaurantReviews(restaurantId);
      setReviews(response.data.content);
    } catch (err) {
      console.error('Lỗi khi lấy review:', err);
      setError('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const removeReview = (reviewId: string) => {
    setReviews(prev => prev.filter(review => review.reviewId !== reviewId));
  };

  return { reviews, loading, error, refetch: fetchReviews, removeReview };
};
