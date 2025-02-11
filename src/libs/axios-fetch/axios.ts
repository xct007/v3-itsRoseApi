import axios from "axios";
import { ApiError } from "../../error";

/**
 * Created a new instance of axios with default values
 */
const axiosInstance = axios.create({
	headers: {
		"Content-Type": "application/json",
	},
	validateStatus: () => true,
});

axiosInstance.ApiError = ApiError;

/**
 * Add a request interceptor
 */
axiosInstance.interceptors.response.use(
	// reject promise if response status is not 200
	(response) => {
		if (response.status !== 200) {
			console.error(response);
			throw new ApiError(
				"An error occurred while processing your request.",
				response.status
			);
		}
		return response;
	},
	// handle error
	(error) => {
		console.error(error);
		throw new ApiError(
			"An error occurred while processing your request.",
			error.response?.status ?? 500
		);
	}
);

declare module "axios" {
	interface AxiosInstance {
		ApiError: typeof ApiError;
	}
}

export * from "axios";
export default axiosInstance;
