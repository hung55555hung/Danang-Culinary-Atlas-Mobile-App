import * as React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-gesture-handler';
import { Linking } from 'react-native';
import Mapbox from '@rnmapbox/maps';

// 🗺️ Set Mapbox Access Token - HARDCODED
const MAPBOX_TOKEN = 'your_mapbox_access_token_here';
Mapbox.setAccessToken(MAPBOX_TOKEN);

export default function App() {
  return (
    <PaperProvider>
      <AppNavigator />
    </PaperProvider>
  );
}
