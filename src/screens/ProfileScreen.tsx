import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/ProfileStyles';
import { useProfile } from '../hooks/useProfile';
import { useImagePicker } from '../hooks/useImagePicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleImagePreview } from '../utils/imagePreview';
import { updateUserProfile } from '../api/apiConfig'; // thêm

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { loading, profile, setProfile, savePersonalInfo, saveSecurityInfo } =
    useProfile();
  const [showDatePicker, setShowDatePicker] = useState(false);
  console.log('Profile trong ProfileScreen:', profile.avatarUrl);

  // dùng single + lấy localImages để preview, và uploadSingleImage khi lưu
  const {
    localImages,
    handleAddPhoto,
    uploadSingleImage,
    setInitialImage,
    uploading,
  } = useImagePicker('single');

  // đồng bộ ảnh hiện tại từ profile vào preview ban đầu
  useEffect(() => {
    const avatarUri =
      typeof profile.avatarUrl === 'string'
        ? profile.avatarUrl
        : profile.avatarUrl?.uri; // ✅ Lấy uri từ object

    if (avatarUri) {
      setInitialImage(avatarUri);
    }
  }, [profile.avatarUrl]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  const onChangeAvatar = () => {
    handleAddPhoto();
  };

  // Lưu thông tin + cập nhật avatar nếu cần
  const onSavePersonal = async () => {
    try {
      let avatarUrl = profile.avatarUrl as string | undefined;

      // Ưu tiên ảnh mới chọn
      const selected = localImages[0];
      if (selected) {
        if (selected.startsWith('http')) {
          avatarUrl = selected;
        } else if (
          selected.startsWith('file://') ||
          selected.startsWith('content://')
        ) {
          avatarUrl = await uploadSingleImage();
        }
      }

      const payload = {
        fullName: profile.name,
        avatarUrl: avatarUrl || undefined,
        dob: profile.dob ? profile.dob.toISOString().split('T')[0] : null,
        phone: profile.phone,
        gender: profile.gender,
      };

      await updateUserProfile(payload);

      if (avatarUrl) {
        setProfile(prev => ({ ...prev, avatarUrl })); // luôn lưu string
        await AsyncStorage.setItem('avatarUrl', avatarUrl);
      }

      Alert.alert('✅ Thành công', 'Cập nhật thông tin cá nhân thành công!');
    } catch (e) {
      console.error(e);
      Alert.alert('❌ Lỗi', 'Không thể cập nhật thông tin.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      testID="profile-scroll-view"
      accessibilityLabel="profile-scroll-view"
    >
      {/* Header Background */}
      <View
        style={styles.headerBackground}
        testID="profile-header-bg"
        accessibilityLabel="profile-header-bg"
      >
        <View
          style={styles.header}
          testID="profile-header"
          accessibilityLabel="profile-header"
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            testID="profile-back-button"
            accessibilityLabel="profile-back-button"
          >
            <Image
              source={require('../assets/icon_back.png')}
              style={styles.backArrow}
              testID="profile-back-icon"
              accessibilityLabel="profile-back-icon"
            />
          </TouchableOpacity>
          <Text
            style={styles.headerTitle}
            testID="profile-header-title"
            accessibilityLabel="profile-header-title"
          >
            Hồ sơ cá nhân
          </Text>
        </View>
      </View>

      {/* Avatar Section */}
      <View
        style={styles.avatarContainer}
        testID="profile-avatar-container"
        accessibilityLabel="profile-avatar-container"
      >
        <TouchableOpacity
          onPress={() => {
            const uri =
              localImages[0] ||
              (typeof profile.avatarUrl === 'string' ? profile.avatarUrl : '');
            if (uri) handleImagePreview(navigation, uri, [uri]);
          }}
          testID="profile-avatar-image"
          accessibilityLabel="profile-avatar-image"
        >
          <Image
            source={
              localImages[0]
                ? { uri: localImages[0] }
                : typeof profile.avatarUrl === 'string' && profile.avatarUrl
                ? { uri: profile.avatarUrl }
                : profile.avatarUrl?.uri // ✅ Thêm fallback cho object
                ? { uri: profile.avatarUrl.uri }
                : require('../assets/avt_default.jpg')
            }
            style={styles.avatar}
            testID="profile-avatar-img"
            accessibilityLabel="profile-avatar-img"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editIcon}
          onPress={onChangeAvatar}
          testID="profile-edit-avatar-button"
          accessibilityLabel="profile-edit-avatar-button"
        >
          <Image
            source={require('../assets/icon_pen.png')}
            style={{ width: 20, height: 20, tintColor: '#fff' }}
            testID="profile-edit-icon"
            accessibilityLabel="profile-edit-icon"
          />
        </TouchableOpacity>
      </View>

      {/* Name and Info */}
      <View
        style={styles.infoContainer}
        testID="profile-info-container"
        accessibilityLabel="profile-info-container"
      >
        <Text
          style={styles.name}
          testID="profile-name-display"
          accessibilityLabel="profile-name-display"
        >
          {profile.name}
        </Text>
        <View
          style={styles.infoRow}
          testID="profile-phone-row"
          accessibilityLabel="profile-phone-row"
        >
          <Image
            source={require('../assets/icon_phone.png')}
            style={{ width: 16, height: 16, tintColor: '#555' }}
          />
          <Text
            style={styles.infoText}
            testID="profile-phone-display"
            accessibilityLabel="profile-phone-display"
          >
            {profile.phone}
          </Text>
        </View>
        <View
          style={styles.infoRow}
          testID="profile-dob-row"
          accessibilityLabel="profile-dob-row"
        >
          <Image
            source={require('../assets/icon_birthday.png')}
            style={{ width: 16, height: 16, tintColor: '#555' }}
          />
          <Text
            style={styles.infoText}
            testID="profile-dob-display"
            accessibilityLabel="profile-dob-display"
          >
            {profile.dob ? profile.dob.toLocaleDateString('vi-VN') : '--/--/--'}
          </Text>
        </View>
      </View>

      {/* Personal Info */}
      <View
        style={styles.section}
        testID="profile-personal-section"
        accessibilityLabel="profile-personal-section"
      >
        <Text
          style={styles.sectionTitle}
          testID="profile-personal-title"
          accessibilityLabel="profile-personal-title"
        >
          Thông tin cá nhân
        </Text>

        <Text
          style={styles.label}
          testID="profile-name-label"
          accessibilityLabel="profile-name-label"
        >
          Tên:
        </Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={text => setProfile({ ...profile, name: text })}
          testID="profile-name-input"
          accessibilityLabel="profile-name-input"
          placeholder="Nhập tên"
        />

        <Text
          style={styles.label}
          testID="profile-dob-label"
          accessibilityLabel="profile-dob-label"
        >
          Ngày sinh:
        </Text>
        <TouchableOpacity
          style={styles.inputRow}
          onPress={() => setShowDatePicker(true)}
          testID="profile-dob-button"
          accessibilityLabel="profile-dob-button"
        >
          <Text
            style={styles.dateText}
            testID="profile-dob-text"
            accessibilityLabel="profile-dob-text"
          >
            {profile.dob ? profile.dob.toLocaleDateString('vi-VN') : '--/--/--'}
          </Text>
          <Image
            source={require('../assets/icon_calendar.png')}
            style={{ width: 20, height: 20, tintColor: '#555' }}
          />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={profile.dob ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setProfile({ ...profile, dob: selectedDate });
            }}
          />
        )}

        <Text
          style={styles.label}
          testID="profile-phone-label"
          accessibilityLabel="profile-phone-label"
        >
          Số điện thoại:
        </Text>
        <TextInput
          style={styles.input}
          value={profile.phone}
          keyboardType="phone-pad"
          onChangeText={text => setProfile({ ...profile, phone: text })}
          testID="profile-phone-input"
          accessibilityLabel="profile-phone-input"
          placeholder="Nhập số điện thoại"
        />

        <Text
          style={styles.label}
          testID="profile-gender-label"
          accessibilityLabel="profile-gender-label"
        >
          Giới tính:
        </Text>
        <RadioButton.Group
          onValueChange={value => setProfile({ ...profile, gender: value })}
          value={profile.gender}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RadioButton value="MALE" testID="profile-gender-male" />
            <Text style={{ marginRight: 20 }}>Nam</Text>
            <RadioButton value="FEMALE" testID="profile-gender-female" />
            <Text>Nữ</Text>
          </View>
        </RadioButton.Group>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={onSavePersonal}
          disabled={uploading}
          testID="profile-save-personal-button"
          accessibilityLabel="profile-save-personal-button"
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Security Section giữ nguyên */}
      <View
        style={styles.section}
        testID="profile-security-section"
        accessibilityLabel="profile-security-section"
      >
        <Text
          style={styles.sectionTitle}
          testID="profile-security-title"
          accessibilityLabel="profile-security-title"
        >
          Bảo mật
        </Text>

        <Text
          style={styles.label}
          testID="profile-email-label"
          accessibilityLabel="profile-email-label"
        >
          Địa chỉ Email:
        </Text>
        <TextInput
          style={styles.input}
          value={profile.email}
          editable={false}
          testID="profile-email-input"
          accessibilityLabel="profile-email-input"
        />

        <Text
          style={styles.label}
          testID="profile-password-label"
          accessibilityLabel="profile-password-label"
        >
          Mật khẩu:
        </Text>
        <TextInput
          style={styles.input}
          value={profile.password}
          secureTextEntry
          onChangeText={text => setProfile({ ...profile, password: text })}
          testID="profile-password-input"
          accessibilityLabel="profile-password-input"
          placeholder="Nhập mật khẩu"
        />

        <Text
          style={styles.label}
          testID="profile-confirm-password-label"
          accessibilityLabel="profile-confirm-password-label"
        >
          Xác nhận mật khẩu:
        </Text>
        <TextInput
          style={styles.input}
          value={profile.confirmPassword}
          secureTextEntry
          onChangeText={text =>
            setProfile({ ...profile, confirmPassword: text })
          }
          testID="profile-confirm-password-input"
          accessibilityLabel="profile-confirm-password-input"
          placeholder="Xác nhận mật khẩu"
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSecurityInfo}
          testID="profile-save-security-button"
          accessibilityLabel="profile-save-security-button"
        >
          <Text
            style={styles.saveText}
            testID="profile-save-security-text"
            accessibilityLabel="profile-save-security-text"
          >
            Lưu
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
