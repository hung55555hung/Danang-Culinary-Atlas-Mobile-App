import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/AddShopStyles';
import Header from '../components/Header';
import {
  getVendorRestaurants,
  deleteRestaurant,
  getMyLicenses,
} from '../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UploadLicenseModal from '../components/UploadLicenseModal';

const AddShopScreen = () => {
  const navigation = useNavigation<any>();
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [licenseModalVisible, setLicenseModalVisible] = useState(false);
  const [hasLicense, setHasLicense] = useState(false);
  const [licenseData, setLicenseData] = useState<any>(null);
  const [loadingLicense, setLoadingLicense] = useState(true);

  useEffect(() => {
    const fetchVendorIdAndShops = async () => {
      const id = await AsyncStorage.getItem('accountID');
      if (id) {
        setVendorId(id);
        setLoading(true);
        try {
          const data = await getVendorRestaurants(id);
          console.log('Quán của vendor:', data);
          setShops(data);
        } catch (err) {
          setShops([]);
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchLicenseStatus = async () => {
      setLoadingLicense(true);
      try {
        const licenses = await getMyLicenses();
        console.log('Giấy phép:', licenses);
        if (licenses && licenses.length > 0) {
          setHasLicense(true);
          setLicenseData(licenses[0]);
        } else {
          setHasLicense(false);
          setLicenseData(null);
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin giấy phép:', err);
        setHasLicense(false);
        setLicenseData(null);
      } finally {
        setLoadingLicense(false);
      }
    };

    fetchVendorIdAndShops();
    fetchLicenseStatus();
  }, []);

  // Hàm xóa quán (giả lập, bạn cần gọi API thực tế)
  const handleDeleteShop = async (shop: any) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn xóa quán "${shop.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Xóa quán với ID:', shop.restaurantId);
              await deleteRestaurant(shop.restaurantId);
              setShops(prev =>
                prev.filter((s: any) => s.restaurantId !== shop.restaurantId),
              );
              setModalVisible(false);
              setSelectedShop(null);
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa quán. Vui lòng thử lại!');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const renderShop = ({ item }: { item: any }) => {
    // Lấy URL ảnh đầu tiên từ object images
    let imageUrl = '';
    if (item.images && typeof item.images === 'object') {
      const urls = Object.values(item.images) as string[];
      if (urls.length > 0) {
        imageUrl = urls[0];
      }
    }

    // Xác định màu cho trạng thái duyệt
    let statusColor = '#888';
    let statusText = 'Chờ duyệt';
    if (item.approvalStatus === 'APPROVED') {
      statusColor = '#2ecc40';
      statusText = 'Đã duyệt';
    } else if (item.approvalStatus === 'REJECTED') {
      statusColor = '#e74c3c';
      statusText = 'Từ chối';
    } else if (item.approvalStatus === 'PENDING') {
      statusColor = '#f1c40f';
      statusText = 'Chờ duyệt';
    }

    return (
      <View style={styles.shopItem}>
        {/* Hàng trên cùng: trạng thái + menu_dots */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'absolute',
            top: 8,
            left: 12,
            right: 12,
            zIndex: 2,
          }}
        >
          <Text
            style={{
              color: statusColor,
              fontWeight: 'bold',
              fontSize: 14,
            }}
          >
            {statusText}
          </Text>
          <TouchableOpacity
            style={{ padding: 4 }}
            onPress={() => {
              setSelectedShop(item);
              setModalVisible(true);
            }}
          >
            <Image
              source={require('../assets/menu_dots.png')}
              style={{ width: 22, height: 22, tintColor: '#444' }}
            />
          </TouchableOpacity>
        </View>
        {/* Nội dung còn lại */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('VendorDishes', {
              restaurantId: item.restaurantId,
            })
          }
          style={{ flex: 1 }}
        >
          <Text style={styles.shopName}>{item.name}</Text>
          <View style={styles.shopContentRow}>
            <Image source={{ uri: imageUrl }} style={styles.shopIcon} />
            <Text style={styles.shopAddress}>{item.address}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="Đăng ký quán"
        showBack={true}
        onBack={() => navigation.navigate('Drawer')}
      />

      {/* Danh sách quán đã đăng ký */}
      <Text style={styles.sectionTitle}>Quán đã đăng ký</Text>

      {/* Trạng thái giấy phép */}
      {loadingLicense ? (
        <ActivityIndicator size="small" style={{ marginVertical: 8 }} />
      ) : hasLicense ? (
        <View style={styles.licenseStatusContainer}>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#2ecc40',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 10,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
              ✓
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.licenseStatusText}>Đã gửi giấy phép</Text>
            <Text style={styles.licenseSubText}>
              Trạng thái:{' '}
              {licenseData?.approvalStatus === 'PENDING'
                ? 'Chờ duyệt'
                : licenseData?.approvalStatus === 'APPROVED'
                ? 'Đã duyệt'
                : licenseData?.approvalStatus === 'REJECTED'
                ? 'Từ chối'
                : 'Chưa rõ'}
            </Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addLicenseButton}
          onPress={() => setLicenseModalVisible(true)}
        >
          <Image
            source={require('../assets/add_image.png')}
            style={styles.addLicenseIcon}
          />
          <Text style={styles.addLicenseText}>Thêm giấy phép</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={shops}
          keyExtractor={item =>
            item.restaurantId?.toString() || item.id?.toString()
          }
          renderItem={renderShop}
          style={styles.shopList}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
              Bạn chưa đăng ký quán nào.
            </Text>
          }
        />
      )}

      {/* Modal menu cho từng shop */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
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
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
              }}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('EditShop', {
                  restaurantId: selectedShop?.restaurantId,
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
              onPress={() => handleDeleteShop(selectedShop)}
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
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Upload License */}
      <UploadLicenseModal
        visible={licenseModalVisible}
        onClose={() => {
          setLicenseModalVisible(false);
          // Reload license status sau khi đóng modal
          getMyLicenses()
            .then(licenses => {
              if (licenses && licenses.length > 0) {
                setHasLicense(true);
                setLicenseData(licenses[0]);
              }
            })
            .catch(err => console.error('Lỗi reload license:', err));
        }}
      />

      {/* Button Thêm quán mới */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('RegisterShop')}
      >
        <Text style={styles.addButtonText}>+ Thêm quán mới</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddShopScreen;
