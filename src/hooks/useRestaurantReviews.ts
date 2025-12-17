import { useEffect, useState } from 'react';
import { getRestaurantReviews } from '../api/apiConfig';

export const useRestaurantReviews = (restaurantId: string) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const fetchReviews = async (pageNumber = 0, append = false) => {
    try {
      if (pageNumber === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getRestaurantReviews(restaurantId, pageNumber, 10);
      const newReviews = response.data.content;
      const { totalPages: total, last } = response.data;

      setTotalPages(total);
      setHasMore(!last);

      if (append) {
        setReviews(prev => [...prev, ...newReviews]);
      } else {
        setReviews(newReviews);
      }

      setPage(pageNumber);
    } catch (err) {
      console.error('Lỗi khi lấy review:', err);
      setError('Không thể tải đánh giá');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchReviews(page + 1, true);
    }
  };

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchReviews(0, false);
  }, [restaurantId]);

  const removeReview = (reviewId: string) => {
    setReviews(prev => prev.filter(review => review.reviewId !== reviewId));
  };

  return {
    reviews,
    loading,
    loadingMore,
    error,
    hasMore,
    refetch: () => fetchReviews(0, false),
    removeReview,
    loadMore,
  };
};
