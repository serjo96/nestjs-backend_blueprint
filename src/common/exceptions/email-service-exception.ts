import {BadRequestException} from "@nestjs/common";

export class EmailServiceException extends BadRequestException {
	payload: unknown = null;
	constructor(message: string, payload?: any) {
		super(message);
		this.name = 'EmailServiceError';
		this.payload = payload
	}
}
