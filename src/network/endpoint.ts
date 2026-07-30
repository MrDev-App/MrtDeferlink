export type METHOD = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export class ENDPOINT {
  static readonly APP_INFO = new ENDPOINT('api/deferred/app/match', 'POST');
  static readonly RESOLVE_LINK = new ENDPOINT('api/r', 'GET');

  private constructor(
    private readonly key: string,
    public readonly method: METHOD,
  ) {}

  toString() {
    return this.key;
  }
  withId(id: string | number) {
    return `${this.key}/${id}`;
  }
}
