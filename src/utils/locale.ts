import { NativeModules, Platform } from 'react-native';

export function getDeviceLocale(): string {
  try {
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings;
      return (
        settings?.AppleLocale ||
        (settings?.AppleLanguages && settings.AppleLanguages[0]) ||
        'en-US'
      );
    }
    return (
      NativeModules.I18nManager?.localeIdentifier?.replace('_', '-') || 'en-US'
    );
  } catch {
    return 'en-US';
  }
}

export function getDeviceLanguages(): string[] {
  try {
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings;
      return settings?.AppleLanguages || [getDeviceLocale()];
    }
    return [getDeviceLocale()];
  } catch {
    return [getDeviceLocale()];
  }
}

export function getRegionCode(locale: string): string {
  const parts = locale.split(/[-_]/);
  return parts.length > 1 ? parts[1].toUpperCase() : '';
}

export function getTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export function uses24HourClock(locale: string): boolean {
  try {
    const options = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
    }).resolvedOptions() as Intl.DateTimeFormatOptions & { hourCycle?: string };

    return options.hourCycle === 'h23' || options.hourCycle === 'h24';
  } catch {
    return true;
  }
}
