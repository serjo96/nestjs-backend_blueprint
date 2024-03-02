import {HttpException, HttpStatus} from "@nestjs/common";

export class RedirectException extends HttpException {
  message = 'Redirect needed';
  redirectUrl: string;
  payload: unknown = null;
  constructor(error: any, public redirectUrlData: string, payload?: unknown) {
    super(error, HttpStatus.TEMPORARY_REDIRECT);
    this.redirectUrl = redirectUrlData;
    this.payload = payload;
  }
}
