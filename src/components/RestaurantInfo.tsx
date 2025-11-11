import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAddressBeforeCity } from '../utils/addressUtils';

export default function RestaurantInfo({ address }: { address: string }) {
  return (
    <View>
      <View style={localStyles.infoRow}>
        <Text>📍 {getAddressBeforeCity(address)}</Text>
      </View>
      <View style={localStyles.infoRow}>
        <Text>📞 0766 771 772</Text>
      </View>
      <View style={localStyles.infoRow}>
        <Text>🕒 6:00 AM - 23:00 PM</Text>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  infoRow: { marginVertical: 4 },
});
