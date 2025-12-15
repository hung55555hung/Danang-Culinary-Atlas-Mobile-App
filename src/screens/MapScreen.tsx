import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  PermissionsAndroid,
  Alert,
  ScrollView,
  Animated,
  PanResponder,
} from 'react-native';
import Mapbox, {
  MapView,
  Camera,
  ShapeSource,
  SymbolLayer,
  MarkerView,
  LocationPuck,
} from '@rnmapbox/maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import styles from '../styles/MapStyles';
import {
  getRestaurants,
  getRestaurantDetail,
  getRestaurantById,
} from '../api/apiConfig';
import { useFocusEffect } from '@react-navigation/native';
import debounce from 'lodash/debounce';
import Geolocation from '@react-native-community/geolocation';
import { useRecommendations } from '../hooks/useRecommendations';

interface Restaurant {
  restaurantId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photo?: string;
  images?: {
    photo?: string;
    sub_photo?: string[];
  };
  averageRating?: number;
}

const MapScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const stackNav = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  const cameraRef = useRef<Camera>(null);

  // Helper function để lấy ảnh từ restaurant
  const getRestaurantImage = (restaurant: Restaurant): string => {
    // Ưu tiên: restaurant.photo
    // Thứ 2: restaurant.images.photo
    // Thứ 3: restaurant.images.sub_photo[0]
    return (
      restaurant.photo ||
      restaurant.images?.photo ||
      restaurant.images?.sub_photo?.[0] ||
      ''
    );
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentZoom, setCurrentZoom] = useState<number>(12);
  const [searchText, setSearchText] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    [],
  );
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locationPermission, setLocationPermission] = useState(false);
  const [recommendedRestaurants, setRecommendedRestaurants] = useState<
    Restaurant[]
  >([]);

  // Animation cho swipeable recommendations panel
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isRecommendationsExpanded, setIsRecommendationsExpanded] =
    useState(true);

  // Lấy danh sách quán ăn recommend (không cần đăng nhập)
  const {
    recommendations,
    loading: recommendLoading,
    contextLabel,
    refetch,
  } = useRecommendations({
    k: 5,
    targetType: 'restaurant',
    enabled: true,
  });

  // PanResponder để xử lý swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Chỉ bắt đầu pan khi swipe dọc (dy > dx)
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        // Chỉ cho phép kéo xuống (gestureState.dy > 0)
        if (gestureState.dy > 0 && isRecommendationsExpanded) {
          slideAnim.setValue(gestureState.dy);
        }
        // Chỉ cho phép kéo lên khi đang ẩn
        if (gestureState.dy < 0 && !isRecommendationsExpanded) {
          slideAnim.setValue(200 + gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Nếu kéo xuống quá 50px thì ẩn
        if (gestureState.dy > 50 && isRecommendationsExpanded) {
          Animated.spring(slideAnim, {
            toValue: 200,
            useNativeDriver: true,
          }).start();
          setIsRecommendationsExpanded(false);
        }
        // Nếu kéo lên quá -50px thì hiển thị
        else if (gestureState.dy < -50 && !isRecommendationsExpanded) {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          setIsRecommendationsExpanded(true);
        }
        // Không đủ điều kiện thì trở lại vị trí ban đầu
        else {
          Animated.spring(slideAnim, {
            toValue: isRecommendationsExpanded ? 0 : 200,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  useFocusEffect(
    useCallback(() => {
      const checkLogin = async () => {
        const token = await AsyncStorage.getItem('token');
        const avatar = await AsyncStorage.getItem('avatarUrl');
        setIsLoggedIn(!!token);
        setAvatarUrl(avatar);
      };
      checkLogin();
    }, []),
  );

  // 🔹 Hàm gọi API khi zoom thay đổi (có debounce)
  const fetchRestaurantsByZoom = useCallback(
    debounce(async (zoomLevel: number) => {
      console.log('🔍 Gọi API với zoomLevel:', zoomLevel);
      try {
        const res = await getRestaurants(Math.floor(zoomLevel * 0.8));
        console.log('📍 Danh sách nhà hàng:', res.data?.length);

        // Lọc nhà hàng có tọa độ hợp lệ
        const validRestaurants = (res.data || []).filter((item: Restaurant) => {
          const isValid =
            item.latitude &&
            item.longitude &&
            item.latitude !== 0 &&
            item.longitude !== 0;

          if (!isValid) {
            console.warn('⚠️ Nhà hàng thiếu tọa độ:', item.name);
          }
          return isValid;
        });

        console.log('✅ Nhà hàng hợp lệ:', validRestaurants);
        setRestaurants(validRestaurants);
      } catch (err) {
        console.error('❌ Lỗi khi tải danh sách nhà hàng:', err);
      }
    }, 800),
    [],
  );

  // 🔹 Xin quyền truy cập vị trí
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Quyền truy cập vị trí',
            message:
              'Ứng dụng cần quyền truy cập vị trí để hiển thị vị trí hiện tại và chỉ đường',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setLocationPermission(true);
          getCurrentLocation();
        } else {
          Alert.alert('Quyền bị từ chối', 'Không thể hiển thị vị trí hiện tại');
        }
      } else {
        // iOS - quyền sẽ được xin tự động khi gọi Geolocation
        setLocationPermission(true);
        getCurrentLocation();
      }
    } catch (err) {
      console.error('❌ Lỗi xin quyền vị trí:', err);
    }
  };

  // 🔹 Lấy vị trí hiện tại
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { longitude, latitude } = position.coords;
        console.log('📍 Vị trí hiện tại:', latitude, longitude);
        setUserLocation([longitude, latitude]);

        // Di chuyển camera đến vị trí hiện tại
        cameraRef.current?.setCamera({
          centerCoordinate: [longitude, latitude],
          zoomLevel: 14,
          animationDuration: 1000,
        });
      },
      error => {
        console.error('❌ Lỗi lấy vị trí:', error);
        // Fallback: Sử dụng vị trí mặc định (Hà Nội)
        const defaultLocation: [number, number] = [105.8342, 21.0278];
        setUserLocation(defaultLocation);
        Alert.alert(
          'Không lấy được vị trí',
          'Sử dụng vị trí mặc định. Vui lòng bật GPS để có kết quả chính xác hơn.',
        );
      },
      {
        enableHighAccuracy: false, // Giảm độ chính xác để nhanh hơn
        timeout: 30000, // Tăng timeout lên 30s
        maximumAge: 30000, // Chấp nhận cache 30s
      },
    );
  };

  // 🔹 Gọi API lần đầu khi mở map + xin quyền vị trí
  useEffect(() => {
    (async () => {
      try {
        console.log('🚀 Đang tải danh sách nhà hàng ban đầu...');
        const res = await getRestaurants(5);
        console.log('📍 API trả về:', res.data?.length, 'nhà hàng');

        // Lọc nhà hàng có tọa độ hợp lệ
        const validRestaurants = (res.data || []).filter((item: Restaurant) => {
          const isValid =
            item.latitude &&
            item.longitude &&
            item.latitude !== 0 &&
            item.longitude !== 0;

          if (!isValid) {
            console.warn('⚠️ Nhà hàng thiếu tọa độ:', item.name);
          }
          return isValid;
        });

        console.log('✅ Nhà hàng hợp lệ:', validRestaurants.length);
        setRestaurants(validRestaurants);

        // Xin quyền vị trí
        requestLocationPermission();
      } catch (err) {
        console.error('❌ Lỗi khi tải danh sách ban đầu:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAvatarPress = () => {
    if (isLoggedIn) {
      navigation.openDrawer();
    } else {
      stackNav.navigate('Login');
    }
  };

  // Cập nhật filteredRestaurants khi searchText hoặc restaurants thay đổi
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredRestaurants(restaurants);
    } else {
      setFilteredRestaurants(
        restaurants.filter(r =>
          r.name.toLowerCase().includes(searchText.trim().toLowerCase()),
        ),
      );
    }
  }, [searchText, restaurants]);

  // 📊 Fetch thông tin các restaurants được recommend
  useEffect(() => {
    const fetchRecommendedRestaurants = async () => {
      if (recommendations.length === 0) {
        setRecommendedRestaurants([]);
        return;
      }

      console.log('🔍 Fetching recommended restaurants...');
      console.log(
        '🎯 Recommendation IDs:',
        recommendations.map(r => r.id),
      );

      try {
        // Gọi API để lấy thông tin từng restaurant
        const fetchPromises = recommendations.map(rec =>
          getRestaurantById(rec.id).catch((err: any) => {
            console.error(`❌ Lỗi khi lấy restaurant ${rec.id}:`, err.message);
            return null;
          }),
        );

        const results = await Promise.all(fetchPromises);

        // Lọc bỏ các kết quả null và lấy data
        const fetchedRestaurants = results
          .filter((res: any) => res && res.data)
          .map((res: any) => res!.data);

        console.log(
          `✅ Fetched ${fetchedRestaurants.length}/${recommendations.length} recommended restaurants`,
        );

        // Log để kiểm tra data của restaurants
        fetchedRestaurants.forEach((restaurant: any, index: number) => {
          console.log(`🏪 Restaurant ${index + 1}:`, {
            id: restaurant.restaurantId,
            name: restaurant.name,
            photo: restaurant.photo || restaurant.images?.[0] || 'NO PHOTO',
            hasPhoto: !!restaurant.photo,
            hasImages: !!restaurant.images,
          });
        });

        setRecommendedRestaurants(fetchedRestaurants);
      } catch (err) {
        console.error('❌ Lỗi khi fetch recommended restaurants:', err);
        setRecommendedRestaurants([]);
      }
    };

    fetchRecommendedRestaurants();
  }, [recommendations]);

  // Convert restaurants to GeoJSON
  const restaurantsGeoJSON = {
    type: 'FeatureCollection',
    features: restaurants.map(item => ({
      type: 'Feature',
      id: item.restaurantId,
      geometry: {
        type: 'Point',
        coordinates: [item.longitude, item.latitude],
      },
      properties: {
        name: item.name,
        address: item.address,
        photo: item.photo,
        restaurantId: item.restaurantId,
      },
    })),
  };

  const handleMarkerPress = async (feature: any) => {
    const restaurantId = feature.properties.restaurantId;
    console.log('🏪 Nhà hàng được chọn:', feature.properties.name);
    try {
      stackNav.navigate('ShopDetail', { restaurantId: restaurantId });
    } catch (error) {
      console.error('❌ Lỗi khi lấy chi tiết nhà hàng:', error);
    }
  };

  // Hiển thị loading indicator khi đang tải dữ liệu
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Đang tải bản đồ...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          styleURL={Mapbox.StyleURL.Street}
          testID="MapView"
          accessibilityLabel="MapView"
          // ✅ Bật zoom/pan/rotate gestures
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
          onCameraChanged={state => {
            const newZoom = Math.round(state.properties.zoom);
            if (Math.abs(newZoom - currentZoom) >= 1) {
              setCurrentZoom(newZoom);
              fetchRestaurantsByZoom(newZoom);
            }
          }}
        >
          <Camera
            ref={cameraRef}
            zoomLevel={12}
            centerCoordinate={[108.22302, 16.05009]}
            animationDuration={0}
            // ✅ Cho phép user control camera
            allowUpdates={true}
            minZoomLevel={10}
            maxZoomLevel={20}
          />

          {/* 📍 Hiển thị vị trí hiện tại của người dùng */}
          {locationPermission && userLocation && (
            <LocationPuck
              puckBearingEnabled
              puckBearing="heading"
              pulsing={{
                isEnabled: true,
                color: '#4285F4',
                radius: 100,
              }}
            />
          )}

          {/* 🗺️ Markers - Hiển thị nhà hàng trên bản đồ với ảnh nhỏ */}
          {restaurants.slice(0, 50).map(restaurant => (
            <MarkerView
              key={restaurant.restaurantId}
              id={restaurant.restaurantId}
              coordinate={[restaurant.longitude, restaurant.latitude]}
              anchor={{ x: 0.5, y: 1 }}
              allowOverlap
              isSelected={false}
            >
              <View pointerEvents="auto">
                <TouchableOpacity
                  activeOpacity={0.7}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  delayPressIn={0}
                  onPress={() => {
                    console.log('click marker:', restaurant.name);
                    handleMarkerPress({
                      properties: {
                        restaurantId: restaurant.restaurantId,
                        name: restaurant.name,
                      },
                    });
                  }}
                  style={{
                    alignItems: 'center',
                  }}
                >
                  {/* Ảnh marker tròn */}
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      overflow: 'hidden',
                      borderWidth: 2,
                      borderColor: '#FF5722',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <Image
                      source={{ uri: getRestaurantImage(restaurant) }}
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                      resizeMode="cover"
                    />
                  </View>
                  {/* Tên nhà hàng */}
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                      marginTop: 2,
                      maxWidth: 120,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '600',
                        color: '#333',
                      }}
                      numberOfLines={1}
                    >
                      {restaurant.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </MarkerView>
          ))}
        </MapView>

        {/* Search Bar */}
        <View
          style={styles.searchBarContainer}
          testID="search-bar-container"
          accessibilityLabel="search-bar-container"
        >
          <View
            style={styles.searchBar}
            testID="search-bar"
            accessibilityLabel="search-bar"
          >
            <Image
              source={require('../assets/gps.png')}
              style={styles.mapIcon}
              testID="gps-icon"
              accessibilityLabel="gps-icon"
            />

            <TextInput
              testID="search-input"
              accessibilityLabel="search-input"
              placeholder="Tìm kiếm ở đây"
              placeholderTextColor="#555"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />

            <TouchableOpacity
              testID="button-avt"
              accessibilityLabel="button-avt"
              onPress={handleAvatarPress}
            >
              <Image
                source={
                  isLoggedIn
                    ? avatarUrl
                      ? { uri: avatarUrl }
                      : require('../assets/avt_default.jpg')
                    : require('../assets/menu.png')
                }
                style={styles.avatar}
                testID="avatar-image"
                accessibilityLabel="avatar-image"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Results */}
        {searchText.length > 0 && (
          <View style={styles.listSearch}>
            {filteredRestaurants.length === 0 ? (
              <Text style={{ padding: 12, color: '#888' }}>
                Không tìm thấy quán nào
              </Text>
            ) : (
              filteredRestaurants.map(item => (
                <TouchableOpacity
                  key={item.restaurantId}
                  style={{
                    padding: 12,
                    borderBottomWidth: 0.5,
                    borderColor: '#eee',
                  }}
                  onPress={async () => {
                    setSearchText('');
                    // Fly to location
                    cameraRef.current?.setCamera({
                      centerCoordinate: [item.longitude, item.latitude],
                      zoomLevel: 15,
                      animationDuration: 1000,
                    });

                    // Get details and navigate
                    const res = await getRestaurantDetail(item.restaurantId);
                    const detail = res.data;
                    stackNav.navigate('ShopDetail', { item: detail });
                  }}
                >
                  <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                  <Text style={{ color: '#666', fontSize: 12 }}>
                    {item.address}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* 📍 Nút định vị lại vị trí hiện tại */}
        {locationPermission && userLocation && (
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            testID="location-button"
            accessibilityLabel="Về vị trí hiện tại"
          >
            <Text style={styles.locationButtonText}>📍</Text>
          </TouchableOpacity>
        )}

        {/* 🌟 Horizontal ScrollView cho recommendations ở góc dưới */}
        {recommendations.length > 0 && (
          <Animated.View
            style={[
              styles.recommendationsBottomContainer,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Swipe handle */}
            <View {...panResponder.panHandlers} style={styles.swipeHandle}>
              <View style={styles.swipeIndicator} />
            </View>

            <View style={styles.recommendationsBottomHeader}>
              <Text style={styles.recommendationsBottomTitle}>
                ⭐ Gợi ý cho bạn {contextLabel ? `(${contextLabel})` : ''}
              </Text>
            </View>

            {recommendLoading ? (
              <ActivityIndicator
                size="small"
                color="#FF5722"
                style={{ paddingVertical: 20 }}
              />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendationsScrollContent}
              >
                {recommendations.map((rec, index) => {
                  // Tìm restaurant từ danh sách recommendedRestaurants
                  const restaurant = recommendedRestaurants.find(
                    r => r.restaurantId === rec.id,
                  );
                  if (!restaurant) {
                    console.log(
                      `⚠️ Chưa load được restaurant với ID: ${rec.id}`,
                    );
                    return null;
                  }

                  return (
                    <TouchableOpacity
                      key={rec.id}
                      style={styles.recommendationCard}
                      onPress={() => {
                        cameraRef.current?.setCamera({
                          centerCoordinate: [
                            restaurant.longitude,
                            restaurant.latitude,
                          ],
                          zoomLevel: 16,
                          animationDuration: 1000,
                        });
                        stackNav.navigate('ShopDetail', {
                          restaurantId: rec.id,
                        });
                      }}
                    >
                      <View style={styles.recommendationCardImageContainer}>
                        <Image
                          source={{ uri: getRestaurantImage(restaurant) }}
                          style={styles.recommendationCardImage}
                          resizeMode="cover"
                        />
                        <View style={styles.rankBadgeSmall}>
                          <Text style={styles.rankTextSmall}>#{rec.rank}</Text>
                        </View>
                      </View>
                      <View style={styles.recommendationCardInfo}>
                        <Text
                          style={styles.recommendationCardName}
                          numberOfLines={1}
                        >
                          {restaurant.name}
                        </Text>
                        <View style={styles.ratingRow}>
                          <Text style={styles.starIcon}>⭐</Text>
                          <Text style={styles.ratingText}>
                            {restaurant.averageRating
                              ? restaurant.averageRating.toFixed(1)
                              : 'N/A'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default MapScreen;
