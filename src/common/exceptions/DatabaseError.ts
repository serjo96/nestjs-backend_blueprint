export class DatabaseError extends Error {
	payload: unknown = null;
	constructor(message: string, payload?: any) {
		super(message);
		this.name = 'DatabaseError';
		this.payload = payload
	}
}
