import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface RatingStarsProps {
  maxStars?: number;
  onRatingChange?: (rating: number) => void;
  initialRating?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  maxStars = 5,
  onRatingChange,
  initialRating = 0,
}) => {
  const [rating, setRating] = useState(initialRating);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handlePress = (value: number) => {
    setRating(value);
    if (onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }, (_, index) => {
        const starNumber = index + 1;
        return (
          <TouchableOpacity
            key={starNumber}
            onPress={() => handlePress(starNumber)}
          >
            <Image
              source={
                starNumber <= rating
                  ? require('../assets/star_filled.png')
                  : require('../assets/star_outline.png')
              }
              style={styles.star}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  star: {
    width: 32,
    height: 32,
    marginHorizontal: 3,
    resizeMode: 'contain',
  },
});

export default RatingStars;
