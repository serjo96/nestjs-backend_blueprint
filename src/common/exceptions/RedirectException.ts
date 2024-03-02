import {HttpException, HttpStatus} from "@nestjs/common";

export class RedirectException extends HttpException {
  redirectUrl: string;
  payload: unknown = null;
  constructor(public redirectUrlData: string, payload: unknown) {
    super('Redirect needed', HttpStatus.TEMPORARY_REDIRECT);
    this.redirectUrl = redirectUrlData;
    this.payload = payload;
  }
}
