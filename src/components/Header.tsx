import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/HeaderStyles';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  color?: string;
}

export default function Header({ title, showBack = true, color }: HeaderProps) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            source={require('../assets/icon_back.png')}
            style={[
              styles.backArrow,
              color ? { tintColor: color } : { tintColor: '#1F1F1F' },
            ]}
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 30 }} />
      )}
      <Text style={[styles.title, color ? { color } : { color: '#1F1F1F' }]}>
        {title}
      </Text>
      <View style={{ width: 30 }} />
    </View>
  );
}
