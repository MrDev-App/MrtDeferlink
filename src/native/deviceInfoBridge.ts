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

export async function getScreenBucket(): Promise<'large' | 'medium' | 'small'> {
  try {
    return await DeviceInfoModule.getScreenBucket();
  } catch {
    return 'small';
  }
}

export async function getPixelRatioBucket(): Promise<'high' | 'standard'> {
  try {
    return await DeviceInfoModule.getPixelRatioBucket();
  } catch {
    return 'standard';
  }
}

export async function getDynamicTypeSize(): Promise<'XL' | 'L' | 'M' | 'S'> {
  try {
    return await DeviceInfoModule.getDynamicTypeSize();
  } catch {
    return 'M';
  }
}

export async function getDeviceLocale(): Promise<string> {
  try {
    return await DeviceInfoModule.getDeviceLocale();
  } catch {
    return 'en-US';
  }
}

export async function getDeviceLanguages(): Promise<string[]> {
  try {
    return await DeviceInfoModule.getDeviceLanguages();
  } catch {
    return ['en-US'];
  }
}

export async function getRegionCode(): Promise<string> {
  try {
    return await DeviceInfoModule.getRegionCode();
  } catch {
    return '';
  }
}

export async function isReduceMotionEnabled(): Promise<boolean> {
  try {
    return await DeviceInfoModule.isReduceMotionEnabled();
  } catch {
    return false;
  }
}

export async function getTimeZone(): Promise<string> {
  try {
    return await DeviceInfoModule.getTimeZone();
  } catch {
    return 'UTC';
  }
}

export async function getClockSkewMs(apiUrl: string): Promise<number> {
  try {
    return await DeviceInfoModule.getClockSkewMs(apiUrl);
  } catch {
    return 0;
  }
}

export async function generateUUID(): Promise<string> {
  try {
    return await DeviceInfoModule.generateUUID();
  } catch {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
      const randomVal = (Math.random() * 16) | 0;
      const hexVal = char === 'x' ? randomVal : (randomVal & 0x3) | 0x8;
      return hexVal.toString(16);
    });
  }
}
