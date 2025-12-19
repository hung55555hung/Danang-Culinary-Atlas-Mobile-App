import * as React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-gesture-handler';
import { Linking } from 'react-native';
import Mapbox from '@rnmapbox/maps';

// 🗺️ Set Mapbox Access Token - HARDCODED
const MAPBOX_TOKEN =
  'pk.eyJ1IjoiaHVuZzA1NDcyNCIsImEiOiJjbWl5bHk3eWIwaHJoM2dweXBxMGcwMm10In0.gXxq4YOgffAD8vV7y6nSxA';
Mapbox.setAccessToken(MAPBOX_TOKEN);

export default function App() {
  return (
    <PaperProvider>
      <AppNavigator />
    </PaperProvider>
  );
}
