import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function ImagePreviewScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { imageList = [], imageUri } = route.params || {};

  const data = imageList.length > 0 ? imageList : [imageUri];

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <FlatList
        data={data}
        horizontal
        pagingEnabled
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{ width, height, resizeMode: 'contain' }}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: 'absolute',
          top: 35,
          right: 5,
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: 10,
          borderRadius: 25,
        }}
      >
        <Image
          source={require('../assets/close.png')}
          style={{ width: 24, height: 24, tintColor: 'white' }}
        />
      </TouchableOpacity>
    </View>
  );
}
