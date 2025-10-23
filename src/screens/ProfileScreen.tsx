import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from '../styles/ProfileStyles';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState({
    name: 'Thái Viết Quốc Hưng',
    birthDate: new Date(2004, 0, 21),
    phone: '0328563121',
    address: '441 Ông Ích Khiêm',
    email: 'hung054724@gmail.com',
    password: '********',
    confirmPassword: '********',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSavePersonal = () => {
    console.log('Lưu thông tin cá nhân:', profile);
    // TODO: Gọi API cập nhật thông tin cá nhân
  };

  const handleSaveSecurity = () => {
    console.log('Lưu thông tin bảo mật:', profile);
    // TODO: Gọi API cập nhật email/mật khẩu
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Background */}
      <View style={styles.headerBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Image
              source={require('../assets/icon_back.png')}
              style={styles.backArrow}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
        </View>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <Image
          source={require('../assets/avt_default.jpg')}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.editIcon}>
          <Image
            source={require('../assets/icon_pen.png')}
            style={{ width: 20, height: 20, tintColor: '#fff' }}
          />
        </TouchableOpacity>
      </View>

      {/* Name and Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{profile.name}</Text>

        <View style={styles.infoRow}>
          <Image
            source={require('../assets/gps.png')}
            style={{ width: 16, height: 16, tintColor: '#555' }}
          />
          <Text style={styles.infoText}>{profile.address}, Đà Nẵng</Text>
        </View>

        <View style={styles.infoRow}>
          <Image
            source={require('../assets/icon_birthday.png')}
            style={{ width: 16, height: 16, tintColor: '#555' }}
          />
          <Text style={styles.infoText}>
            {profile.birthDate.toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>

      {/* Personal Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

        <Text style={styles.label}>Tên:</Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={text => setProfile({ ...profile, name: text })}
        />

        <Text style={styles.label}>Ngày sinh:</Text>
        <TouchableOpacity
          style={styles.inputRow}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {profile.birthDate.toLocaleDateString('vi-VN')}
          </Text>
          <Image
            source={require('../assets/icon_calendar.png')}
            style={{ width: 20, height: 20, tintColor: '#555' }}
          />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={profile.birthDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setProfile({ ...profile, birthDate: selectedDate });
              }
            }}
          />
        )}

        <Text style={styles.label}>Số điện thoại:</Text>
        <TextInput
          style={styles.input}
          value={profile.phone}
          keyboardType="phone-pad"
          onChangeText={text => setProfile({ ...profile, phone: text })}
        />

        <Text style={styles.label}>Địa chỉ:</Text>
        <TextInput
          style={styles.input}
          value={profile.address}
          onChangeText={text => setProfile({ ...profile, address: text })}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePersonal}
        >
          <Text style={styles.saveText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bảo mật</Text>

        <Text style={styles.label}>Địa chỉ Email:</Text>
        <TextInput
          style={styles.input}
          value={profile.email}
          editable={false}
        />

        <Text style={styles.label}>Mật khẩu:</Text>
        <TextInput
          style={styles.input}
          value={profile.password}
          secureTextEntry
          onChangeText={text => setProfile({ ...profile, password: text })}
        />

        <Text style={styles.label}>Xác nhận mật khẩu:</Text>
        <TextInput
          style={styles.input}
          value={profile.confirmPassword}
          secureTextEntry
          onChangeText={text =>
            setProfile({ ...profile, confirmPassword: text })
          }
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSecurity}
        >
          <Text style={styles.saveText}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
