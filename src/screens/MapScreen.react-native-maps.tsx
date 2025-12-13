import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import styles from '../styles/MapStyles';
import { getRestaurants, getRestaurantDetail } from '../api/apiConfig';
import { useFocusEffect } from '@react-navigation/native';
import debounce from 'lodash/debounce';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    [],
  );
  const [visibleRegion, setVisibleRegion] = useState<any>(null);

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
        const res = await getRestaurants(Math.floor(zoomLevel * 0.8));
        console.log('📍 Danh sách nhà hàng:', res.data?.length);
        console.log(res.data);
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
      setVisibleRegion(region);
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
        setCurrentZoom(5);
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

  // Hiển thị loading indicator khi đang tải dữ liệu
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Đang tải bản đồ...</Text>
      </View>
    );
  }

  const isMarkerVisible = (marker: Restaurant, region: any) => {
    if (!region) return true;
    const latMin = region.latitude - region.latitudeDelta / 2;
    const latMax = region.latitude + region.latitudeDelta / 2;
    const lngMin = region.longitude - region.longitudeDelta / 2;
    const lngMax = region.longitude + region.longitudeDelta / 2;
    return (
      marker.latitude >= latMin &&
      marker.latitude <= latMax &&
      marker.longitude >= lngMin &&
      marker.longitude <= lngMax
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
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
        {restaurants
          .filter(item => isMarkerVisible(item, visibleRegion))
          .slice(0, 20) // 👈 Giới hạn tối đa 50 marker
          .map(item => {
            return (
              <Marker
                testID={`marker-${item.restaurantId}`}
                accessibilityLabel={`marker-${item.restaurantId}`}
                key={item.restaurantId}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                onPress={async () => {
                  console.log('🏪 Nhà hàng được chọn:', item.name);
                  const res = await getRestaurantDetail(item.restaurantId);
                  const detail = res.data;
                  console.log('🍽️ Chi tiết nhà hàng:', detail);
                  stackNav.navigate('ShopDetail', { item: detail });
                }}
                anchor={{ x: 0.5, y: 1 }}
              >
                {/* Label tên quán và địa chỉ */}
                <View style={styles.labelContainer}>
                  <Text style={styles.labelName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {/* <Text style={styles.labelAddress} numberOfLines={1}>
                  {item.address}
                </Text> */}
                </View>
                <Image
                  testID={`marker-image-${item.restaurantId}`}
                  accessibilityLabel={`marker-image-${item.restaurantId}`}
                  source={{ uri: item.photo }}
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
                      source={{ uri: item.photo }}
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
      </View>
    </KeyboardAvoidingView>
  );
};

export default MapScreen;
