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
} from 'react-native';
import RatingStars from '../components/RatingStars';
import styles from '../styles/ReviewStyles';
import { getUserFullName } from '../utils/auth';
import { useImagePicker } from '../hooks/useImagePicker';
import { useRoute, useNavigation } from '@react-navigation/core';
import { useUpdateReview } from '../hooks/useUpdateReview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditReviewScreen: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  // Nhận dữ liệu review từ navigation params
  const {
    reviewId,
    restaurantId,
    currentRating,
    currentComment,
    currentImages,
  } = route.params;

  const { handleUpdate, rating, setRating, comment, setComment, uploading } =
    useUpdateReview(reviewId, restaurantId);

  // Dùng useImagePicker ở chế độ multiple
  const {
    localImages,
    handleAddPhoto,
    removeImage,
    uploadAllImages,
    uploading: imageuploading,
    setLocalImages,
  } = useImagePicker('multiple');

  useEffect(() => {
    const fetchUserData = async () => {
      const userFullName = await getUserFullName();
      const avatar = await AsyncStorage.getItem('avatarUrl');
      setFullName(userFullName || '');
      setAvatarUrl(avatar || '');
    };
    fetchUserData();

    // Set dữ liệu review hiện tại
    setRating(currentRating);
    setComment(currentComment);
    if (currentImages && currentImages.length > 0) {
      setLocalImages(currentImages);
    }
  }, []);

  // Override handleUpdate để upload ảnh trước
  const onUpdateWithImages = async () => {
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao trước khi gửi!');
      return;
    }

    try {
      // Phân loại ảnh: ảnh đã có trên server (http) vs ảnh local mới
      const existingImages = localImages.filter(img => img.startsWith('http'));
      const localOnlyImages = localImages.filter(
        img => !img.startsWith('http'),
      );

      let finalImages: string[] = [];

      if (localOnlyImages.length > 0) {
        // Upload ảnh local mới
        const base64Images = await Promise.all(
          localOnlyImages.map(async uri => {
            const RNFS = require('react-native-fs');
            const base64 = await RNFS.readFile(uri, 'base64');
            return `data:image/jpeg;base64,${base64}`;
          }),
        );

        const { uploadToCloudinary } = require('../utils/uploadToCloudinary');
        const uploadedUrls = await Promise.all(
          base64Images.map(base64 => uploadToCloudinary(base64)),
        );

        finalImages = [...existingImages, ...uploadedUrls];
      } else {
        finalImages = existingImages;
      }

      // Gọi handleUpdate với ảnh đã upload
      await handleUpdate(finalImages);
    } catch (err) {
      console.error('Error updating review:', err);
      Alert.alert('❌ Lỗi', 'Cập nhật đánh giá thất bại');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header với button close */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require('../assets/close.png')}
            style={styles.closeIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Chỉnh sửa đánh giá</Text>
      </View>

      {/* User info */}
      <View style={styles.userRow}>
        <Image
          source={
            avatarUrl
              ? { uri: avatarUrl }
              : require('../assets/avt_default.jpg')
          }
          style={styles.avatar}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.public}>Đăng công khai</Text>
        </View>
      </View>

      {/* Rating */}
      <RatingStars
        maxStars={5}
        onRatingChange={setRating}
        initialRating={currentRating}
      />

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

      {/* Nút cập nhật */}
      <TouchableOpacity
        style={[
          styles.button,
          (uploading || imageuploading) && { opacity: 0.6 },
        ]}
        onPress={onUpdateWithImages}
        disabled={uploading || imageuploading}
      >
        {uploading || imageuploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Cập nhật đánh giá</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditReviewScreen;
