import React, { useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
  Alert,
  Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import styles from '../styles/NotificationStyles';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { useNotifications } from '../hooks/useNotifications';
import { formatTimeAgo } from '../utils/time';

// ---- Interface phù hợp với API backend ----
interface Notification {
  notificationId: number;
  title: string;
  message: string;
  type: string;
  targetUrl: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationScreen() {
  const navigation = useNavigation<any>();
  const {
    notifications,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    markAsRead,
    removeNotification,
  } = useNotifications();

  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());

  const handleNotificationPress = async (item: Notification) => {
    // Đánh dấu đã đọc khi nhấn vào thông báo
    if (!item.isRead) {
      await markAsRead(item.notificationId);
    }

    try {
      // targetUrl có dạng: /vendor/restaurants/{restaurantId}/reviews/{reviewId}
      const parts = item.targetUrl.split('/').filter(p => p); // Loại bỏ phần tử rỗng
      const restaurantIndex = parts.indexOf('restaurants');
      const reviewIndex = parts.indexOf('reviews');

      const restaurantId =
        restaurantIndex !== -1 ? parts[restaurantIndex + 1] : null;
      const reviewId = reviewIndex !== -1 ? parts[reviewIndex + 1] : null;

      console.log('restaurantId:', restaurantId);
      console.log('reviewId:', reviewId);

      if (restaurantId) {
        navigation.navigate('ShopDetail', {
          restaurantId,
          reviewId,
          fromNotification: true,
        });
      }
    } catch (error) {
      console.error('Lỗi khi xử lý targetUrl:', error);
    }
  };

  const handleDelete = (item: Notification) => {
    Alert.alert('Xóa thông báo', 'Bạn có chắc chắn muốn xóa thông báo này?', [
      {
        text: 'Hủy',
        style: 'cancel',
        onPress: () => {
          // Đóng swipeable
          const swipeable = swipeableRefs.current.get(item.notificationId);
          swipeable?.close();
        },
      },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          const success = await removeNotification(item.notificationId);
          if (success) {
            // Thông báo đã được xóa khỏi state trong hook
            const swipeable = swipeableRefs.current.get(item.notificationId);
            swipeable?.close();
          } else {
            Alert.alert('Lỗi', 'Không thể xóa thông báo. Vui lòng thử lại.');
          }
        },
      },
    ]);
  };

  const renderRightActions = (
    item: Notification,
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.deleteAction}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderItem: ListRenderItem<Notification> = ({ item }) => (
    <Swipeable
      ref={ref => {
        if (ref) {
          swipeableRefs.current.set(item.notificationId, ref);
        } else {
          swipeableRefs.current.delete(item.notificationId);
        }
      }}
      renderRightActions={(progress, dragX) =>
        renderRightActions(item, progress, dragX)
      }
      overshootRight={false}
      containerStyle={styles.swipeContainer}
    >
      <TouchableOpacity
        style={[styles.item, item.isRead ? styles.itemRead : styles.itemUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        {/* Icon thông báo */}
        <Image
          source={require('../assets/avt_notification.png')}
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.name}>{item.title}</Text>
            {!item.isRead && <View style={styles.unreadBadge} />}
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.loadMoreContainer}>
        {loadingMore ? (
          <ActivityIndicator
            size="small"
            color="#007AFF"
            style={styles.loadMoreIndicator}
          />
        ) : (
          <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
            <Text style={styles.loadMoreText}>Tải thêm</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header title="Thông báo" showBack={true} />

      {/* Nội dung */}
      <View style={{ marginTop: 20, flex: 1 }}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={item => item.notificationId.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text
                style={{ textAlign: 'center', marginTop: 20, color: '#666' }}
              >
                Không có thông báo nào
              </Text>
            }
            ListFooterComponent={renderFooter}
            onEndReached={() => {
              if (hasMore && !loadingMore) {
                loadMore();
              }
            }}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
    </View>
  );
}
