 export interface DataAndCountBuilder<T> {
  setData(data: T): this;
  setCount(count: number): this;
  build(): DataAndCount<T>;
}

export class DataAndCount<T> {
  private constructor(
    public readonly data: T,
    public readonly count: number,
  ) {}

  static builder<T>(): DataAndCountBuilder<T> {
    return new (class {
      private data!: T;
      private count!: number;

      setData(data: T): this {
        this.data = data;
        return this;
      }

      setCount(count: number): this {
        this.count = count;
        return this;
      }

      build(): DataAndCount<T> {
        return new DataAndCount(this.data, this.count);
      }
    })();
  }
}
