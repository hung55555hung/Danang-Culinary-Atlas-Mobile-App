import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from '../styles/LoginStyles';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      {/* Nút Tạo tài khoản */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Tạo tài khoản</Text>
      </TouchableOpacity>

      {/* Nút Đăng nhập */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>

      {/* Nút Google */}
      <TouchableOpacity style={styles.googleButton}>
        <Image
          source={require('../assets/icon_gg.png')}
          style={styles.googleIcon}
        />
        <Text style={styles.googleText}>Tiếp tục với Google</Text>
      </TouchableOpacity>
    </View>
  );
}
