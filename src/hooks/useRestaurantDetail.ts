import { useState } from 'react';

export const useRestaurantDetail = (restaurantDetail: any) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const foodImages =
    restaurantDetail?.images?.sub_photo &&
    Array.isArray(restaurantDetail.images.sub_photo)
      ? restaurantDetail.images.sub_photo
      : [restaurantDetail?.images?.photo];

  return {
    rating,
    setRating,
    reviewText,
    setReviewText,
    foodImages,
  };
};
