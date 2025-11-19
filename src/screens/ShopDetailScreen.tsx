import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RatingStars from '../components/RatingStars';
import ReviewItem from '../components/ReviewItem';
import RestaurantInfo from '../components/RestaurantInfo';
import { useRestaurantDetail } from '../hooks/useRestaurantDetail';
import { useRestaurantReviews } from '../hooks/useRestaurantReviews';
import styles from '../styles/ShopDetailStyles';
import { getRestaurantById, getDishesOfRestaurant } from '../api/apiConfig';
import { handleImagePreview } from '../utils/imagePreview';
import { get } from 'lodash';

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
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuDishes, setMenuDishes] = useState<any[]>([]);
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

  // Hàm lấy danh sách món ăn khi mở modal
  const fetchMenuDishes = async () => {
    setMenuLoading(true);
    try {
      const data = await getDishesOfRestaurant(currentRestaurantId);
      setMenuDishes(data);
      console.log('Món ăn của nhà hàng:', data);
    } catch (err) {
      setMenuDishes([]);
    } finally {
      setMenuLoading(false);
    }
  };

  // Khi mở modal thì fetch menu
  useEffect(() => {
    if (menuVisible) {
      fetchMenuDishes();
    }
  }, [menuVisible]);

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
        {/* Thêm nút Xem Menu */}
        <TouchableOpacity
          style={{
            marginTop: 12,
            backgroundColor: '#0C516F',
            borderRadius: 8,
            paddingVertical: 5,
            alignItems: 'center',
            alignSelf: 'flex-start',
            paddingHorizontal: 10,
          }}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
            Xem Menu
          </Text>
        </TouchableOpacity>
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

      {/* Modal hiển thị menu món ăn */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 20,
              width: '90%',
              maxHeight: '80%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                Menu món ăn
              </Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Text style={{ fontSize: 18, color: '#1E90FF' }}>Đóng</Text>
              </TouchableOpacity>
            </View>
            {menuLoading ? (
              <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={menuDishes}
                keyExtractor={item => item.dishId}
                renderItem={({ item }) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 10,
                      borderBottomWidth: 0.5,
                      borderColor: '#eee',
                    }}
                  >
                    <Image
                      source={
                        item.images && item.images.length > 0
                          ? { uri: item.images[0] }
                          : require('../assets/food_placeholder.png')
                      }
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        marginRight: 12,
                        backgroundColor: '#eee',
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 15 }}>
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          color: '#1E90FF',
                          fontWeight: 'bold',
                          marginTop: 2,
                        }}
                      >
                        {item.price?.toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        })}
                      </Text>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <Text
                    style={{
                      textAlign: 'center',
                      color: '#888',
                      marginTop: 20,
                    }}
                  >
                    Chưa có món ăn nào.
                  </Text>
                }
                style={{ marginBottom: 8 }}
              />
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
