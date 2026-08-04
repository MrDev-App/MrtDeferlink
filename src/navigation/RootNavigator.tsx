import React, { useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from 'react-native';
import {
  NavigationContainer,
  LinkingOptions,
  getStateFromPath as defaultGetStateFromPath,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { TabNavigator } from './TabNavigator';

import PostDetailScreen from '../screens/PostDetailScreen';
import { checkDeferredDeepLink } from '../index';
import { SDKConfig } from '../config/sdkConfig';

function extractCodeFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/r\/([^\/?#]+)/);
  return match ? match[1] : null;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [SDKConfig.get().baseUrl],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: 'home',
          Posts: 'posts',
          Profile: 'profile',
        },
      },
      PostDetail: 'r/:id',
    },
  },
  async getInitialURL() {
    console.log(
      '🔍 [RootNavigator Linking] Checking Linking.getInitialURL()...',
    );
    const url = await Linking.getInitialURL();
    if (url) {
      console.log(
        '📌 [RootNavigator Linking] Direct Universal Link detected on initial launch:',
        url,
      );
      const code = extractCodeFromUrl(url);
      console.log('📌 [RootNavigator Linking] Extracted Code:', code);
    } else {
      console.log(
        'ℹ️ [RootNavigator Linking] No initial URL detected (normal app open).',
      );
    }
    return url;
  },
  subscribe(listener) {
    const onReceiveURL = ({ url }: { url: string }) => {
      console.log(
        '🔔 [RootNavigator Linking] Deep link URL received while app in foreground/background:',
        url,
      );
      const code = extractCodeFromUrl(url);
      console.log('📌 [RootNavigator Linking] Extracted Code:', code);
      listener(url);
    };

    const subscription = Linking.addEventListener('url', onReceiveURL);
    return () => {
      subscription.remove();
    };
  },

  getStateFromPath(path, options) {
    console.log('🗺️ [RootNavigator Linking] Processing path from URL:', path);
    const cleanPath = path.replace(/^\/+/, '');

    if (cleanPath.startsWith('r/')) {
      const id = cleanPath.split('r/')[1]?.split('?')[0];
      console.log(
        '🎯 [RootNavigator Linking] Navigating to PostDetail screen with ID:',
        id,
      );
      return {
        routes: [
          { name: 'MainTabs' },
          { name: 'PostDetail', params: { id, path: id } },
        ],
      };
    }

    const state = defaultGetStateFromPath(path, options);

    if (state?.routes.length === 1 && state.routes[0].name === 'PostDetail') {
      return { routes: [{ name: 'MainTabs' }, state.routes[0]] };
    }

    return state;
  },
};

const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4F46E5" />
    <Text style={styles.loadingText}>Opening Link...</Text>
  </View>
);

export const RootNavigator: React.FC = () => {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  useEffect(() => {
    async function handleDeferredDeepLink() {
      try {
        console.log(
          '🚀 [RootNavigator] App started. Checking if launched via direct URL...',
        );

        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log(
            '⏩ [RootNavigator] Launched via direct URL — skipping deferred match.',
          );
          return;
        }

        console.log(
          '🔍 [RootNavigator] No direct URL. Running deferred deep link check...',
        );

        const result = await checkDeferredDeepLink();
        if (result && result.matched && result.slug) {
          console.log(
            '🔀 [RootNavigator] Deferred match found! Navigating to PostDetail:',
            result.slug,
          );
          if (navigationRef.isReady()) {
            navigationRef.navigate('PostDetail', {
              id: result.slug,
              path: result.slug,
            });
          } else {
            console.log(
              '⏳ [RootNavigator] Navigation container not ready yet. Retrying navigation in 500ms...',
            );
            setTimeout(() => {
              navigationRef.navigate('PostDetail', {
                id: result.slug,
                path: result.slug,
              });
            }, 500);
          }
        } else {
          console.log(
            '✅ [RootNavigator] Deferred deep link check completed (no match).',
          );
        }
      } catch (err) {
        console.error('❌ [RootNavigator] Deferred deep link error:', err);
      }
    }

    handleDeferredDeepLink();
  }, [navigationRef]);

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      fallback={<LoadingFallback />}
    >
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});
