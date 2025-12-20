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
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isFocused = useIsFocused();

  const fetchDishes = async (page: number = 0, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getVendorDishes(restaurantId, page, 10);
      console.log('Dishes fetched:', response);

      if (append) {
        setDishes(prev => [...prev, ...response.content]);
      } else {
        setDishes(response.content);
      }

      // Kiểm tra còn trang nào không
      setHasMore(!response.last);
      setCurrentPage(page);
    } catch (err) {
      if (!append) {
        setDishes([]);
      }
      console.error('Error fetching dishes:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      // Reset về trang đầu khi vào lại màn hình
      setCurrentPage(0);
      setHasMore(true);
      fetchDishes(0, false);
    }
  }, [restaurantId, isFocused]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchDishes(currentPage + 1, true);
    }
  };

  const handleEditDish = (dish: any) => {
    navigation.navigate('EditDish', { dish });
  };

  const handleDeleteDish = async (dish: any) => {};

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
      <Text style={styles.dishName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.dishPrice}>{item.price.toFixed(2)} ₫</Text>
      <Text
        style={[
          styles.dishStatus,
          { color: item.status === 'AVAILABLE' ? '#2ecc40' : '#e74c3c' },
        ]}
      >
        {item.status === 'AVAILABLE' ? 'Đang bán' : 'Ngừng bán'}
      </Text>

      {/* Thêm 2 nút Sửa/Xóa ở dưới mỗi dish */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => handleEditDish(item)}
          style={styles.btnEdit}
        >
          <Text style={styles.btnEditText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteDish(item)}
          style={styles.btnDelete}
        >
          <Text style={styles.btnEditText}>Xóa</Text>
        </TouchableOpacity>
      </View>
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={{ marginVertical: 20 }}
                color="#0C516F"
              />
            ) : null
          }
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
