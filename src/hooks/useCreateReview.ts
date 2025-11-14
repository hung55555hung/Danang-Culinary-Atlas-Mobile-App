import { Alert } from 'react-native';
import React, { useState } from 'react';
import { createReview } from '../api/apiConfig';
import { useNavigation } from '@react-navigation/native';

export const useCreateReview = (restaurantId: string) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation<any>();

  // ✅ Nhận images từ ReviewScreen thay vì từ hook
  const handleSubmit = async (images: string[]) => {
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao trước khi gửi!');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập bình luận!');
      return;
    }

    const payload = {
      restaurantId,
      rating,
      comment: comment.trim(),
      images: images,
    };

    try {
      setUploading(true);
      console.log('📤 Sending review payload:', payload);
      await createReview(payload);

      Alert.alert('✅ Thành công', 'Đánh giá của bạn đã được gửi!');
      navigation.navigate('ShopDetail', { restaurantId });

      // Reset form
      setRating(0);
      setComment('');
    } catch (err) {
      console.error('❌ Error creating review:', err);
      Alert.alert('❌ Lỗi', 'Gửi đánh giá thất bại. Vui lòng thử lại.');
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
    handleSubmit,
  };
};
