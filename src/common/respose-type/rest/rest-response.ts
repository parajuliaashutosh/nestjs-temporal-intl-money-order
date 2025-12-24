export class RestResponse<T> {
    public readonly time: string
  constructor(
    public readonly success: boolean,
    public readonly message: string,
    public readonly data?: T,
  ) {
    this.time = new Date().toISOString();
  }
}
