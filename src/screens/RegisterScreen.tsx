import React from 'react';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import styles from '../styles/SigninStyles';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/logo2.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Input Username */}
      <TextInput
        placeholder="Tên đăng nhập"
        style={styles.input}
        placeholderTextColor="#666"
      />

      {/* Input Password */}
      <TextInput
        placeholder="Mật khẩu"
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#666"
      />

      {/* Input Accept Password */}
      <TextInput
        placeholder="Xác nhận mật khẩu"
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#666"
      />

      {/* Button Register */}
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginText}>Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}
