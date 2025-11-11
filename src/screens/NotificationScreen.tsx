import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
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
  const { notifications, loading } = useNotifications();
  console.log('Notifications:', notifications);

  const handleNotificationPress = (item: Notification) => {
    try {
      // targetUrl có dạng: /restaurants/{restaurantId}/reviews/{reviewId}
      const parts = item.targetUrl.split('/');
      const restaurantId = parts[2];
      console.log('restaurantId:', restaurantId);
      const reviewId = parts[4];
      console.log('reviewId:', reviewId);

      navigation.navigate('ShopDetail', {
        restaurantId,
        reviewId,
        fromNotification: true,
      });
    } catch (error) {
      console.error('Lỗi khi xử lý targetUrl:', error);
    }
  };

  const renderItem: ListRenderItem<Notification> = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, item.isRead && { opacity: 0.6 }]}
      onPress={() => {
        handleNotificationPress(item);
      }}
    >
      {/* Icon thông báo */}
      <Image
        source={require('../assets/avt_notification.png')}
        style={styles.avatar}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header title="Thông báo" showBack={true} />

      {/* Nội dung */}
      <View style={{ marginTop: 50, flex: 1 }}>
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
              <Text style={{ textAlign: 'center', marginTop: 20 }}>
                Không có thông báo nào
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
}
