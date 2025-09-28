import React, { useState } from 'react';
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

const ReviewScreen: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao trước khi gửi!');
      return;
    }
    Alert.alert(
      'Cảm ơn bạn!',
      `Bạn đã đánh giá ${rating} sao với nội dung: ${reviewText}`,
    );
    // TODO: gọi API lưu đánh giá vào backend
    setReviewText('');
    setRating(0);
  };

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
          <Text style={styles.userName}>Thái Viết Quốc Hưng</Text>
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
        value={reviewText}
        onChangeText={setReviewText}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Gửi đánh giá</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReviewScreen;
