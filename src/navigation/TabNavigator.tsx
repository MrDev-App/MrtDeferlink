import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';

import PostsScreen from '../screens/PostsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { HomeScreen } from '../screens/HomeScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabIconWrapperProps = {
  focused: boolean;
  children: React.ReactNode;
};

const TabIconWrapper = ({ focused, children }: TabIconWrapperProps) => (
  <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
    {children}
  </View>
);

export const TabNavigator: React.FC = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#4F46E5',
      tabBarInactiveTintColor: '#64748B',
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabBarLabel,
      tabBarItemStyle: styles.tabBarItem,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, focused }) => (
          <TabIconWrapper focused={focused}>
            <Text>Home</Text>
          </TabIconWrapper>
        ),
      }}
    />

    <Tab.Screen
      name="Posts"
      component={PostsScreen}
      options={{
        tabBarLabel: 'Posts',
        tabBarIcon: ({ color, focused }) => (
          <TabIconWrapper focused={focused}>
            <Text>Home</Text>
          </TabIconWrapper>
        ),
      }}
    />

    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, focused }) => (
          <TabIconWrapper focused={focused}>
            <Text>Home</Text>
          </TabIconWrapper>
        ),
      }}
    />
  </Tab.Navigator>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
  iconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 14,
  },
  iconWrapperActive: {
    backgroundColor: '#EEF2FF',
  },
});
