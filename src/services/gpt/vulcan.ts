import axiosFetch from "../../libs/axios-fetch";
import { Helper } from "./helper";

export interface VulcanJwtOptions {
	accessToken: string | null;
	accessTokenExpiration: number;
	deviceId: string;
}

export class GptVulcanService extends Helper {
	_jwtOptions: VulcanJwtOptions;

	constructor() {
		super();
		this._jwtOptions = {
			accessToken: null,
			accessTokenExpiration: 0,
			deviceId: this._generateDeviceId(),
		};
	}

	private async _fetchToken() {
<<<<<<< HEAD
		if (this._jwtOptions.accessTokenExpiration > Date.now() / 1000) {
=======
		if (
			this._jwtOptions.accessToken &&
			this._jwtOptions.accessTokenExpiration > Date.now()
		) {
>>>>>>> origin/main
			return;
		}
		this._jwtOptions.deviceId = this._generateDeviceId();
		const body = {
			device_id: this._jwtOptions.deviceId,
			order_id: "",
			product_id: "",
			purchase_token: "",
			subscription_id: "",
		};

		const { data } = await this._makeRequest({
			url: "/smith-auth/api/v1/token",
			method: "POST",
			headers: {
				"X-Vulcan-Application-ID": "com.smartwidgetlabs.chatgpt",
			},
			data: body,
		});

		if (!data.AccessToken) {
			throw new axiosFetch.ApiError("Access failed", 401);
		}
		this._jwtOptions.accessToken = data.AccessToken;
<<<<<<< HEAD
		this._jwtOptions.accessTokenExpiration =
			new Date(data.AccessTokenExpiration).getTime() / 1000;
=======
		this._jwtOptions.accessTokenExpiration = Math.floor(
			new Date(data.AccessTokenExpiration).getTime() / 1000
		);
>>>>>>> origin/main
	}

	private async _makeRequest(config: Parameters<typeof axiosFetch>[1]) {
		const { headers } = config;

		return axiosFetch.request({
			baseURL: "https://api.vulcanlabs.co",
			...config,
			headers: {
				"User-Agent": "Chat Smith Android, Version 3.9.5(669)",
				...headers,
				"X-Vulcan-Request-ID": this._generateReqId(),
			},
		});
	}

	private async _createChat(body: any, url: string) {
		await this._fetchToken();
		const { data } = await this._makeRequest({
			url,
			method: "POST",
			data: body,
			headers: this._headers(),
		});
		return this._lowerCaseObjectKeys(data);
	}

	async callGpt(options: any) {
		return this._createChat(
			{
				...options,
				user: this._jwtOptions.deviceId,
				nsfw_check: false,
			},
			"/smith-v2/api/v7/chat_android"
		);
	}

	async callVision(options: any, cb: (_form: FormData) => void) {
		const form = new FormData();
		form.append(
			"data",
			JSON.stringify({
				model: options.model,
				messages: options.messages,
				user: this._jwtOptions.deviceId,
				nsfw_check: false,
				...options,
			})
		);
		cb(form);
		return this._createChat(form, "/smith-v2/api/v7/vision_android");
	}

	_headers() {
		return {
			Authorization: `Bearer ${this._jwtOptions.accessToken}`,
			"User-Agent": "Chat Smith Android, Version 3.9.5(669)",
		};
	}
}
