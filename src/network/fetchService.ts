import { METHOD } from './endpoint';

type ApiOptions = {
  method: string;
  headers?: Headers;
  body?: any;
};

export const fetchService = async (
  endpoint: string,
  method: METHOD,
  baseUrl: string,
  params?: Record<
    string,
    string | number | boolean | undefined | null | Array<string>
  >,
  customHeaders?: Record<string, string>,
) => {
  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...customHeaders,
  });

  let apiOptions: ApiOptions = {
    method,
    headers,
  };

  if (params != null && method !== 'GET') {
    apiOptions = {
      ...apiOptions,
      body: JSON.stringify(params),
    };
  }

  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const fullUrl = `${normalizedBaseUrl}${cleanEndpoint}`;

  console.log(`\n🚀 [MrtDeferlink Network] === REQUEST START ===`);
  console.log(`➡️ URL: ${fullUrl}`);
  console.log(`➡️ Method: ${method}`);
  console.log(`➡️ Headers:`, Object.fromEntries((headers as any).entries?.() || []));
  if (params && method !== 'GET') {
    console.log(`📦 Body:`, JSON.stringify(params, null, 2));
  }

  let statusCode = 0;

  try {
    const response = await fetch(fullUrl, apiOptions);
    statusCode = response.status;
    const jsonData = await response.json();

    console.log(`\n📥 [MrtDeferlink Network] === RESPONSE (${statusCode}) ===`);
    console.log(`➡️ URL: ${fullUrl}`);
    console.log(`📦 Data:`, JSON.stringify(jsonData, null, 2));
    console.log(`🏁 [MrtDeferlink Network] === REQUEST END ===\n`);

    switch (statusCode) {
      case 200:
      case 201:
      case 400:
        return { ...jsonData, status_code: statusCode };

      case 401:
      case 402:
      case 403:
      case 405:
      case 406:
        return {
          ...jsonData,
          status: false,
          data: undefined,
          status_code: statusCode,
        };

      case 409:
      case 422:
        return { ...jsonData, status_code: statusCode };

      default:
        return {
          status: false,
          data: undefined,
          status_code: statusCode,
          message:
            statusCode === 500
              ? "Oops! We're having trouble processing your request."
              : '',
        };
    }
  } catch (error: any) {
    console.error(`❌ [MrtDeferlink Network] Request Failed (${fullUrl}):`, error);
    return {
      status: false,
      data: undefined,
      status_code: statusCode,
      message: 'Unstable connection!',
    };
  }
};
