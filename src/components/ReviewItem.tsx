import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from '../styles/ShopDetailStyles';
import { handleImagePreview } from '../utils/imagePreview';
import { useNavigation } from '@react-navigation/native';

interface ReviewItemProps {
  item: {
    reviewerUsername: string;
    avatar: '../assets/avt_default.jpg';
    time: string;
    rating: number;
    content: string;
    images?: any;
    comment: string;
  };
}

export default function ReviewItem({ item }: ReviewItemProps) {
  const navigation = useNavigation<any>();
  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <Image
          source={require('../assets/avt_default.jpg')}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewerName}>{item.reviewerUsername}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginVertical: 3 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <Image
                key={i}
                source={
                  i < item.rating
                    ? require('../assets/star_filled.png')
                    : require('../assets/star_outline.png')
                }
                style={styles.starSmall}
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.reviewText}>{item.comment}</Text>
      {item.images && item.images.length > 0 && (
        <TouchableOpacity
          onPress={() =>
            handleImagePreview(navigation, item.images[0], item.images)
          }
        >
          <Image source={{ uri: item.images[0] }} style={styles.reviewImage} />
        </TouchableOpacity>
      )}
    </View>
  );
}
