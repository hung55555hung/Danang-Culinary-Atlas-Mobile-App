import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Mapbox, { Camera, MapView, ShapeSource, LineLayer, MarkerView } from '@rnmapbox/maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import Config from 'react-native-config';

// Khởi tạo Mapbox
Mapbox.setAccessToken(Config.MAPBOX_ACCESS_TOKEN || '');

interface RouteParams {
  destinationName: string;
  destinationCoords: [number, number]; // [longitude, latitude]
}

export default function NavigationScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { destinationName, destinationCoords } = route.params as RouteParams;
  
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [instructions, setInstructions] = useState<string[]>([]);
  const cameraRef = useRef<Camera>(null);

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
          Alert.alert('Quyền bị từ chối', 'Không thể chỉ đường mà không có quyền vị trí');
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
        (position) => {
          const { longitude, latitude } = position.coords;
          console.log('📍 Vị trí hiện tại:', latitude, longitude);
          resolve([longitude, latitude]);
        },
        (error) => {
          console.error('❌ Lỗi lấy vị trí:', error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  // 🔹 Gọi Mapbox Directions API
  const fetchDirections = async (start: [number, number], end: [number, number]) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&steps=true&access_token=${Config.MAPBOX_ACCESS_TOKEN}`;
      
      console.log('🔍 Đang gọi Directions API...');
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
        
        // Tính khoảng cách và thời gian
        const distanceKm = (routeData.distance / 1000).toFixed(1);
        const durationMin = Math.round(routeData.duration / 60);
        setDistance(`${distanceKm} km`);
        setDuration(`${durationMin} phút`);

        // Lấy hướng dẫn từng bước
        const steps = routeData.legs[0].steps.map((step: any) => step.maneuver.instruction);
        setInstructions(steps);

        console.log('✅ Đã lấy đường đi:', distanceKm, 'km,', durationMin, 'phút');
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

  // 🔹 Khởi tạo
  useEffect(() => {
    (async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      try {
        const currentLocation = await getCurrentLocation();
        setUserLocation(currentLocation);
        await fetchDirections(currentLocation, destinationCoords);

        // Di chuyển camera để hiển thị cả 2 điểm
        const bounds = {
          ne: [
            Math.max(currentLocation[0], destinationCoords[0]),
            Math.max(currentLocation[1], destinationCoords[1]),
          ],
          sw: [
            Math.min(currentLocation[0], destinationCoords[0]),
            Math.min(currentLocation[1], destinationCoords[1]),
          ],
        };
        
        cameraRef.current?.fitBounds(
          bounds.ne as [number, number],
          bounds.sw as [number, number],
          [50, 150, 50, 150], // padding
          1000 // animation duration
        );
      } catch (error) {
        console.error('❌ Lỗi khởi tạo:', error);
        Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !userLocation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={{ marginTop: 10, color: '#666' }}>Đang tính đường đi...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Bản đồ */}
      <MapView
        style={{ flex: 1 }}
        styleURL={Mapbox.StyleURL.Street}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
      >
        <Camera
          ref={cameraRef}
          zoomLevel={12}
          centerCoordinate={userLocation}
          animationDuration={0}
        />

        {/* Đường đi */}
        {routeGeoJSON && (
          <ShapeSource id="routeSource" shape={routeGeoJSON}>
            <LineLayer
              id="routeLayer"
              style={{
                lineColor: '#FF5722',
                lineWidth: 5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </ShapeSource>
        )}

        {/* Marker vị trí hiện tại */}
        <MarkerView coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#4285F4',
              borderWidth: 3,
              borderColor: '#fff',
            }}
          />
        </MarkerView>

        {/* Marker điểm đến */}
        <MarkerView coordinate={destinationCoords} anchor={{ x: 0.5, y: 1 }}>
          <View
            style={{
              backgroundColor: '#FF5722',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: '#fff',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
              {destinationName}
            </Text>
          </View>
        </MarkerView>
      </MapView>

      {/* Thông tin đường đi */}
      <View
        style={{
          position: 'absolute',
          top: 40,
          left: 16,
          right: 16,
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 5,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 }}>
            Đến {destinationName}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: '#FF5722', fontWeight: 'bold', fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FF5722' }}>{distance}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Khoảng cách</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FF5722' }}>{duration}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Thời gian</Text>
          </View>
        </View>

        {instructions.length > 0 && (
          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 }}>
              Bước tiếp theo:
            </Text>
            <Text style={{ fontSize: 13, color: '#666' }}>{instructions[0]}</Text>
          </View>
        )}
      </View>

      {/* Nút về vị trí hiện tại */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 40,
          right: 16,
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 5,
        }}
        onPress={async () => {
          try {
            const currentLocation = await getCurrentLocation();
            setUserLocation(currentLocation);
            cameraRef.current?.setCamera({
              centerCoordinate: currentLocation,
              zoomLevel: 14,
              animationDuration: 1000,
            });
          } catch (error) {
            console.error('❌ Lỗi lấy vị trí:', error);
          }
        }}
      >
        <Text style={{ fontSize: 24 }}>📍</Text>
      </TouchableOpacity>
    </View>
  );
}
