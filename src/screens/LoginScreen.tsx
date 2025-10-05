import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from '../styles/LoginStyles';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const navigate = useNavigation<any>();
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../assets/logo2.png')} style={styles.logo} />

      {/* Nút Tạo tài khoản */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigate.navigate('Register')}
      >
        <Text style={styles.buttonText}>Tạo tài khoản</Text>
      </TouchableOpacity>

      {/* Nút Đăng nhập */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigate.navigate('Signin')}
      >
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
