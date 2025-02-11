export class ApiError extends Error {
	code = 500;

	constructor(message: string, code: number) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;

		Error.captureStackTrace(this, this.constructor);
	}
}

interface Global {
	ApiError: typeof ApiError;
}

(globalThis as unknown as Global).ApiError = ApiError;
