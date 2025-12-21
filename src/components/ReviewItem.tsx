import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import styles from '../styles/ShopDetailStyles';
import { handleImagePreview } from '../utils/imagePreview';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteReview, replyToReview, createReport } from '../api/apiConfig';
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
    createdAt?: string;
  };
  restaurantId: string;
  onReviewDeleted?: (reviewId: string) => void;
  restaurantOwnerAccountId?: string;
  onReplySuccess?: (
    reviewId: string,
    vendorReply: string,
    repliedAt: string,
  ) => void;
  isAuthenticated?: boolean;
}

export default function ReviewItem({
  item,
  restaurantId,
  onReviewDeleted,
  restaurantOwnerAccountId,
  onReplySuccess,
  isAuthenticated = false,
}: ReviewItemProps) {
  const navigation = useNavigation<any>();
  const menuButtonRef = useRef<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [isOwner, setIsOwner] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  const [replyMode, setReplyMode] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  useEffect(() => {
    const checkOwner = async () => {
      const accountID = await AsyncStorage.getItem('accountID');
      console.log('Current accountID:', accountID);
      console.log('Restaurant ownerAccountId:', restaurantOwnerAccountId);
      setIsOwner(item.reviewerAccountId === accountID);
      // Check if current user is the owner/vendor of the restaurant
      if (restaurantOwnerAccountId && accountID === restaurantOwnerAccountId) {
        // console.log('✅ User is the restaurant owner - can reply to reviews');
        setIsVendor(true);
      } else {
        //  console.log('❌ User is NOT the restaurant owner');
        setIsVendor(false);
      }
    };
    checkOwner();
  }, [item.reviewerAccountId, restaurantOwnerAccountId]);

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

  const handleReply = async () => {
    if (!replyText.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung phản hồi');
      return;
    }

    setReplyLoading(true);
    try {
      const response = await replyToReview(item.reviewId, replyText.trim());
      const repliedAt = new Date().toISOString();

      // Update local state immediately
      if (onReplySuccess) {
        onReplySuccess(item.reviewId, replyText.trim(), repliedAt);
      }

      Alert.alert('Thành công', 'Đã gửi phản hồi');
      setReplyMode(false);
      setReplyText('');
    } catch (error) {
      console.error('Error replying to review:', error);
      Alert.alert('Lỗi', 'Gửi phản hồi thất bại. Vui lòng thử lại.');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập lý do báo cáo');
      return;
    }

    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn gửi báo cáo này?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Xác nhận',
        onPress: async () => {
          setReportLoading(true);
          try {
            await createReport({
              reviewId: item.reviewId,
              reason: reportReason,
            });
            Alert.alert('Thành công', 'Đã gửi báo cáo thành công');
            setReportVisible(false);
            setReportReason('');
          } catch (error) {
            console.error('Lỗi khi gửi báo cáo:', error);
            Alert.alert('Lỗi', 'Không thể gửi báo cáo. Vui lòng thử lại');
          } finally {
            setReportLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          marginTop: 10,
          alignItems: 'flex-start',
        }}
      >
        <Image
          source={require('../assets/avt_default.jpg')}
          style={styles.avatar}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <Text style={styles.reviewerName}>{item.reviewerUsername}</Text>
            {item.createdAt && (
              <Text style={{ fontSize: 11, color: '#999', marginLeft: 8 }}>
                • {formatTimeAgo(item.createdAt)}
              </Text>
            )}
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
          ref={menuButtonRef}
          style={{ paddingRight: 8 }}
          onPress={() => {
            if (!isAuthenticated) {
              Alert.alert('Thông báo', 'Bạn chưa đăng nhập');
              return;
            }
            // Measure button position
            menuButtonRef.current?.measure(
              (
                x: number,
                y: number,
                width: number,
                height: number,
                pageX: number,
                pageY: number,
              ) => {
                setMenuPosition({
                  top: pageY,
                  right: 30,
                });
                setMenuVisible(true);
              },
            );
          }}
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
            }}
            activeOpacity={1}
            onPressOut={() => setMenuVisible(false)}
          >
            <View
              style={{
                position: 'absolute',
                top: menuPosition.top,
                right: menuPosition.right,
                backgroundColor: '#fff',
                borderRadius: 10,
                padding: 20,
                minWidth: 200,
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
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
                    setReportVisible(true);
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

      {/* Reply Button for Vendor (only if vendor owns the restaurant and no reply exists) */}
      {isVendor && !item.vendorReply && !replyMode && (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
            marginLeft: 20,
          }}
          onPress={() => setReplyMode(true)}
        >
          <Text style={{ fontSize: 18, color: '#0C516F', marginRight: 6 }}>
            💬
          </Text>
          <Text style={{ fontSize: 14, color: '#0C516F', fontWeight: '500' }}>
            Phản hồi
          </Text>
        </TouchableOpacity>
      )}

      {/* Reply Input Interface */}
      {isVendor && replyMode && (
        <View
          style={{
            marginLeft: 20,
            marginTop: 10,
            padding: 12,
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#dee2e6',
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: '#0C516F',
              marginBottom: 8,
            }}
          >
            Phản hồi của bạn
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ced4da',
              borderRadius: 6,
              padding: 10,
              fontSize: 14,
              minHeight: 80,
              textAlignVertical: 'top',
              backgroundColor: '#fff',
              marginBottom: 10,
            }}
            placeholder="Nhập phản hồi của bạn..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
            editable={!replyLoading}
          />
          <View
            style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}
          >
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 6,
                backgroundColor: '#6c757d',
              }}
              onPress={() => {
                setReplyMode(false);
                setReplyText('');
              }}
              disabled={replyLoading}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 6,
                backgroundColor: '#0C516F',
              }}
              onPress={handleReply}
              disabled={replyLoading}
            >
              {replyLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}
                >
                  Gửi
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
                width: 30,
                height: 30,
                borderRadius: 15,
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
              <Text style={{ fontSize: 14, color: '#6c757d', marginTop: 2 }}>
                {item.vendorReply}
              </Text>
            </View>
          </View>
          {/* <Text
            style={{
              fontSize: 14,
              color: '#2c3e50',
              lineHeight: 22,
              paddingLeft: 36,
            }}
          >
            {item.vendorReply}
          </Text> */}
        </View>
      )}

      {/* Modal Report */}
      <Modal
        visible={reportVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 20,
              width: '85%',
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 15,
                textAlign: 'center',
              }}
            >
              Báo cáo đánh giá
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#666',
                marginBottom: 10,
              }}
            >
              Lý do báo cáo:
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                padding: 12,
                minHeight: 100,
                textAlignVertical: 'top',
                marginBottom: 20,
              }}
              placeholder="Nhập lý do báo cáo..."
              value={reportReason}
              onChangeText={setReportReason}
              multiline
              editable={!reportLoading}
            />
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#ccc',
                  padding: 12,
                  borderRadius: 8,
                  marginRight: 10,
                }}
                onPress={() => {
                  setReportVisible(false);
                  setReportReason('');
                }}
                disabled={reportLoading}
              >
                <Text
                  style={{
                    color: '#333',
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#FF3B30',
                  padding: 12,
                  borderRadius: 8,
                  marginLeft: 10,
                }}
                onPress={handleSubmitReport}
                disabled={reportLoading}
              >
                {reportLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}
                  >
                    Gửi báo cáo
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
