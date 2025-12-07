import * as React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-gesture-handler';
import { Linking } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Config from 'react-native-config';

// 🗺️ Set Mapbox Access Token từ .env (không commit key!)
const MAPBOX_TOKEN = Config.MAPBOX_ACCESS_TOKEN || '';
if (MAPBOX_TOKEN) {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
} else {
  console.error('⚠️ MAPBOX_ACCESS_TOKEN chưa được set trong .env file!');
}

export default function App() {
  return (
    <PaperProvider>
      <AppNavigator />
    </PaperProvider>
  );
}
