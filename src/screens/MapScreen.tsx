// import React from 'react';
// import {
//   View,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
// } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import styles from '../styles/MapStyles';
// import { useNavigation } from '@react-navigation/native';

// const MapScreen: React.FC = () => {
//   const foodLocations = [
//     { id: 1, lat: 16.0471, lon: 108.2068 },
//     { id: 2, lat: 16.051, lon: 108.213 },
//     { id: 3, lat: 16.058, lon: 108.22 },
//   ];
//   const navigate = useNavigation<any>();

//   return (
//     <View style={styles.container}>
//       {/* Bản đồ */}
//       <MapView
//         style={StyleSheet.absoluteFillObject}
//         initialRegion={{
//           latitude: 16.0471,
//           longitude: 108.2068,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//       >
//         {foodLocations.map(loc => (
//           <Marker
//             key={loc.id}
//             coordinate={{ latitude: loc.lat, longitude: loc.lon }}
//             title="Mì Quảng Bếp Trang"
//             onPress={() => navigate.navigate('ShopDetail')}
//           >
//             <Image
//               source={require('../assets/anh.jpg')}
//               style={styles.markerImage}
//             />
//           </Marker>
//         ))}
//       </MapView>

//       {/* Nút menu */}
//       <TouchableOpacity style={styles.menuButton}>
//         <Image
//           source={require('../assets/menu.png')}
//           style={{ width: 25, height: 25 }}
//         />
//       </TouchableOpacity>

//       {/* Thanh tìm kiếm nổi */}
//       <View style={styles.searchBar}>
//         <Image
//           source={require('../assets/gps.png')}
//           style={{ width: 22, height: 22, marginRight: 8 }}
//         />
//         <TextInput
//           placeholder="Search"
//           placeholderTextColor="#777"
//           style={styles.searchInput}
//         />
//         <Image
//           source={require('../assets/search.png')}
//           style={{ width: 22, height: 22, marginRight: 8 }}
//         />
//       </View>
//     </View>
//   );
// };

// export default MapScreen;

import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import styles from '../styles/MapStyles';

const MapScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const stackNav = useNavigation<any>();

  const foodLocations = [
    { id: 1, lat: 16.0471, lon: 108.2068 },
    { id: 2, lat: 16.051, lon: 108.213 },
    { id: 3, lat: 16.058, lon: 108.22 },
  ];

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 16.0471,
          longitude: 108.2068,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {foodLocations.map(loc => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.lat, longitude: loc.lon }}
            title="Mì Quảng Bếp Trang"
            onPress={() => stackNav.navigate('ShopDetail')}
          >
            <Image
              source={require('../assets/anh.jpg')}
              style={styles.markerImage}
            />
          </Marker>
        ))}
      </MapView>

      {/* Nút menu */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.openDrawer()}
      >
        <Image
          source={require('../assets/menu.png')}
          style={{ width: 25, height: 25 }}
        />
      </TouchableOpacity>

      {/* Thanh tìm kiếm */}
      <View style={styles.searchBar}>
        <Image
          source={require('../assets/gps.png')}
          style={{ width: 22, height: 22, marginRight: 8 }}
        />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#777"
          style={styles.searchInput}
        />
        <Image
          source={require('../assets/search.png')}
          style={{ width: 22, height: 22, marginRight: 8 }}
        />
      </View>
    </View>
  );
};

export default MapScreen;
