import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import SigninScreen from '../screens/SigninScreen';
import RegisterScreen from '../screens/RegisterScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ReviewScreen from '../screens/ReviewScreen';
import ShopDetailScreen from '../screens/ShopDetailScreen';
import DrawerNavigator from './DrawerNavigator';
import RegisterShopScreen from '../screens/RegisterShopScreen';
import ProfileScreen from '../screens/ProfileScreen';
export type RootStackParamList = {
  Login: undefined;
  Signin: undefined;
  Register: undefined;
  Notification: undefined;
  Review: undefined;
  ShopDetail: undefined;
  Drawer: undefined;
  RegisterShop: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Drawer" component={DrawerNavigator} />
        <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="Signin" component={SigninScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RegisterShop" component={RegisterShopScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
