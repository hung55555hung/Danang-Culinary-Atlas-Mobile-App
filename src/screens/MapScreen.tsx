import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import styles from '../styles/MapStyles';
import { getRestaurants } from '../api/apiConfig';
import { useFocusEffect } from '@react-navigation/native';
import debounce from 'lodash/debounce';

interface Restaurant {
  restaurantId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  images: {
    photo: string;
  };
}

const MapScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const stackNav = useNavigation<any>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);
  const [mapKey, setMapKey] = useState(0);

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

  // Hàm tính zoomLevel từ region
  const getZoomLevel = (region: any) => {
    const { longitudeDelta } = region;
    return Math.round(Math.log2(360 / longitudeDelta));
  };

  // 🔹 Hàm gọi API khi zoom thay đổi (có debounce)
  const fetchRestaurantsByZoom = useCallback(
    debounce(async (zoomLevel: number) => {
      console.log('🔍 Gọi API với zoomLevel:', zoomLevel);
      try {
        const res = await getRestaurants(zoomLevel);
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
        // ❌ BỎ dòng này: setMapKey(prev => prev + 1);
      } catch (err) {
        console.error('❌ Lỗi khi tải danh sách nhà hàng:', err);
      }
    }, 800),
    [],
  );

  // 🔹 Xử lý khi zoom/di chuyển bản đồ
  const handleRegionChange = useCallback(
    (region: any) => {
      const zoomLevel = getZoomLevel(region);
      if (currentZoom === null) return; // Không gọi API nếu lần đầu
      if (Math.abs(zoomLevel - currentZoom) >= 1) {
        setCurrentZoom(zoomLevel);
        fetchRestaurantsByZoom(zoomLevel);
      }
    },
    [currentZoom, fetchRestaurantsByZoom],
  );

  // 🔹 Gọi API lần đầu khi mở map
  useEffect(() => {
    (async () => {
      try {
        console.log('🚀 Đang tải danh sách nhà hàng ban đầu...');
        const res = await getRestaurants(15);
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
        setCurrentZoom(15);
        setMapKey(prev => prev + 1); // ✅ Chỉ set một lần khi load đầu tiên
      } catch (err) {
        console.error('❌ Lỗi khi tải danh sách ban đầu:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Debug: Log khi restaurants thay đổi
  useEffect(() => {
    console.log('🔄 Restaurants state updated:', restaurants.length);
  }, [restaurants]);

  const handleAvatarPress = () => {
    if (isLoggedIn) {
      navigation.openDrawer();
    } else {
      stackNav.navigate('Login');
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
    <View style={styles.container}>
      <MapView
        key={mapKey}
        testID="MapView"
        accessibilityLabel="MapView"
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 16.05009,
          longitude: 108.22302,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onRegionChangeComplete={handleRegionChange}
      >
        {restaurants.map(item => {
          return (
            <Marker
              testID={`marker-${item.restaurantId}`}
              accessibilityLabel={`marker-${item.restaurantId}`}
              key={item.restaurantId}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              onPress={() => {
                console.log('🏪 Nhà hàng được chọn:', item.name);
                stackNav.navigate('ShopDetail', { item });
              }}
            >
              <Image
                testID={`marker-image-${item.restaurantId}`}
                accessibilityLabel={`marker-image-${item.restaurantId}`}
                source={{ uri: item.images?.photo }}
                style={styles.markerImage}
                onError={e => {
                  console.warn(
                    '❌ Lỗi load ảnh marker:',
                    item.name,
                    e.nativeEvent.error,
                  );
                }}
              />
              <Callout tooltip>
                <View style={styles.callout}>
                  <Image
                    testID={`callout-image-${item.restaurantId}`}
                    accessibilityLabel={`callout-image-${item.restaurantId}`}
                    source={{ uri: item.images?.photo }}
                    style={styles.thumbnail}
                  />
                  <View>
                    <Text
                      testID={`callout-name-${item.restaurantId}`}
                      accessibilityLabel={`callout-name-${item.restaurantId}`}
                      style={styles.name}
                    >
                      {item.name}
                    </Text>
                    <Text
                      testID={`callout-address-${item.restaurantId}`}
                      accessibilityLabel={`callout-address-${item.restaurantId}`}
                      style={styles.address}
                    >
                      {item.address}
                    </Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

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
    </View>
  );
};

export default MapScreen;
