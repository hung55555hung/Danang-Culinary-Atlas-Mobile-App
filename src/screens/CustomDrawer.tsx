import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRole } from '../utils/auth';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function CustomDrawer(props: any) {
  const navigation = useNavigation<any>();
  const [role, setRole] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<ImageSourcePropType>(
    require('../assets/avt_default.jpg'),
  );

  useFocusEffect(
    useCallback(() => {
      const fetchRole = async () => {
        const userRole = await getRole();
        setRole(userRole);
        const userFullName = await AsyncStorage.getItem('fullName');
        setFullName(userFullName);
        const userEmail = await AsyncStorage.getItem('userEmail');
        setEmail(userEmail);
        const userAvatar = await AsyncStorage.getItem('avatarUrl');
        if (!userAvatar || userAvatar === 'string') {
          setAvatar(require('../assets/avt_default.jpg'));
        } else {
          setAvatar({ uri: userAvatar });
        }
      };
      fetchRole();
    }, []),
  );

  return (
    <View
      style={styles.container}
      testID="drawer-container"
      accessibilityLabel="drawer-container"
    >
      {/* Email */}
      <Text
        style={styles.email}
        testID="drawer-email"
        accessibilityLabel="drawer-email"
      >
        {email}
      </Text>

      {/* Ảnh đại diện + icon bút */}
      <View
        style={styles.avatarContainer}
        testID="drawer-avatar-container"
        accessibilityLabel="drawer-avatar-container"
      >
        <Image
          source={avatar}
          style={styles.avatar}
          testID="drawer-avatar"
          accessibilityLabel="drawer-avatar"
        />
        <TouchableOpacity
          style={styles.editIcon}
          testID="drawer-edit-avatar-btn"
          accessibilityLabel="drawer-edit-avatar-btn"
        >
          <Image
            source={require('../assets/icon_pen.png')}
            style={{ width: 15, height: 15, tintColor: '#fff' }}
            testID="drawer-edit-avatar-icon"
            accessibilityLabel="drawer-edit-avatar-icon"
          />
        </TouchableOpacity>
      </View>

      {/* Lời chào */}
      <Text
        style={styles.greeting}
        testID="drawer-greeting"
        accessibilityLabel="drawer-greeting"
      >
        Xin chào {fullName}!
      </Text>

      {/* Menu */}
      <View
        style={styles.menuContainer}
        testID="drawer-menu-container"
        accessibilityLabel="drawer-menu-container"
      >
        <TouchableOpacity
          style={styles.menuItem}
          testID="drawer-menu-home"
          accessibilityLabel="drawer-menu-home"
        >
          <Image
            source={require('../assets/icon_home.png')}
            style={styles.icon}
            testID="drawer-menu-home-icon"
            accessibilityLabel="drawer-menu-home-icon"
          />
          <Text
            style={styles.menuText}
            testID="drawer-menu-home-text"
            accessibilityLabel="drawer-menu-home-text"
          >
            Trang chủ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => props.navigation.navigate('Profile')}
          testID="drawer-menu-profile"
          accessibilityLabel="drawer-menu-profile"
        >
          <Image
            source={require('../assets/icon_profile.png')}
            style={styles.icon}
            testID="drawer-menu-profile-icon"
            accessibilityLabel="drawer-menu-profile-icon"
          />
          <Text
            style={styles.menuText}
            testID="drawer-menu-profile-text"
            accessibilityLabel="drawer-menu-profile-text"
          >
            Thông tin cá nhân
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => props.navigation.navigate('Notification')}
          testID="drawer-menu-notification"
          accessibilityLabel="drawer-menu-notification"
        >
          <Image
            source={require('../assets/icon_notification.png')}
            style={styles.icon}
            testID="drawer-menu-notification-icon"
            accessibilityLabel="drawer-menu-notification-icon"
          />
          <Text
            style={styles.menuText}
            testID="drawer-menu-notification-text"
            accessibilityLabel="drawer-menu-notification-text"
          >
            Thông báo
          </Text>
        </TouchableOpacity>

        {role === 'vendor' && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => props.navigation.navigate('RegisterShop')}
            testID="drawer-menu-register-shop"
            accessibilityLabel="drawer-menu-register-shop"
          >
            <Image
              source={require('../assets/icon_add_shop.png')}
              style={styles.icon}
              testID="drawer-menu-register-shop-icon"
              accessibilityLabel="drawer-menu-register-shop-icon"
            />
            <Text
              style={styles.menuText}
              testID="drawer-menu-register-shop-text"
              accessibilityLabel="drawer-menu-register-shop-text"
            >
              Đăng kí quán
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Đăng xuất */}
      <TouchableOpacity
        style={[styles.menuItem, styles.logoutItem]}
        onPress={() => {
          AsyncStorage.clear();
          navigation.navigate('Login');
        }}
        testID="drawer-menu-logout"
        accessibilityLabel="drawer-menu-logout"
      >
        <Image
          source={require('../assets/icon_logout.png')}
          style={[styles.icon, { tintColor: '#FF3F5C' }]}
          testID="drawer-menu-logout-icon"
          accessibilityLabel="drawer-menu-logout-icon"
        />
        <Text
          style={[styles.menuText, { color: '#FF3F5C' }]}
          testID="drawer-menu-logout-text"
          accessibilityLabel="drawer-menu-logout-text"
        >
          Đăng xuất
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    alignItems: 'center',
    paddingTop: 60,
  },
  email: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00BCD4',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginVertical: 20,
  },
  menuContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: '#004c6d',
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  logoutItem: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
});
