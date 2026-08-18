import {
  Platform,
  Appearance,
} from 'react-native';

import {
  generateUUID,
  getDeviceModel,
  getConnectionType,
  getNative24HourClock,
  getNativeRegionInfo,
  getNativeIncreaseContrast,
  getNativeBoldText,
  getNativeCurrencyCode,
  getScreenBucket,
  getPixelRatioBucket,
  getDynamicTypeSize,
  getDeviceLocale,
  getDeviceLanguages,
  getRegionCode,
  getTimeZone,
  isReduceMotionEnabled,
} from '../native/deviceInfoBridge';

export type NativeFingerprint = {
  appOpenAt: number;
  clickSessionId: string;
  colorScheme: string | null | undefined;
  connectionType: string;
  currency: string;
  deviceModelClass: string;
  deviceName: string;
  devicePixelRatioBucket: 'high' | 'standard';
  dynamicTypeSize: 'XL' | 'L' | 'M' | 'S';
  hourCycle: 'h24' | 'h12';
  increaseContrast: boolean;
  boldText: boolean;
  languagesOrdered: string;
  locale: string;
  osVersionMajor: string;
  reduceMotion: boolean;
  regionCode: string;
  screenBucket: 'large' | 'medium' | 'small';
  timezone: string;
  clockSkewMs?: number;
};

export async function collectFingerprint(): Promise<NativeFingerprint> {
  const [
    netState,
    deviceName,
    reduceMotion,
    increaseContrast,
    boldText,
    native24Hour,
    nativeRegionInfo,
    currency,
    screenBucket,
    devicePixelRatioBucket,
    dynamicTypeSize,
    languages,
    regionCode,
    timezone,
    clickSessionId,
    locale,
  ] = await Promise.all([
    getConnectionType(),
    getDeviceModel(),
    isReduceMotionEnabled(),
    getNativeIncreaseContrast(),
    getNativeBoldText(),
    getNative24HourClock(),
    getNativeRegionInfo(),
    getNativeCurrencyCode(),
    getScreenBucket(),
    getPixelRatioBucket(),
    getDynamicTypeSize(),
    getDeviceLanguages(),
    getRegionCode(),
    getTimeZone(),
    generateUUID(),
    getDeviceLocale(),
  ]);

  const fingerprint: NativeFingerprint = {
    appOpenAt: Date.now(),
    clickSessionId,
    colorScheme: Appearance.getColorScheme(),
    connectionType: netState,
    currency,
    deviceModelClass: Platform.OS,
    deviceName,
    devicePixelRatioBucket,
    dynamicTypeSize,
    hourCycle: native24Hour ? 'h24' : 'h12',
    increaseContrast,
    boldText,
    languagesOrdered: languages.join(','),
    locale,
    osVersionMajor: Platform.Version.toString().split('.')[0],
    reduceMotion,
    regionCode: nativeRegionInfo?.regionCode || regionCode,
    screenBucket,
    timezone,
  };

  console.log(
    '[MrtDeferlink] Native Fingerprint:',
    JSON.stringify(fingerprint, null, 2),
  );
  return fingerprint;
}
