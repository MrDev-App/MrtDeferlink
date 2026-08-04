import {
  Platform,
  Dimensions,
  PixelRatio,
  Appearance,
  AccessibilityInfo,
} from 'react-native';

import {
  getDeviceLocale,
  getDeviceLanguages,
  getRegionCode,
  getTimeZone,
  uses24HourClock,
} from './locale';
import { generateUUID } from './uuid';
import {
  getDeviceModel,
  getConnectionType,
  getNative24HourClock,
  getNativeRegionInfo,
  getNativeIncreaseContrast,
  getNativeBoldText,
  getNativeCurrencyCode,
} from '../native/deviceInfoBridge';

function getScreenBucket(widthPx: number): 'large' | 'medium' | 'small' {
  if (widthPx >= 428) return 'large';
  if (widthPx >= 375) return 'medium';
  return 'small';
}

function getPixelRatioBucket(ratio: number): 'high' | 'standard' {
  if (ratio >= 2.5) return 'high';
  return 'standard';
}

function getDynamicTypeSize(scale: number): 'XL' | 'L' | 'M' | 'S' {
  if (scale >= 1.3) return 'XL';
  if (scale >= 1.15) return 'L';
  if (scale <= 0.9) return 'S';
  return 'M';
}

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
  const locale = getDeviceLocale();
  const languages = getDeviceLanguages();
  const regionCode = getRegionCode(locale);

  const [
    netState,
    deviceName,
    reduceMotion,
    increaseContrast,
    boldText,
    native24Hour,
    nativeRegionInfo,
    currency,
  ] = await Promise.all([
    getConnectionType(),
    getDeviceModel(),
    AccessibilityInfo.isReduceMotionEnabled(),
    getNativeIncreaseContrast(),
    getNativeBoldText(),
    getNative24HourClock(),
    getNativeRegionInfo(),
    getNativeCurrencyCode(),
  ]);

  const { width } = Dimensions.get('screen');
  const pixelRatio = PixelRatio.get();
  const fontScale = PixelRatio.getFontScale();

  const fingerprint: NativeFingerprint = {
    appOpenAt: Date.now(),
    clickSessionId: generateUUID(),
    colorScheme: Appearance.getColorScheme(),
    connectionType: netState,
    currency,
    deviceModelClass: Platform.OS,
    deviceName,
    devicePixelRatioBucket: getPixelRatioBucket(pixelRatio),
    dynamicTypeSize: getDynamicTypeSize(fontScale),
    hourCycle: (native24Hour !== null ? native24Hour : uses24HourClock(locale))
      ? 'h24'
      : 'h12',
    increaseContrast,
    boldText,
    languagesOrdered: languages.join(','),
    locale,
    osVersionMajor: Platform.Version.toString().split('.')[0],
    reduceMotion,
    regionCode: nativeRegionInfo?.regionCode || regionCode,
    screenBucket: getScreenBucket(width),
    timezone: getTimeZone(),
  };

  console.log(
    '[MrtDeferlink] Native Fingerprint:',
    JSON.stringify(fingerprint, null, 2),
  );
  return fingerprint;
}
