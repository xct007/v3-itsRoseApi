import { ApiError } from "../error";

export async function wrap<T>(fn: () => Promise<T>): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		console.error(error);
		throw new ApiError("Internal server error", 500);
	}
}
