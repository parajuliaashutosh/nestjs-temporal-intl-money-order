// import { RestResponse } from "./rest-response";

// export class RestResponseBuilder<T> {
//   private success!: boolean;
//   private message!: string;
//   private data?: T;

//   setSuccess(value = true): this {
//     this.success = value;
//     return this;
//   }

//   setMessage(message: string): this {
//     this.message = message;
//     return this;
//   }

//   setData(data: T): this {
//     this.data = data;
//     return this;
//   }

//   build(): RestResponse<T> {
//     return new RestResponse(this.success, this.message, this.data);
//   }
// }
