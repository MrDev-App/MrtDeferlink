import { SDKConfig, SDKConfigOptions } from './config/sdkConfig';
import { collectFingerprint } from './utils/fingerprint';
import { getWebFingerprint } from './native/webFingerprintBridge';
import {
  hasCheckedDeferredMatch,
  markDeferredMatchChecked,
  getClockSkewMs,
} from './native/deviceInfoBridge';

import { ENDPOINT } from './network/endpoint';
import { fetchService } from './network/fetchService';

export function init(options: SDKConfigOptions) {
  console.log('⚙️ [MrtDeferlink] Initializing SDK with options:', options);
  SDKConfig.init(options);
}

export async function getDeviceFingerprint() {
  const config = SDKConfig.get();

  console.log(
    '🔍 [MrtDeferlink] Step 1: Collecting native, web, and clock skew fingerprint components...',
  );
  const [nativePart, clockSkewMs, webPart] = await Promise.all([
    collectFingerprint(),
    getClockSkewMs(config.baseUrl),
    getWebFingerprint(),
  ]);

  console.log('📱 [MrtDeferlink] Step 1a: Native Component:', nativePart);
  console.log('⏰ [MrtDeferlink] Step 1b: Clock Skew (ms):', clockSkewMs);
  console.log(
    '🌐 [MrtDeferlink] Step 1c: WebGL/Canvas/Audio Component:',
    webPart,
  );

  const fullFingerprint = { ...nativePart, clockSkewMs, ...webPart };

  console.log(
    '📊 [MrtDeferlink] Step 2: Combined Full Fingerprint Payload:',
    JSON.stringify(fullFingerprint, null, 2),
  );

  const endpoint = ENDPOINT.APP_INFO.toString();
  const method = ENDPOINT.APP_INFO.method;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const fullUrl = config.baseUrl.endsWith('/')
    ? `${config.baseUrl}${cleanEndpoint}`
    : `${config.baseUrl}/${cleanEndpoint}`;

  console.log(
    `📡 [MrtDeferlink] Step 3: Sending deferred match POST request to ${fullUrl}`,
  );
  return fetchService(endpoint, method, config.baseUrl, fullFingerprint);
}

export async function resolveDeepLink(code: string) {
  const cleanCode = code.replace(/^r\//, '');
  const baseUrl = SDKConfig.get().baseUrl;
  const endpoint = ENDPOINT.RESOLVE_LINK.withId(cleanCode);
  const method = ENDPOINT.RESOLVE_LINK.method;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const fullUrl = baseUrl.endsWith('/')
    ? `${baseUrl}${cleanEndpoint}`
    : `${baseUrl}/${cleanEndpoint}`;

  console.log(
    `🔗 [MrtDeferlink] Resolving Direct Deep Link for code "${cleanCode}" via GET ${fullUrl}...`,
  );
  return fetchService(endpoint, method, baseUrl);
}

export async function checkDeferredDeepLink(forceCheck: boolean = false) {
  console.log(
    '🔍 [MrtDeferlink] Checking if deferred match has already been run for this installation...',
  );

  if (!forceCheck) {
    const alreadyChecked = await hasCheckedDeferredMatch();
    if (alreadyChecked) {
      console.log(
        'ℹ️ [MrtDeferlink] Deferred match was ALREADY executed previously on this device. Skipping.',
      );
      return null;
    }
  }

  console.log(
    '🆕 [MrtDeferlink] First launch after installation detected! Executing deferred deep link match...',
  );
  await markDeferredMatchChecked();

  const response = await getDeviceFingerprint();
  console.log(
    '🎉 [MrtDeferlink] Deferred Match API Response:',
    JSON.stringify(response, null, 2),
  );

  if (response && (response.matched || response.match)) {
    const rawSlug =
      response.slug ||
      response.destinationPath ||
      response.destinationUrl ||
      response.destination;
    const slug = rawSlug
      ? rawSlug.replace(/^\/+/, '').replace(/^r\//, '')
      : null;

    console.log(
      `🎯 [MrtDeferlink] DEFERRED MATCH FOUND! Target Slug: "${slug}"`,
    );
    return {
      matched: true,
      slug,
      raw: response,
    };
  }

  console.log(
    'ℹ️ [MrtDeferlink] No deferred match link found for this device fingerprint.',
  );
  return { matched: false, raw: response };
}

export { fetchService, ENDPOINT };
