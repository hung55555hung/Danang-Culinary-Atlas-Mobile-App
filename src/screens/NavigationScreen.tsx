import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import Mapbox, {
  Camera,
  MapView,
  ShapeSource,
  LineLayer,
  MarkerView,
  LocationPuck,
} from '@rnmapbox/maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';

// Khởi tạo Mapbox - HARDCODED TOKEN
Mapbox.setAccessToken(
  'pk.eyJ1IjoiaHVuZzA1NDcyNCIsImEiOiJjbWl5bHk3eWIwaHJoM2dweXBxMGcwMm10In0.gXxq4YOgffAD8vV7y6nSxA',
);

type TravelMode = 'driving' | 'walking' | 'cycling';
type MapStyle = 'streets' | 'satellite' | 'outdoors';

interface RouteParams {
  destinationName: string;
  destinationCoords: [number, number]; // [longitude, latitude]
}

export default function NavigationScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { destinationName, destinationCoords } = route.params as RouteParams;

  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [instructions, setInstructions] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');
  const [mapStyle, setMapStyle] = useState<MapStyle>('streets');
  const [isTracking, setIsTracking] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [remainingDistance, setRemainingDistance] = useState<string>('');
  const [eta, setEta] = useState<string>('');
  const cameraRef = useRef<Camera>(null);
  const watchId = useRef<number | null>(null);
  const panelHeight = Platform.OS === 'ios' ? 350 : 320;
  const slideAnim = useRef(new Animated.Value(panelHeight)).current;

  // 🔹 Xin quyền vị trí
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Quyền truy cập vị trí',
            message: 'Ứng dụng cần quyền truy cập vị trí để chỉ đường',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Quyền bị từ chối',
            'Không thể chỉ đường mà không có quyền vị trí',
          );
          navigation.goBack();
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error('❌ Lỗi xin quyền vị trí:', err);
      return false;
    }
  };

  // 🔹 Lấy vị trí hiện tại
  const getCurrentLocation = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const { longitude, latitude } = position.coords;
          console.log('📍 Vị trí hiện tại:', latitude, longitude);
          resolve([longitude, latitude]);
        },
        error => {
          console.error('❌ Lỗi lấy vị trí:', error);
          // Fallback: Sử dụng vị trí mặc định (Hà Nội)
          const defaultLocation: [number, number] = [105.8342, 21.0278];
          console.log('⚠️ Sử dụng vị trí mặc định');
          resolve(defaultLocation); // Resolve với default thay vì reject
        },
        {
          enableHighAccuracy: false, // Giảm độ chính xác để nhanh hơn
          timeout: 30000, // Tăng timeout lên 30s
          maximumAge: 30000, // Chấp nhận cache 30s
        },
      );
    });
  };

  // 🔹 Gọi Mapbox Directions API với traffic-aware
  const fetchDirections = async (
    start: [number, number],
    end: [number, number],
    mode: TravelMode = travelMode,
  ) => {
    try {
      // Mapbox profile mapping
      const profileMap = {
        driving: 'driving-traffic', // Traffic-aware cho xe
        walking: 'walking',
        cycling: 'cycling',
      };

      const profile = profileMap[mode];
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&steps=true&banner_instructions=true&voice_instructions=true&annotations=distance,duration,speed,congestion&overview=full&language=vi&access_token=pk.eyJ1IjoiaHVuZzA1NDcyNCIsImEiOiJjbWl5bHk3eWIwaHJoM2dweXBxMGcwMm10In0.gXxq4YOgffAD8vV7y6nSxA`;

      console.log('🔍 Đang gọi Directions API với chế độ:', mode);
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const routeData = data.routes[0];

        // Tạo GeoJSON cho LineLayer
        const geoJSON = {
          type: 'Feature',
          properties: {},
          geometry: routeData.geometry,
        };

        setRouteGeoJSON(geoJSON);

        // Tính khoảng cách và thời gian với traffic
        const distanceKm = (routeData.distance / 1000).toFixed(1);
        const durationMin = Math.round(routeData.duration / 60);
        setDistance(`${distanceKm} km`);
        setDuration(`${durationMin} phút`);
        setRemainingDistance(`${distanceKm} km`);

        // Tính ETA (giờ đến)
        const now = new Date();
        const arrivalTime = new Date(now.getTime() + routeData.duration * 1000);
        setEta(
          arrivalTime.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        );

        // Lấy hướng dẫn từng bước với chi tiết
        const steps = routeData.legs[0].steps.map((step: any) => ({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration,
        }));
        setInstructions(steps.map((s: any) => s.instruction));

        console.log(
          '✅ Đã lấy đường đi:',
          distanceKm,
          'km,',
          durationMin,
          'phút',
        );
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy đường đi');
      }
    } catch (error) {
      console.error('❌ Lỗi khi gọi Directions API:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin đường đi');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Theo dõi vị trí realtime
  const startTracking = () => {
    if (watchId.current) return;

    setIsTracking(true);
    watchId.current = Geolocation.watchPosition(
      position => {
        const { longitude, latitude } = position.coords;
        const newLocation: [number, number] = [longitude, latitude];
        setUserLocation(newLocation);

        // Tự động cập nhật camera theo vị trí
        cameraRef.current?.setCamera({
          centerCoordinate: newLocation,
          zoomLevel: 16,
          pitch: 60, // Góc nghiêng 3D
          animationDuration: 500,
        });

        // Tính lại khoảng cách còn lại
        calculateRemainingDistance(newLocation, destinationCoords);
      },
      error => console.error('❌ Lỗi tracking:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Cập nhật mỗi 10m
        interval: 3000, // Cập nhật mỗi 3s
      },
    );
  };

  const stopTracking = () => {
    if (watchId.current) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setIsTracking(false);
    }
  };

  // 🔹 Tính khoảng cách còn lại (Haversine formula)
  const calculateRemainingDistance = (
    from: [number, number],
    to: [number, number],
  ) => {
    const R = 6371; // Bán kính trái đất (km)
    const lat1 = (from[1] * Math.PI) / 180;
    const lat2 = (to[1] * Math.PI) / 180;
    const deltaLat = ((to[1] - from[1]) * Math.PI) / 180;
    const deltaLon = ((to[0] - from[0]) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    setRemainingDistance(`${distance.toFixed(1)} km`);

    // Kiểm tra đã đến đích chưa (trong vòng 50m)
    if (distance < 0.05) {
      Alert.alert('🎉 Đã đến nơi!', `Bạn đã đến ${destinationName}`);
      stopTracking();
    }
  };

  // 🔹 Chuyển đổi map style
  const getMapStyleURL = () => {
    switch (mapStyle) {
      case 'satellite':
        return Mapbox.StyleURL.Satellite;
      case 'outdoors':
        return Mapbox.StyleURL.Outdoors;
      default:
        return Mapbox.StyleURL.Street;
    }
  };

  // 🔹 Animation cho instructions panel
  const toggleInstructions = () => {
    const toValue = showInstructions ? panelHeight : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowInstructions(!showInstructions);
  };

  // 🔹 Khởi tạo
  useEffect(() => {
    (async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      try {
        const currentLocation = await getCurrentLocation();
        setUserLocation(currentLocation);
        await fetchDirections(currentLocation, destinationCoords, travelMode);

        // Di chuyển camera để hiển thị cả 2 điểm với góc 3D
        const bounds = {
          ne: [
            Math.max(currentLocation[0], destinationCoords[0]) + 0.01,
            Math.max(currentLocation[1], destinationCoords[1]) + 0.01,
          ],
          sw: [
            Math.min(currentLocation[0], destinationCoords[0]) - 0.01,
            Math.min(currentLocation[1], destinationCoords[1]) - 0.01,
          ],
        };

        setTimeout(() => {
          cameraRef.current?.fitBounds(
            bounds.ne as [number, number],
            bounds.sw as [number, number],
            [50, 200, 50, 100], // padding
            1500, // animation duration
          );
        }, 500);
      } catch (error) {
        console.error('❌ Lỗi khởi tạo:', error);
        Alert.alert(
          'Không lấy được vị trí',
          'Sử dụng vị trí mặc định. Vui lòng bật GPS và thử lại.',
        );
        setLoading(false);
      }
    })();

    return () => {
      stopTracking(); // Cleanup khi unmount
    };
  }, []);

  // 🔹 Re-fetch khi đổi chế độ di chuyển
  useEffect(() => {
    if (userLocation) {
      setLoading(true);
      fetchDirections(userLocation, destinationCoords, travelMode);
    }
  }, [travelMode]);

  if (loading || !userLocation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={{ marginTop: 10, color: '#666' }}>
          Đang tính đường đi...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Bản đồ với góc 3D */}
      <MapView
        style={{ flex: 1 }}
        styleURL={getMapStyleURL()}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        compassEnabled={true}
        compassViewPosition={3}
      >
        <Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={userLocation || [108.22302, 16.05009]}
          pitch={isTracking ? 60 : 30}
          animationDuration={500}
        />

        {/* Đường đi với hiệu ứng */}
        {routeGeoJSON && (
          <>
            <ShapeSource id="routeShadowSource" shape={routeGeoJSON}>
              <LineLayer
                id="routeShadowLayer"
                style={{
                  lineColor: 'rgba(0,0,0,0.3)',
                  lineWidth: 10,
                  lineCap: 'round',
                  lineJoin: 'round',
                  lineBlur: 3,
                }}
              />
            </ShapeSource>
            <ShapeSource id="routeSource" shape={routeGeoJSON}>
              <LineLayer
                id="routeLayer"
                style={{
                  lineColor:
                    travelMode === 'walking'
                      ? '#4CAF50'
                      : travelMode === 'cycling'
                      ? '#2196F3'
                      : '#FF5722',
                  lineWidth: 7,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </ShapeSource>
          </>
        )}

        {/* LocationPuck cho vị trí hiện tại */}
        {userLocation && (
          <LocationPuck
            puckBearingEnabled
            puckBearing="heading"
            pulsing={{
              isEnabled: true,
              color: '#4285F4',
              radius: isTracking ? 100 : 50,
            }}
          />
        )}

        {/* Marker điểm đến */}
        <MarkerView coordinate={destinationCoords} anchor={{ x: 0.5, y: 1 }}>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: 20,
                borderRightWidth: 20,
                borderTopWidth: 35,
                borderStyle: 'solid',
                backgroundColor: 'transparent',
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: '#FF5722',
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: 5,
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16 }}>📍</Text>
            </View>
            <View
              style={{
                backgroundColor: 'rgba(255, 87, 34, 0.95)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                marginTop: -5,
                shadowColor: '#000',
                shadowOpacity: 0.3,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>
                {destinationName}
              </Text>
            </View>
          </View>
        </MarkerView>
      </MapView>

      {/* Header - Thông tin chính */}
      <View
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 50 : 40,
          left: 12,
          right: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 16,
          padding: 16,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
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
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>
              Đang đi đến
            </Text>
            <Text
              style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}
              numberOfLines={1}
            >
              {destinationName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              stopTracking();
              navigation.goBack();
            }}
            style={{ padding: 4 }}
          >
            <Text
              style={{ color: '#FF5722', fontWeight: 'bold', fontSize: 22 }}
            >
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
              backgroundColor: '#f5f5f5',
              borderRadius: 10,
              marginRight: 8,
            }}
          >
            <Text
              style={{ fontSize: 22, fontWeight: 'bold', color: '#FF5722' }}
            >
              {isTracking ? remainingDistance : distance}
            </Text>
            <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
              Còn lại
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
              backgroundColor: '#f5f5f5',
              borderRadius: 10,
              marginRight: 8,
            }}
          >
            <Text
              style={{ fontSize: 22, fontWeight: 'bold', color: '#4CAF50' }}
            >
              {duration}
            </Text>
            <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
              Thời gian
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
              backgroundColor: '#f5f5f5',
              borderRadius: 10,
            }}
          >
            <Text
              style={{ fontSize: 22, fontWeight: 'bold', color: '#2196F3' }}
            >
              {eta}
            </Text>
            <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
              ETA
            </Text>
          </View>
        </View>

        {instructions.length > 0 && (
          <TouchableOpacity
            onPress={toggleInstructions}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: '#E3F2FD',
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 10,
                  color: '#1976D2',
                  fontWeight: '600',
                  marginBottom: 2,
                }}
              >
                Tiếp theo:
              </Text>
              <Text
                style={{ fontSize: 12, color: '#333', fontWeight: '500' }}
                numberOfLines={2}
              >
                {instructions[currentStepIndex]}
              </Text>
            </View>
            <Text style={{ fontSize: 18, marginLeft: 8, color: '#1976D2' }}>
              {showInstructions ? '▼' : '▲'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Instructions Panel */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: panelHeight,
          backgroundColor: '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 10,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Drag Handle */}
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#ddd',
            }}
          />
        </View>

        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderColor: '#eee',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>
            Hướng dẫn chi tiết
          </Text>
          <TouchableOpacity
            onPress={toggleInstructions}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ fontSize: 20, color: '#666' }}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {instructions.map((instruction, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                marginBottom: 12,
                paddingBottom: 12,
                borderBottomWidth: index < instructions.length - 1 ? 1 : 0,
                borderColor: '#f0f0f0',
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor:
                    index === currentStepIndex ? '#2196F3' : '#e0e0e0',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 10,
                  marginTop: 2,
                }}
              >
                <Text
                  style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}
                >
                  {index + 1}
                </Text>
              </View>
              <Text
                style={{ flex: 1, fontSize: 13, color: '#333', lineHeight: 18 }}
              >
                {instruction}
              </Text>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Bottom Control Panel */}
      <View
        style={{
          position: 'absolute',
          bottom: 30,
          left: 12,
          right: 12,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: 16,
          padding: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Travel Mode Selector */}
        <View style={{ flexDirection: 'row', gap: 6, flexShrink: 0 }}>
          <TouchableOpacity
            onPress={() => setTravelMode('driving')}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 12,
              backgroundColor:
                travelMode === 'driving' ? '#FF5722' : 'rgba(255,255,255,0.2)',
            }}
          >
            <Text style={{ fontSize: 20 }}>🚗</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTravelMode('cycling')}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 12,
              backgroundColor:
                travelMode === 'cycling' ? '#2196F3' : 'rgba(255,255,255,0.2)',
            }}
          >
            <Text style={{ fontSize: 20 }}>🏍️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTravelMode('walking')}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 12,
              backgroundColor:
                travelMode === 'walking' ? '#4CAF50' : 'rgba(255,255,255,0.2)',
            }}
          >
            <Text style={{ fontSize: 20 }}>🚶</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View
          style={{
            width: 1,
            height: 30,
            backgroundColor: 'rgba(255,255,255,0.3)',
            marginHorizontal: 4,
          }}
        />

        {/* Right Controls */}
        <View style={{ flexDirection: 'row', gap: 6, flexShrink: 0 }}>
          {/* Map Style Selector */}
          <TouchableOpacity
            onPress={() => {
              const styles: MapStyle[] = ['streets', 'satellite', 'outdoors'];
              const currentIndex = styles.indexOf(mapStyle);
              const nextIndex = (currentIndex + 1) % styles.length;
              setMapStyle(styles[nextIndex]);
            }}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Text style={{ fontSize: 20 }}>
              {mapStyle === 'satellite'
                ? '🛰️'
                : mapStyle === 'outdoors'
                ? '🗺️'
                : '📍'}
            </Text>
          </TouchableOpacity>

          {/* Tracking Toggle */}
          <TouchableOpacity
            onPress={() => {
              if (isTracking) {
                stopTracking();
              } else {
                startTracking();
              }
            }}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 12,
              backgroundColor: isTracking ? '#4CAF50' : 'rgba(255,255,255,0.2)',
            }}
          >
            <Text style={{ fontSize: 20 }}>{isTracking ? '⏸️' : '▶️'}</Text>
          </TouchableOpacity>

          {/* Recenter Button */}
          <TouchableOpacity
            onPress={async () => {
              try {
                const currentLocation = await getCurrentLocation();
                setUserLocation(currentLocation);
                cameraRef.current?.setCamera({
                  centerCoordinate: currentLocation,
                  zoomLevel: 16,
                  pitch: isTracking ? 60 : 30,
                  animationDuration: 1000,
                });
              } catch (error) {
                console.error('❌ Lỗi lấy vị trí:', error);
              }
            }}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Text style={{ fontSize: 20 }}>🎯</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
