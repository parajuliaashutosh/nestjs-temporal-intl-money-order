
export interface RestResponseBuilder<T> {
  setSuccess(value: boolean): this;
  setMessage(message: string): this;
  setData(data: T): this;
  build(): RestResponse<T>;
}

export class RestResponse<T> {
  public readonly time: string;

  private constructor(
    public readonly success: boolean,
    public readonly message: string,
    public readonly data?: T,
  ) {
    this.time = new Date().toISOString();
  }

  static builder<T>(): RestResponseBuilder<T> {
    return new (class {
      private success!: boolean;
      private message!: string;
      private data?: T;

      setSuccess(value: boolean): this {
        this.success = value;
        return this;
      }

      setMessage(message: string): this {
        this.message = message;
        return this;
      }

      setData(data: T): this {
        this.data = data;
        return this;
      }

      build(): RestResponse<T> {
        return new RestResponse(this.success, this.message, this.data);
      }
    })();
  }
}
