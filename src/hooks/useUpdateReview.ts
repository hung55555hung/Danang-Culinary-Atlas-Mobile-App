import { Alert } from 'react-native';
import React, { useState } from 'react';
import { updateReview } from '../api/apiConfig';
import { useNavigation } from '@react-navigation/native';

export const useUpdateReview = (reviewId: string, restaurantId: string) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation<any>();

  // Nhận images từ EditReviewScreen thay vì từ hook
  const handleUpdate = async (images: string[]) => {
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao trước khi gửi!');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập bình luận!');
      return;
    }

    const payload = {
      rating,
      comment: comment.trim(),
      images: images,
    };

    try {
      setUploading(true);
      console.log('📤 Updating review payload:', payload);
      await updateReview(reviewId, payload);

      Alert.alert('✅ Thành công', 'Đánh giá của bạn đã được cập nhật!');
      navigation.navigate('ShopDetail', { restaurantId });

      // Reset form
      setRating(0);
      setComment('');
    } catch (err) {
      console.error('❌ Error updating review:', err);
      Alert.alert('❌ Lỗi', 'Cập nhật đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  return {
    rating,
    setRating,
    comment,
    setComment,
    uploading,
    handleUpdate,
  };
};
