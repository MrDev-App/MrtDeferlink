import { NativeModules, Platform } from 'react-native';

const { WebViewFingerprintModule } = NativeModules;

export type WebFingerprintResult = {
  hardwareConcurrency: number;
  canvasHash: string | null;
  gpuRenderer: string | null;
  webglVendor: string | null;
  webglHash: string | null;
  audioFingerprint: string | null;
};

export async function getWebFingerprint(): Promise<WebFingerprintResult | null> {
  try {
    const raw = await WebViewFingerprintModule.getWebFingerprint();
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
