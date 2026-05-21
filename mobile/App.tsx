import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import SpotsScreen from './src/screens/SpotsScreen';
import FishScreen from './src/screens/FishScreen';
import SocialScreen from './src/screens/SocialScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    首页: '🏠',
    钓点: '🗺️',
    识鱼: '🐟',
    社区: '👥',
    我的: '👤',
  };
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>{icons[name] || '📱'}</Text>
      <Text style={{ fontSize: 12, color: focused ? '#2E7D32' : '#999' }}>{name}</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
          tabBarShowLabel: false,
          headerShown: false,
        })}
      >
        <Tab.Screen name="首页" component={HomeScreen} />
        <Tab.Screen name="钓点" component={SpotsScreen} />
        <Tab.Screen name="识鱼" component={FishScreen} />
        <Tab.Screen name="社区" component={SocialScreen} />
        <Tab.Screen name="我的" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
