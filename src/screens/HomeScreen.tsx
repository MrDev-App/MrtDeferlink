import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { getDeviceFingerprint } from '../index';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HomeScreen = () => {
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendFingerprint = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[HomeScreen] Sending fingerprint...');
      const response = await getDeviceFingerprint();
      console.log('[HomeScreen] API Response:', response);
      setApiResponse(response);
    } catch (err: any) {
      console.error('[HomeScreen] API Error:', err);
      setError(err?.message || 'Failed to fetch device fingerprint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Device Fingerprint</Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendFingerprint}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Send Fingerprint</Text>
          )}
        </TouchableOpacity>

        <View style={styles.responseContainer}>
          <Text style={styles.responseHeader}>API Response:</Text>

          {loading && (
            <View style={styles.statusBox}>
              <ActivityIndicator size="small" color="#4F46E5" />
              <Text style={styles.statusText}>Sending fingerprint data...</Text>
            </View>
          )}

          {error && (
            <View style={[styles.statusBox, styles.errorBox]}>
              <Text style={styles.errorText}>Error: {error}</Text>
            </View>
          )}

          {!loading && !error && apiResponse && (
            <View style={styles.jsonBox}>
              <Text style={styles.jsonText}>
                {JSON.stringify(apiResponse, null, 2)}
              </Text>
            </View>
          )}

          {!loading && !error && !apiResponse && (
            <Text style={styles.placeholderText}>
              Tap "Send Fingerprint" to trigger the API call and view response
              data here.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 20,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  responseContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 200,
  },
  responseHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    gap: 8,
  },
  statusText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  jsonBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
  },
  jsonText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#fff',
  },
  placeholderText: {
    color: '#94A3B8',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
});
