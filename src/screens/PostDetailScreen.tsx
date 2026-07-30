import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types/navigation';
import { resolveDeepLink } from '../index';

const PostDetailScreen = ({ route }: RootStackScreenProps<'PostDetail'>) => {
  const { id, path } = route.params || {};
  const currentPath = id || path;

  const [loading, setLoading] = useState(false);
  const [resolvedData, setResolvedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`📱 [PostDetailScreen] Mounted with params:`, { id, path, currentPath });
    if (currentPath) {
      setLoading(true);
      console.log(`📡 [PostDetailScreen] Triggering resolveDeepLink for code: "${currentPath}"...`);
      resolveDeepLink(currentPath)
        .then((res) => {
          console.log(`✅ [PostDetailScreen] Successfully resolved deep link data:`, JSON.stringify(res, null, 2));
          setResolvedData(res);
        })
        .catch((err) => {
          console.error(`❌ [PostDetailScreen] Error resolving deep link:`, err);
          setError(err?.message || 'Failed to resolve deep link');
        })
        .finally(() => setLoading(false));
    }
  }, [currentPath, id, path]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Post Detail Screen</Text>
      <Text style={styles.subtitle}>Path Code: {currentPath || 'N/A'}</Text>

      {loading && (
        <View style={styles.statusBox}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={styles.statusText}>Resolving link details...</Text>
        </View>
      )}

      {error && <Text style={styles.errorText}>Error: {error}</Text>}

      {resolvedData && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>Resolved API Data:</Text>
          <Text style={styles.jsonText}>{JSON.stringify(resolvedData, null, 2)}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
    marginBottom: 16,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  statusText: {
    color: '#4F46E5',
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
  },
  dataContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    width: '100%',
  },
  dataTitle: {
    color: '#38BDF8',
    fontWeight: '600',
    marginBottom: 8,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#FFFFFF',
  },
});
