import axiosInstance, { AxiosRequestConfig, AxiosResponse } from "./axios";

const axiosFetch = async <T>(
	url: string,
	config: AxiosRequestConfig
): Promise<T> => {
	try {
		const response: AxiosResponse<T> = await axiosInstance(url, config);
		return response.data;
	} catch (error) {
		console.error(error);
		throw new axiosInstance.ApiError("Internal server error", 500);
	}
};

axiosFetch.get = axiosInstance.get;
axiosFetch.post = axiosInstance.post;
axiosFetch.put = axiosInstance.put;
axiosFetch.patch = axiosInstance.patch;
axiosFetch.delete = axiosInstance.delete;
axiosFetch.request = axiosInstance.request;
axiosFetch.ApiError = axiosInstance.ApiError;

export default axiosFetch;
