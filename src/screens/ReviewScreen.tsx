import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import RatingStars from '../components/RatingStars';
import styles from '../styles/ReviewStyles';
import { getUserFullName } from '../utils/auth';
import { useImagePicker } from '../hooks/useImagePicker';
import { useRoute } from '@react-navigation/core';
import { useCreateReview } from '../hooks/useCreateReview';

const ReviewScreen: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const route = useRoute<any>();
  const { restaurantId } = route.params;
  const {
    handleSubmit,
    rating,
    setRating,
    comment,
    setComment,
    images,
    handleAddPhoto,
  } = useCreateReview(restaurantId);

  useEffect(() => {
    const fetchUserData = async () => {
      const userFullName = await getUserFullName();
      setFullName(userFullName || '');
    };
    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Mỳ quán bếp Trang</Text>

      {/* User info */}
      <View style={styles.userRow}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/100' }}
          style={styles.avatar}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.public}>Đăng công khai</Text>
        </View>
      </View>
      <RatingStars maxStars={5} onRatingChange={setRating} />

      <Text style={styles.label}>Viết nhận xét của bạn:</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder="Nhập đánh giá..."
        value={comment}
        onChangeText={setComment}
      />

      {/* Nút thêm ảnh */}
      <TouchableOpacity style={styles.uploadButton} onPress={handleAddPhoto}>
        <Image
          source={require('../assets/add_image.png')}
          style={styles.uploadIcon}
        />
        <Text style={styles.uploadText}>Thêm ảnh và video</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Gửi đánh giá</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReviewScreen;
