import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList,
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
  const { handleSubmit, rating, setRating, comment, setComment, uploading } =
    useCreateReview(restaurantId);

  // ✅ Dùng useImagePicker ở chế độ multiple
  const {
    localImages,
    handleAddPhoto,
    removeImage,
    uploadAllImages,
    uploading: imageuploading,
  } = useImagePicker('multiple');

  useEffect(() => {
    const fetchUserData = async () => {
      const userFullName = await getUserFullName();
      setFullName(userFullName || '');
    };
    fetchUserData();
  }, []);

  // ✅ Override handleSubmit để upload ảnh trước
  const onSubmitWithImages = async () => {
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao trước khi gửi!');
      return;
    }

    try {
      // Upload ảnh nếu có
      let uploadedImages: string[] = [];
      if (localImages.length > 0) {
        uploadedImages = await uploadAllImages();
      }

      // Gọi handleSubmit với ảnh đã upload
      await handleSubmit(uploadedImages);
    } catch (err) {
      console.error('Error submitting review:', err);
      Alert.alert('❌ Lỗi', 'Gửi đánh giá thất bại');
    }
  };

  return (
    <ScrollView style={styles.container}>
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

      {/* Rating */}
      <RatingStars maxStars={5} onRatingChange={setRating} />

      {/* Comment */}
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
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleAddPhoto}
        testID="btn-add-photo"
        accessibilityLabel="btn-add-photo"
      >
        <Image
          source={require('../assets/add_image.png')}
          style={styles.uploadIcon}
        />
        <Text style={styles.uploadText}>
          Thêm ảnh ({localImages.length}/10)
        </Text>
      </TouchableOpacity>

      {/* Preview ảnh đã chọn */}
      {localImages.length > 0 && (
        <View style={styles.imagePreviewContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {localImages.map((uri, index) => (
              <View key={index} style={styles.imagePreviewWrapper}>
                <Image
                  source={{ uri }}
                  style={styles.imagePreview}
                  testID={`preview-image-${index}`}
                  accessibilityLabel={`preview-image-${index}`}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                  testID={`btn-remove-${index}`}
                  accessibilityLabel={`btn-remove-${index}`}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Nút gửi */}
      <TouchableOpacity
        style={[
          styles.button,
          (uploading || imageuploading) && { opacity: 0.6 }, // ✅ Fix
        ]}
        onPress={onSubmitWithImages}
        disabled={uploading || imageuploading}
      >
        {uploading || imageuploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Gửi đánh giá</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ReviewScreen;
