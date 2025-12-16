import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import styles from '../styles/ShopDetailStyles';
import { handleImagePreview } from '../utils/imagePreview';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteReview } from '../api/apiConfig';
import { Alert } from 'react-native';
import { formatTimeAgo } from '../utils/time';

interface ReviewItemProps {
  item: {
    reviewId: string;
    reviewerAccountId: string;
    reviewerUsername: string;
    avatar: '../assets/avt_default.jpg';
    time: string;
    rating: number;
    content: string;
    images?: any;
    comment: string;
    vendorReply?: string | null;
    repliedAt?: string | null;
  };
  restaurantId: string;
  onReviewDeleted?: (reviewId: string) => void;
}

export default function ReviewItem({
  item,
  restaurantId,
  onReviewDeleted,
}: ReviewItemProps) {
  const navigation = useNavigation<any>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  useEffect(() => {
    const checkOwner = async () => {
      const accountID = await AsyncStorage.getItem('accountID');
      setIsOwner(item.reviewerAccountId === accountID);
    };
    checkOwner();
  }, [item.reviewerAccountId]);

  const handleDeleteReview = async (reviewId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa đánh giá này không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReview(reviewId);
              if (onReviewDeleted) {
                onReviewDeleted(reviewId);
              }
              Alert.alert('Thành công', 'Đánh giá đã được xóa');
            } catch (error) {
              console.error('Error deleting review:', error);
              Alert.alert('Lỗi', 'Xóa đánh giá thất bại. Vui lòng thử lại.');
            }
          },
        },
      ],
    );
  };

  return (
    <View>
      <View
        style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}
      >
        <Image
          source={require('../assets/avt_default.jpg')}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewerName}>{item.reviewerUsername}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginVertical: 3 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <Image
                key={i}
                source={
                  i < item.rating
                    ? require('../assets/star_filled.png')
                    : require('../assets/star_outline.png')
                }
                style={styles.starSmall}
              />
            ))}
          </View>
        </View>
        {/* Button menu_dot */}
        <TouchableOpacity
          style={{ paddingRight: 8 }}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <Image
            source={require('../assets/menu_dots.png')}
            style={{ width: 22, height: 40, tintColor: '#444' }}
          />
        </TouchableOpacity>
        {/* Popup menu sửa/xóa */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={1}
            onPressOut={() => setMenuVisible(false)}
          >
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                padding: 20,
                minWidth: 200,
                elevation: 5,
              }}
            >
              {isOwner ? (
                <>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 10,
                    }}
                    onPress={() => {
                      setMenuVisible(false);
                      navigation.navigate('EditReview', {
                        reviewId: item.reviewId,
                        restaurantId: restaurantId,
                        currentRating: item.rating,
                        currentComment: item.comment,
                        currentImages: item.images || [],
                      });
                    }}
                  >
                    <Image
                      source={require('../assets/icon_edit.png')}
                      style={{
                        width: 18,
                        height: 18,
                        tintColor: '#1E90FF',
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ fontSize: 16, color: '#1E90FF' }}>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 10,
                    }}
                    onPress={() => {
                      setMenuVisible(false);
                      handleDeleteReview(item.reviewId);
                    }}
                  >
                    <Image
                      source={require('../assets/icon_delete.png')}
                      style={{
                        width: 18,
                        height: 18,
                        tintColor: 'red',
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ fontSize: 16, color: 'red' }}>Xóa</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                  }}
                  onPress={() => {
                    setMenuVisible(false);
                    // TODO: logic báo cáo vi phạm
                  }}
                >
                  <Image
                    source={require('../assets/icon_report.png')}
                    style={{
                      width: 18,
                      height: 18,
                      tintColor: '#e67e22',
                      marginRight: 8,
                    }}
                  />
                  <Text style={{ fontSize: 16, color: '#e67e22' }}>
                    Báo cáo vi phạm
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
      <Text style={styles.reviewText}>{item.comment}</Text>
      {item.images && item.images.length > 0 && (
        <TouchableOpacity
          onPress={() =>
            handleImagePreview(navigation, item.images[0], item.images)
          }
        >
          <Image source={{ uri: item.images[0] }} style={styles.reviewImage} />
        </TouchableOpacity>
      )}

      {/* Vendor Reply */}
      {item.vendorReply && (
        <View
          style={{
            marginLeft: 20,
            marginTop: 5,
            paddingHorizontal: 5,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: '#0C516F',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 14, color: '#fff', fontWeight: 'bold' }}>
                Q
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: '#0C516F',
                  letterSpacing: 0.2,
                }}
              >
                Phản hồi từ chủ quán
              </Text>
              {item.repliedAt && (
                <Text style={{ fontSize: 11, color: '#6c757d', marginTop: 2 }}>
                  {formatTimeAgo(item.repliedAt)}
                </Text>
              )}
            </View>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: '#2c3e50',
              lineHeight: 22,
              paddingLeft: 36,
            }}
          >
            {item.vendorReply}
          </Text>
        </View>
      )}
    </View>
  );
}
