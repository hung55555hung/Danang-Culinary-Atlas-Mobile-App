import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RatingStars from '../components/RatingStars';
import ReviewItem from '../components/ReviewItem';
import RestaurantInfo from '../components/RestaurantInfo';
import { useRestaurantDetail } from '../hooks/useRestaurantDetail';
import { useRestaurantReviews } from '../hooks/useRestaurantReviews';
import styles from '../styles/ShopDetailStyles';
import { getRestaurantById } from '../api/apiConfig';
import { handleImagePreview } from '../utils/imagePreview';

export default function RestaurantDetailScreen() {
  const route = useRoute<any>();
  const navigate = useNavigation<any>();
  const { item, restaurantId, reviewId, fromNotification } = route.params || {};
  const flatListRef = useRef<FlatList<any>>(null);
  const currentRestaurantId = item ? item.restaurantId : restaurantId;
  const { reviews, loading, error } = useRestaurantReviews(currentRestaurantId);
  const [restaurantDetail, setRestaurantDetail] = useState<any>(item || null);
  const [loadingDetail, setLoadingDetail] = useState(!item);
  const { rating, setRating, foodImages } =
    useRestaurantDetail(restaurantDetail);
  console.log('Reviews:', reviews);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!item && currentRestaurantId) {
        try {
          const response = await getRestaurantById(currentRestaurantId);
          setRestaurantDetail(response.data);
        } catch (err) {
          console.error('Lỗi khi tải chi tiết nhà hàng:', err);
        } finally {
          setLoadingDetail(false);
        }
      }
    };
    fetchRestaurant();
  }, [currentRestaurantId]);

  useEffect(() => {
    if (fromNotification && reviewId && reviews.length > 0) {
      const index = reviews.findIndex(r => r.reviewId === reviewId);
      if (index !== -1) {
        flatListRef.current?.scrollToIndex({ index, animated: true });
      }
    }
  }, [fromNotification, reviewId, reviews]);

  return (
    <ScrollView
      style={styles.container}
      testID="shop-detail-scroll"
      accessibilityLabel="shop-detail-scroll"
    >
      {/* Header */}
      <View
        testID="shop-detail-header"
        accessibilityLabel="shop-detail-header"
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        <Text
          testID="restaurant-detail-name"
          accessibilityLabel="restaurant-detail-name"
          style={styles.title}
        >
          {restaurantDetail?.name}
        </Text>
        <TouchableOpacity
          testID="close-button"
          accessibilityLabel="close-button"
          style={{ marginLeft: 'auto' }}
          onPress={() => navigate.navigate('Drawer')}
        >
          <Image
            testID="close-icon"
            accessibilityLabel="close-icon"
            style={{ width: 24, height: 24, marginLeft: 'auto', marginTop: 20 }}
            source={require('../assets/close.png')}
          />
        </TouchableOpacity>
      </View>

      {/* Rating */}
      <View
        testID="rating-section"
        accessibilityLabel="rating-section"
        style={styles.row}
      >
        <Text
          testID="restaurant-rating"
          accessibilityLabel="restaurant-rating"
          style={styles.ratingNumber}
        >
          {restaurantDetail?.averageRating}
        </Text>
        {Array.from(
          { length: Math.round(restaurantDetail?.averageRating || 0) },
          (_, i) => (
            <Image
              key={i}
              source={require('../assets/star_filled.png')}
              style={styles.starSmall}
            />
          ),
        )}
      </View>
      <Text
        testID="restaurant-category"
        accessibilityLabel="restaurant-category"
        style={styles.category}
      >
        Quán ăn
      </Text>

      {/* Ảnh */}
      <FlatList
        testID="food-images-list"
        accessibilityLabel="food-images-list"
        data={foodImages}
        horizontal
        keyExtractor={(_, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            testID={`food-image-${index}`}
            accessibilityLabel={`food-image-${index}`}
            onPress={() => handleImagePreview(navigate, item, foodImages)}
          >
            <Image
              testID={`food-image-element-${index}`}
              accessibilityLabel={`food-image-element-${index}`}
              source={{ uri: item }}
              style={styles.foodImageCarousel}
            />
          </TouchableOpacity>
        )}
        style={{ marginBottom: 10 }}
      />

      {/* Info */}
      <View
        testID="restaurant-info-section"
        accessibilityLabel="restaurant-info-section"
      >
        <RestaurantInfo address={restaurantDetail?.address} />
      </View>

      {/* Review */}
      <Text
        testID="review-section-title"
        accessibilityLabel="review-section-title"
        style={styles.sectionTitle}
      >
        Xếp hạng và đánh giá
      </Text>
      <View
        testID="rating-stars-container"
        accessibilityLabel="rating-stars-container"
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
      >
        <Image
          testID="review-avatar"
          accessibilityLabel="review-avatar"
          source={require('../assets/avt_default.jpg')}
          style={styles.avatar}
        />
        <View testID="rating-stars" accessibilityLabel="rating-stars">
          <RatingStars
            maxStars={5}
            onRatingChange={value => {
              setRating(value);
              navigate.navigate('Review', {
                restaurantId: restaurantDetail?.restaurantId,
              });
            }}
          />
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        testID="reviews-list"
        accessibilityLabel="reviews-list"
        data={loading ? [] : reviews}
        keyExtractor={item => item.reviewId}
        renderItem={({ item, index }) => (
          <View
            testID={`review-item-${index}`}
            accessibilityLabel={`review-item-${index}`}
          >
            <ReviewItem item={item} />
          </View>
        )}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}
