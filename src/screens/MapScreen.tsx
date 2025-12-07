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
} from 'react-native';
import Mapbox, { MapView, Camera, ShapeSource, SymbolLayer, MarkerView, LocationPuck } from '@rnmapbox/maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import styles from '../styles/MapStyles';
import { getRestaurants, getRestaurantDetail } from '../api/apiConfig';
import { useFocusEffect } from '@react-navigation/native';
import debounce from 'lodash/debounce';
import Geolocation from '@react-native-community/geolocation';

interface Restaurant {
  restaurantId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photo: string;
}

const MapScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const stackNav = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  const cameraRef = useRef<Camera>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentZoom, setCurrentZoom] = useState<number>(12);
  const [searchText, setSearchText] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);

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

        console.log('✅ Nhà hàng hợp lệ:', validRestaurants.length);
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
            message: 'Ứng dụng cần quyền truy cập vị trí để hiển thị vị trí hiện tại và chỉ đường',
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
      (position) => {
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
      (error) => {
        console.error('❌ Lỗi lấy vị trí:', error);
        Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Vui lòng kiểm tra GPS.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
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
      const res = await getRestaurantDetail(restaurantId);
      const detail = res.data;
      console.log('🍽️ Chi tiết nhà hàng:', detail);
      stackNav.navigate('ShopDetail', { item: detail });
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
          onCameraChanged={(state) => {
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
          {restaurants.slice(0, 50).map((restaurant) => (
            <MarkerView
              key={restaurant.restaurantId}
              id={restaurant.restaurantId}
              coordinate={[restaurant.longitude, restaurant.latitude]}
              anchor={{ x: 0.5, y: 1 }}
              allowOverlap
            >
              <TouchableOpacity
                onPress={() => handleMarkerPress({
                  properties: {
                    restaurantId: restaurant.restaurantId,
                    name: restaurant.name,
                  }
                })}
                style={{
                  alignItems: 'center',
                }}
              >
                {/* Ảnh marker tròn */}
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: '#FF5722',
                  backgroundColor: '#FFFFFF',
                }}>
                  <Image
                    source={{ uri: restaurant.photo }}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode="cover"
                  />
                </View>
                {/* Tên nhà hàng */}
                <View style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  marginTop: 2,
                  maxWidth: 120,
                }}>
                  <Text style={{
                    fontSize: 10,
                    fontWeight: '600',
                    color: '#333',
                  }} numberOfLines={1}>
                    {restaurant.name}
                  </Text>
                </View>
              </TouchableOpacity>
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
      </View>
    </KeyboardAvoidingView>
  );
};

export default MapScreen;
