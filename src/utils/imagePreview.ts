import { NavigationProp } from '@react-navigation/native';

export const handleImagePreview = (
  navigation: NavigationProp<any>,
  imageUri: string,
  imageList?: string[],
) => {
  navigation.navigate('ImagePreview', {
    imageUri,
    imageList: imageList || [imageUri],
  });
};
