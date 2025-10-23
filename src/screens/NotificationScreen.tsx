import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import styles from '../styles/NotificationStyles';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';

interface Notification {
  id: string;
  name: string;
  action: string;
  time: string;
  avatar?: string;
}

const notifications: Notification[] = [
  {
    id: '1',
    name: 'Thái Viết Quốc Hưng',
    action: 'đã bình luận về quán của bạn: Rất hài lòng ...',
    time: '2 giờ trước',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Đặng Phúc Long',
    action: 'đã đánh giá về quán của bạn: ⭐⭐⭐',
    time: '3 giờ trước',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: 'Trần Vũ Lâm',
    action: 'đã thích quán của bạn',
    time: '2 ngày trước',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '4',
    name: 'Người dùng ẩn danh',
    action: 'đã bình luận về quán của bạn: Rất hài lòng ...',
    time: '2 giờ trước',
    avatar: '',
  },
  {
    id: '5',
    name: 'Thái Viết Quốc Hưng',
    action: 'đã bình luận về quán của bạn: Rất hài lòng ...',
    time: '2 giờ trước',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '6',
    name: 'Đặng Phúc Long',
    action: 'đã đánh giá về quán của bạn: ⭐⭐⭐',
    time: '3 giờ trước',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '7',
    name: 'Trần Vũ Lâm',
    action: 'đã thích quán của bạn',
    time: '2 ngày trước',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '8',
    name: 'Người dùng ẩn danh',
    action: 'đã bình luận về quán của bạn: Rất hài lòng ...',
    time: '2 giờ trước',
    avatar: '',
  },
];

export default function NotificationScreen() {
  const navigate = useNavigation<any>();
  const renderItem: ListRenderItem<Notification> = ({ item }) => (
    <View style={styles.item}>
      <Image
        source={
          item.avatar
            ? { uri: item.avatar }
            : require('../assets/avt_default.jpg')
        }
        style={styles.avatar}
      />
      <View style={styles.textContainer}>
        {/* message */}
        <Text style={styles.message}>
          <Text style={styles.name}>{item.name}</Text> {item.action}
        </Text>
        {/* time */}
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header title="Thông báo" showBack={true} />
      {/* Danh sách thông báo */}
      <View style={{ marginTop: 50, flex: 1 }}>
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
}
