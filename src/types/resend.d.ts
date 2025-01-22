import { GetContactResponse as ResendGetContactResponse } from "resend";

declare module "resend" {
  interface GetContactResponse extends ResendGetContactResponse {
    unsubscribed: boolean;
  }
}
