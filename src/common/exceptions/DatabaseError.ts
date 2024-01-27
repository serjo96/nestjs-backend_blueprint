export class DatabaseError extends Error {
	payload = null;
	constructor(message: string, payload?: any) {
		super(message);
		this.name = 'DatabaseError';
		this.payload = payload
	}
}
