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
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RatingStars from '../components/RatingStars';
import ReviewItem from '../components/ReviewItem';
import RestaurantInfo from '../components/RestaurantInfo';
import { useRestaurantDetail } from '../hooks/useRestaurantDetail';
import { useRestaurantReviews } from '../hooks/useRestaurantReviews';
import styles from '../styles/ShopDetailStyles';
import {
  getRestaurantById,
  getDishesOfRestaurant,
  createReport,
} from '../api/apiConfig';
import { handleImagePreview } from '../utils/imagePreview';
import { get } from 'lodash';
import { getRole, getUserId } from '../utils/auth';

export default function RestaurantDetailScreen() {
  const route = useRoute<any>();
  const navigate = useNavigation<any>();
  const { item, restaurantId, reviewId, fromNotification, needsFetchDetail } =
    route.params || {};
  const flatListRef = useRef<FlatList<any>>(null);
  const currentRestaurantId = item ? item.restaurantId : restaurantId;
  const {
    reviews,
    loading,
    loadingMore,
    error,
    removeReview,
    loadMore,
    hasMore,
  } = useRestaurantReviews(currentRestaurantId);
  const [restaurantDetail, setRestaurantDetail] = useState<any>(item || null);
  const [loadingDetail, setLoadingDetail] = useState(!item || needsFetchDetail);
  const { rating, setRating, foodImages } =
    useRestaurantDetail(restaurantDetail);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuDishes, setMenuDishes] = useState<any[]>([]);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [localReviews, setLocalReviews] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [validFoodImages, setValidFoodImages] = useState<string[]>([]);
  const [isValidatingImages, setIsValidatingImages] = useState(false);
  const [imagesModalVisible, setImagesModalVisible] = useState(false);
  console.log('Reviews:', reviews);

  // Sync reviews to local state
  useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  // Check user authentication and role
  useEffect(() => {
    const checkUserAuth = async () => {
      const userId = await getUserId();
      const role = await getRole();
      setIsAuthenticated(!!userId);
      setUserRole(role);
    };
    checkUserAuth();
  }, []);

  // Validate all food images
  useEffect(() => {
    const validateImages = async () => {
      if (!foodImages || foodImages.length === 0) {
        setValidFoodImages([]);
        return;
      }

      setIsValidatingImages(true);
      const validImages: string[] = [];

      // Check each image
      for (const imageUrl of foodImages) {
        if (!imageUrl) continue;

        try {
          // Try to prefetch the image to check if it's accessible
          await Image.prefetch(imageUrl);
          validImages.push(imageUrl);
          console.log('✅ Image valid:', imageUrl);
        } catch (error) {
          console.log('❌ Image failed (403 or error):', imageUrl);
          // Image failed to load (403 or other error), skip it
        }
      }

      setValidFoodImages(validImages);
      setIsValidatingImages(false);
    };

    validateImages();
  }, [foodImages]);

  // Function to update review with vendor reply
  const updateReviewWithReply = (
    reviewId: string,
    vendorReply: string,
    repliedAt: string,
  ) => {
    setLocalReviews(prev =>
      prev.map(review =>
        review.reviewId === reviewId
          ? { ...review, vendorReply, repliedAt }
          : review,
      ),
    );
  };

  // 🔹 Fetch chi tiết nhà hàng khi cần (từ MapScreen hoặc không có item)
  useEffect(() => {
    const fetchRestaurant = async () => {
      // Fetch khi: 1) Không có item HOẶC 2) Có needsFetchDetail flag
      if (
        (!item && currentRestaurantId) ||
        (needsFetchDetail && currentRestaurantId)
      ) {
        setLoadingDetail(true);
        try {
          console.log('🔄 Đang fetch chi tiết nhà hàng:', currentRestaurantId);
          const response = await getRestaurantById(currentRestaurantId);
          setRestaurantDetail(response.data);
          console.log('✅ Đã tải chi tiết nhà hàng:', response.data);
        } catch (err) {
          console.error('❌ Lỗi khi tải chi tiết nhà hàng:', err);
          Alert.alert(
            'Lỗi',
            'Không thể tải thông tin nhà hàng. Vui lòng thử lại.',
          );
        } finally {
          setLoadingDetail(false);
        }
      } else {
        // Đã có đầy đủ thông tin, không cần fetch
        setLoadingDetail(false);
      }
    };
    fetchRestaurant();
  }, [currentRestaurantId, needsFetchDetail]);

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

  // Hàm xử lý gửi report
  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập lý do báo cáo');
      return;
    }

    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn gửi báo cáo này?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Xác nhận',
        onPress: async () => {
          setReportLoading(true);
          try {
            await createReport({
              restaurantId: currentRestaurantId,
              reason: reportReason,
            });
            Alert.alert('Thành công', 'Đã gửi báo cáo thành công');
            setReportVisible(false);
            setReportReason('');
          } catch (error) {
            console.error('Lỗi khi gửi báo cáo:', error);
            Alert.alert('Lỗi', 'Không thể gửi báo cáo. Vui lòng thử lại');
          } finally {
            setReportLoading(false);
          }
        },
      },
    ]);
  };

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
        style={styles.headerContainer}
      >
        <Text
          testID="restaurant-detail-name"
          accessibilityLabel="restaurant-detail-name"
          style={styles.title}
          numberOfLines={2}
        >
          {restaurantDetail?.name}
        </Text>
        {isAuthenticated && userRole !== 'vendor' && (
          <TouchableOpacity
            testID="report-button"
            accessibilityLabel="report-button"
            style={styles.reportButton}
            onPress={() => setReportVisible(true)}
          >
            <Image
              testID="report-icon"
              accessibilityLabel="report-icon"
              style={styles.reportIcon}
              source={require('../assets/report.png')}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          testID="close-button"
          accessibilityLabel="close-button"
          style={styles.closeButton}
          onPress={() => navigate.navigate('Drawer')}
        >
          <Image
            testID="close-icon"
            accessibilityLabel="close-icon"
            style={styles.closeIcon}
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

      {/* Tags */}
      {restaurantDetail?.tags && restaurantDetail.tags.length > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginVertical: 10,
          }}
        >
          {restaurantDetail.tags.map((tag: any, index: number) => (
            <View
              key={tag.tagId || index}
              style={{
                backgroundColor: '#E3F2FD',
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 6,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text
                style={{ color: '#1976D2', fontSize: 13, fontWeight: '500' }}
              >
                {tag.name}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Ảnh */}
      {isValidatingImages ? (
        <View
          style={{
            height: 200,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <ActivityIndicator size="large" color="#0C516F" />
          <Text style={{ marginTop: 10, color: '#666', fontSize: 14 }}>
            Đang tải hình ảnh...
          </Text>
        </View>
      ) : (
        validFoodImages.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            <TouchableOpacity
              onPress={() =>
                handleImagePreview(
                  navigate,
                  validFoodImages[0],
                  validFoodImages,
                )
              }
            >
              <Image
                source={{ uri: validFoodImages[0] }}
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 12,
                }}
                resizeMode="cover"
                onError={() => {
                  setValidFoodImages(prev =>
                    prev.filter(img => img !== validFoodImages[0]),
                  );
                }}
              />
            </TouchableOpacity>
            {validFoodImages.length > 1 && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  paddingHorizontal: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  paddingVertical: 8,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => setImagesModalVisible(true)}
              >
                <Text style={{ color: '#fff', fontSize: 13, marginRight: 4 }}>
                  +{validFoodImages.length - 1}
                </Text>
                <Text
                  style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}
                >
                  Xem thêm
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )
      )}

      {/* Info */}
      <View
        testID="restaurant-info-section"
        accessibilityLabel="restaurant-info-section"
      >
        <RestaurantInfo address={restaurantDetail?.address} />
        {/* Thêm nút Xem Menu và Đường đi */}
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#0C516F',
              borderRadius: 8,
              paddingVertical: 5,
              alignItems: 'center',
              paddingHorizontal: 10,
            }}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
              Xem Menu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#FF5722',
              borderRadius: 8,
              paddingVertical: 5,
              alignItems: 'center',
              paddingHorizontal: 10,
            }}
            onPress={() => {
              if (restaurantDetail?.latitude && restaurantDetail?.longitude) {
                navigate.navigate('Navigation', {
                  destinationName: restaurantDetail.name,
                  destinationCoords: [
                    restaurantDetail.longitude,
                    restaurantDetail.latitude,
                  ],
                });
              }
            }}
            testID="directions-button"
            accessibilityLabel="directions-button"
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
              Đường đi
            </Text>
          </TouchableOpacity>
        </View>
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
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
        }}
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
            initialRating={0}
            readOnly={true}
            onRatingChange={async value => {
              const userRole = await getRole();
              console.log('User role khi đánh giá:', userRole);
              if (userRole === 'user') {
                navigate.navigate('Review', {
                  restaurantId: restaurantDetail?.restaurantId,
                });
              } else {
                Alert.alert(
                  'Thông báo',
                  'Chỉ người dùng đã đăng nhập mới có thể đánh giá nhà hàng',
                );
              }
            }}
          />
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        testID="reviews-list"
        accessibilityLabel="reviews-list"
        data={loading ? [] : localReviews}
        keyExtractor={item => item.reviewId}
        renderItem={({ item, index }) => (
          <View
            testID={`review-item-${index}`}
            accessibilityLabel={`review-item-${index}`}
            style={styles.reviewContainer}
          >
            <ReviewItem
              item={item}
              restaurantId={currentRestaurantId}
              onReviewDeleted={removeReview}
              restaurantOwnerAccountId={restaurantDetail?.ownerAccountId}
              onReplySuccess={updateReviewWithReply}
              isAuthenticated={isAuthenticated}
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.reviewSeparator} />}
        scrollEnabled={false}
        contentContainerStyle={styles.reviewListContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#0C516F" />
              <Text style={{ marginTop: 8, color: '#666', fontSize: 13 }}>
                Đang tải thêm đánh giá...
              </Text>
            </View>
          ) : null
        }
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

      {/* Modal Report */}
      <Modal
        visible={reportVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 20,
              width: '85%',
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 15,
                textAlign: 'center',
              }}
            >
              Báo cáo nhà hàng
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#666',
                marginBottom: 10,
              }}
            >
              Lý do báo cáo:
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                padding: 12,
                minHeight: 100,
                textAlignVertical: 'top',
                marginBottom: 20,
              }}
              placeholder="Nhập lý do báo cáo..."
              value={reportReason}
              onChangeText={setReportReason}
              multiline
              editable={!reportLoading}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#ccc',
                  padding: 12,
                  borderRadius: 8,
                  marginRight: 10,
                }}
                onPress={() => {
                  setReportVisible(false);
                  setReportReason('');
                }}
                disabled={reportLoading}
              >
                <Text
                  style={{
                    color: '#333',
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#FF3B30',
                  padding: 12,
                  borderRadius: 8,
                  marginLeft: 10,
                }}
                onPress={handleSubmitReport}
                disabled={reportLoading}
              >
                {reportLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}
                  >
                    Gửi báo cáo
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal hiển thị tất cả ảnh */}
      <Modal
        visible={imagesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setImagesModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.9)',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              paddingTop: 40,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
              Tất cả hình ảnh ({validFoodImages.length})
            </Text>
            <TouchableOpacity onPress={() => setImagesModalVisible(false)}>
              <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold' }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={validFoodImages}
            keyExtractor={(_, index) => index.toString()}
            numColumns={2}
            contentContainerStyle={{ padding: 8 }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={{ flex: 1, margin: 4 }}
                onPress={() => {
                  setImagesModalVisible(false);
                  handleImagePreview(navigate, item, validFoodImages);
                }}
              >
                <Image
                  source={{ uri: item }}
                  style={{
                    width: '100%',
                    height: 150,
                    borderRadius: 8,
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}
