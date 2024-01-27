export enum MicroserviceName {
	NOTIFICATION = 'Notification microservice'
}

export class MicroserviceError extends Error {
	payload = null;
	microserviceName: MicroserviceName = MicroserviceName.NOTIFICATION;
	constructor(message: string, payload?: any, microserviceName?: MicroserviceName) {
		super(message);
		this.name = 'Microservice Error';
		this.payload = payload
		this.microserviceName = microserviceName
	}
}
