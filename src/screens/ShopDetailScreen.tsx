import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import RatingStars from '../components/RatingStars';
import styles from '../styles/ShopDetailStyles';
import { useNavigation } from '@react-navigation/native';

const mockReviews = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    avatar: require('../assets/avt_default.jpg'),
    time: '1 giờ trước',
    rating: 5,
    content: 'Mì Quảng ngon, nước dùng đậm đà, không gian sạch sẽ.',
    image: require('../assets/anh.jpg'),
  },
  {
    id: '2',
    name: 'Lê Thị Mai',
    avatar: require('../assets/avt_default.jpg'),
    time: '3 giờ trước',
    rating: 4,
    content: 'Phục vụ nhanh, nhưng hơi đông khách nên đợi một chút.',
    image: require('../assets/anh.jpg'),
  },
  {
    id: '3',
    name: 'Phạm Quốc Huy',
    avatar: require('../assets/avt_default.jpg'),
    time: 'Hôm qua',
    rating: 5,
    content: 'Rất hài lòng, chắc chắn sẽ quay lại lần sau!',
    image: require('../assets/anh.jpg'),
  },
  {
    id: '4',
    name: 'Trần Hồng Nhung',
    avatar: require('../assets/avt_default.jpg'),
    time: '2 ngày trước',
    rating: 3,
    content: 'Món ăn ổn nhưng hơi mặn so với khẩu vị của mình.',
    image: require('../assets/anh.jpg'),
  },
];

const RestaurantDetailScreen: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const navigate = useNavigation<any>();

  // Local images cho quán ăn
  const foodImages = [
    require('../assets/anh.jpg'),
    require('../assets/anh.jpg'),
    require('../assets/anh.jpg'),
  ];

  const renderReview = ({ item }: any) => (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <Image source={item.avatar} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewerName}>{item.name}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginVertical: 3 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <Image
                key={i}
                source={
                  i < item.rating
                    ? require('../assets/star_filled.png')
                    : require('../assets/star_outline.png')
                }
                style={styles.starSmall}
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.reviewText}>{item.content}</Text>
      {item.image && <Image source={item.image} style={styles.reviewImage} />}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header quán ăn */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.title}>Mỳ quán bếp Trang</Text>
        <TouchableOpacity
          style={{ marginLeft: 'auto' }}
          onPress={() => navigate.navigate('Map')}
        >
          <Image
            style={{ width: 24, height: 24, marginLeft: 'auto', marginTop: 20 }}
            source={require('../assets/close.png')}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <Text style={styles.ratingNumber}>5.0</Text>
        {Array.from({ length: 5 }, (_, i) => (
          <Image
            key={i}
            source={require('../assets/star_filled.png')}
            style={styles.starSmall}
          />
        ))}
      </View>
      <Text style={styles.category}>Quán ăn</Text>

      {/* Ảnh quán ăn */}
      <FlatList
        data={foodImages}
        horizontal
        keyExtractor={(_, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Image source={item} style={styles.foodImageCarousel} />
        )}
        style={{ marginBottom: 10 }}
      />

      {/* Thông tin quán */}
      <View style={styles.infoRow}>
        <Text>📍 441 Ông Ích Khiêm, Đà Nẵng</Text>
      </View>
      <View style={styles.infoRow}>
        <Text>📞 0766 771 772</Text>
      </View>
      <View style={styles.infoRow}>
        <Text>🕒 6:00 AM - 23:00 PM</Text>
      </View>

      {/* Form đánh giá */}
      <Text style={styles.sectionTitle}>Xếp hạng và đánh giá</Text>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
      >
        <Image
          source={require('../assets/avt_default.jpg')}
          style={styles.avatar}
        />
        <RatingStars
          maxStars={5}
          onRatingChange={value => {
            setRating(value);
            navigate.navigate('Review', { rating: value });
          }}
        />
      </View>
      {/* <TextInput
        style={styles.input}
        placeholder="Nhập đánh giá của bạn..."
        multiline
        value={reviewText}
        onChangeText={setReviewText}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmitReview}>
        <Text style={styles.buttonText}>Gửi đánh giá</Text>
      </TouchableOpacity> */}

      {/* Danh sách review */}
      <FlatList
        data={mockReviews}
        keyExtractor={item => item.id}
        renderItem={renderReview}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

export default RestaurantDetailScreen;
