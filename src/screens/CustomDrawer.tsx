import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';

export default function CustomDrawer(props: any) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
      <View style={styles.profile}>
        <Image
          source={require('../assets/avt_default.jpg')}
          style={styles.avatar}
        />
        <Text style={styles.name}>Thái Viết Quốc Hưng</Text>
        <Text style={styles.email}>hung55555hung@gmail.com</Text>
        <Text style={styles.dob}>21/01/2004</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.text}>Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => props.navigation.navigate('Profile')}
        >
          <Text style={styles.text}>Thông tin cá nhân</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => props.navigation.navigate('Notification')}
        >
          <Text style={styles.text}>Thông báo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => props.navigation.navigate('RegisterShop')}
        >
          <Text style={styles.text}>Đăng kí quán</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.item, { marginTop: 20 }]}
          onPress={() => props.navigation.navigate('Login')}
        >
          <Text style={[styles.text, { color: 'red' }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6ec5cf',
  },
  profile: {
    padding: 20,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  email: { color: '#777' },
  dob: { color: '#777' },
  menu: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    paddingVertical: 15,
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});
