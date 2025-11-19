import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  useIsFocused,
} from '@react-navigation/native';
import styles from '../styles/VendorDishesStyles';
import { getVendorDishes } from '../api/apiConfig';

const VendorDishesScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { restaurantId } = route.params;
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      const fetchDishes = async () => {
        setLoading(true);
        try {
          const data = await getVendorDishes(restaurantId);
          console.log('Dishes fetched:', data);
          setDishes(data);
        } catch (err) {
          setDishes([]);
        } finally {
          setLoading(false);
        }
      };
      fetchDishes();
    }
  }, [restaurantId, isFocused]);

  const renderDish = ({ item }: { item: any }) => (
    <View style={styles.dishItem}>
      <View style={styles.dishImageBox}>
        <Image
          source={
            item.images && item.images.length > 0
              ? { uri: item.images[0] }
              : require('../assets/food_placeholder.png')
          }
          style={styles.dishImage}
        />
      </View>
      <Text style={styles.dishName}>{item.name}</Text>
      <Text style={styles.dishPrice}>{item.price.toFixed(2)} ₫</Text>
      <Text
        style={[
          styles.dishStatus,
          { color: item.status === 'AVAILABLE' ? '#2ecc40' : '#e74c3c' },
        ]}
      >
        {item.status === 'AVAILABLE' ? 'Đang bán' : 'Ngừng bán'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách món ăn</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddDish', { restaurantId })}
      >
        <Text style={styles.addButtonText}>+ Thêm món ăn</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={item => item.dishId}
          renderItem={renderDish}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
              Chưa có món ăn nào.
            </Text>
          }
        />
      )}
    </View>
  );
};

export default VendorDishesScreen;
