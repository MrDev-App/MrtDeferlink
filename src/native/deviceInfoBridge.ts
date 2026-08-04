import { NativeModules, Platform, AccessibilityInfo } from 'react-native';

const { DeviceInfoModule } = NativeModules;

export async function getDeviceModel(): Promise<string> {
  try {
    return await DeviceInfoModule.getDeviceModel();
  } catch {
    return 'unknown';
  }
}

export async function getConnectionType(): Promise<string> {
  try {
    return await DeviceInfoModule.getConnectionType();
  } catch {
    return 'unknown';
  }
}

export async function getNative24HourClock(): Promise<boolean | null> {
  try {
    return await DeviceInfoModule.uses24HourClock();
  } catch {
    return null;
  }
}

export async function getNativeRegionInfo(): Promise<{
  regionCode: string;
} | null> {
  try {
    return await DeviceInfoModule.getRegionInfo();
  } catch {
    return null;
  }
}

export async function getNativeCurrencyCode(): Promise<string> {
  try {
    return await DeviceInfoModule.getCurrencyCode();
  } catch {
    return 'USD';
  }
}

export async function getNativeIncreaseContrast(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    try {
      return await AccessibilityInfo.isInvertColorsEnabled();
    } catch {
      return false;
    }
  } else {
    try {
      return await DeviceInfoModule.isHighContrastEnabled();
    } catch {
      return false;
    }
  }
}

export async function getNativeBoldText(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    try {
      return await AccessibilityInfo.isBoldTextEnabled();
    } catch {
      return false;
    }
  } else {
    try {
      return await DeviceInfoModule.isBoldTextEnabled();
    } catch {
      return false;
    }
  }
}

export async function hasCheckedDeferredMatch(): Promise<boolean> {
  try {
    return await DeviceInfoModule.hasCheckedDeferredMatch();
  } catch {
    return false;
  }
}

export async function markDeferredMatchChecked(): Promise<boolean> {
  try {
    return await DeviceInfoModule.markDeferredMatchChecked();
  } catch {
    return false;
  }
}
