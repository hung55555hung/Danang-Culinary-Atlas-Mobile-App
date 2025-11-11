import { Alert } from 'react-native';
import { useImagePicker } from './useImagePicker';
import React, { useState, useEffect } from 'react';
import { createReview } from '../api/apiConfig';
import { useNavigation } from '@react-navigation/native';

export const useCreateReview = (restaurantId: string) => {
  const { images, handleAddPhoto, setImages } = useImagePicker();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const navigation = useNavigation<any>();

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao trước khi gửi!');
      return;
    }

    const payload = { comment, rating, restaurantId, images };

    try {
      await createReview(payload);
      Alert.alert('Đánh giá thành công!');
      navigation.navigate('ShopDetail', { item: { restaurantId } });
      setRating(0);
      setComment('');
      setImages([]);
    } catch (err) {
      console.error(err);
      Alert.alert('Gửi đánh giá thất bại');
    }
  };

  return {
    rating,
    setRating,
    comment,
    setComment,
    images,
    handleAddPhoto,
    handleSubmit,
  };
};
