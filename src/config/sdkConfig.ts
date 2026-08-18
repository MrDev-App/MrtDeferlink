export type SDKConfigOptions = {
  baseUrl: string;
  apiKey: string;
  environment?: 'production' | 'staging';
  debug?: boolean;
};

class SDKConfigStore {
  private config: SDKConfigOptions | null = null;

  init(options: SDKConfigOptions) {
    if (!options.baseUrl) {
      throw new Error('[MrtDeferlink] baseUrl is required in init()');
    }
    if (!options.apiKey) {
      throw new Error('[MrtDeferlink] apiKey is required in init()');
    }
    if (this.config) {
      console.warn('[MrtDeferlink] init() called twice — ignoring second call');
      return;
    }
    this.config = { environment: 'production', debug: false, ...options };
  }

  get(): SDKConfigOptions {
    if (!this.config) {
      throw new Error('[MrtDeferlink] Call init() before using the SDK');
    }
    return this.config;
  }

  isInitialized(): boolean {
    return this.config !== null;
  }
}

export const SDKConfig = new SDKConfigStore();
