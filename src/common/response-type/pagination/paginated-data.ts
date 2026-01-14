export interface PaginatedDataBuilder<T> {
  setData(data: T): this;
  setTotal(total: number): this;
  setCurrentPage(page: number): this;
  setPerPage(perPage: number): this;
  build(): PaginatedData<T>;
}

export interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export class PaginatedData<T> {
  private constructor(
    public readonly data: T,
    public readonly pagination: Pagination,
  ) {}

  static builder<T>(): PaginatedDataBuilder<T> {
    return new (class {
      private data!: T;
      private total!: number;
      private currentPage!: number;
      private perPage!: number;

      setData(data: T): this {
        this.data = data;
        return this;
      }

      setTotal(total: number): this {
        this.total = total;
        return this;
      }

      setCurrentPage(page: number): this {
        this.currentPage = page;
        return this;
      }

      setPerPage(perPage: number): this {
        this.perPage = perPage;
        return this;
      }

      build(): PaginatedData<T> {
        const totalPages = Math.ceil(this.total / this.perPage);

        return new PaginatedData(this.data, {
          total: this.total,
          totalPages,
          currentPage: this.currentPage,
          perPage: this.perPage,
        });
      }
    })();
  }
}
