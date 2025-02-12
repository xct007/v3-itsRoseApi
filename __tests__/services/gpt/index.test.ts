import axiosFetch from "../../../src/libs/axios-fetch";
import { Helper } from "../../../src/services/gpt/helper";
import { GptVulcanService } from "../../../src/services/gpt/vulcan";

jest.mock("../../../src/libs/axios-fetch");

describe("GPT Services Helper", () => {
	let helper: Helper;

	beforeEach(() => {
		helper = new Helper();
	});

	describe("Generating Request ID", () => {
		it("should generate a request ID with a specific prefix and current timestamp", () => {
			const reqId = helper["_generateReqId"]();
			expect(reqId.startsWith("914948789")).toBe(true);
			const timestamp = Math.floor(Date.now() / 1000);
			expect(parseInt(reqId.slice(9))).toBeLessThanOrEqual(timestamp);
		});
	});

	describe("Generating the ID", () => {
		it("should generate a ID with length equal to length", () => {
			const deviceId = helper["_generateDeviceId"]();
			expect(deviceId.length).toBe(Helper["CHARACTERS"].length);
			for (const char of deviceId) {
				expect(Helper["CHARACTERS"]).toContain(char);
			}
		});
	});

	describe("Object Manipulations", () => {
		it("should convert all keys of an object to lowercase", () => {
			const obj = { KeyOne: "value1", KeyTwo: { NestedKey: "value2" } };
			const result = helper["_lowerCaseObjectKeys"](obj);
			expect(result).toEqual({
				keyone: "value1",
				keytwo: { nestedkey: "value2" },
			});
		});

		it("should handle arrays within the object", () => {
			const obj = { KeyOne: ["Value1", { NestedKey: "Value2" }] };
			const result = helper["_lowerCaseObjectKeys"](obj);
			expect(result).toEqual({
				keyone: ["Value1", { nestedkey: "Value2" }],
			});
		});

		it("should return non-object values as is", () => {
			expect(helper["_lowerCaseObjectKeys"]("string")).toBe("string");
			expect(helper["_lowerCaseObjectKeys"](123)).toBe(123);
			expect(helper["_lowerCaseObjectKeys"](null)).toBe(null);
		});
	});
});

describe("GPT Service Core", () => {
	let service: GptVulcanService;

	beforeEach(() => {
		service = new GptVulcanService();
	});

	it("should initialize with default options", () => {
		expect(service._jwtOptions).toEqual({
			accessToken: null,
			accessTokenExpiration: 0,
			deviceId: expect.any(String),
		});
	});

	describe("Generating Token", () => {
		it("should generate token and set it to the options", async () => {
			(axiosFetch.request as jest.Mock).mockResolvedValue({
				data: {
					AccessToken: "newAccessToken",
					AccessTokenExpiration: new Date(
						Date.now() + 3600 * 1000 + 1
					).toISOString(),
				},
			});

			await service["_fetchToken"]();

			expect(service._jwtOptions.accessToken).toBe("newAccessToken");
			expect(service._jwtOptions.accessTokenExpiration).toBeGreaterThan(
				Date.now() / 1000
			);

			expect(
				service._jwtOptions.accessTokenExpiration > Date.now() / 1000
			).toBeTruthy();

			await service["_fetchToken"]();
			expect(axiosFetch.request).toHaveBeenCalledTimes(1);
		});
	});

	describe("Make Request - Core", () => {
		it("should make a request with the correct headers", async () => {
			(axiosFetch.request as jest.Mock).mockResolvedValue({ data: {} });

			await service["_makeRequest"]({ url: "/test", method: "GET" });

			expect(axiosFetch.request).toHaveBeenCalledWith(
				expect.objectContaining({
					baseURL: "https://api.vulcanlabs.co",
					url: "/test",
					method: "GET",
					headers: expect.objectContaining({
						"User-Agent": "Chat Smith Android, Version 3.9.5(669)",
						"X-Vulcan-Request-ID": expect.any(String),
					}),
				})
			);
		});
	});

	describe("callGpt - Core", () => {
		it("should call create chat with the correct parameters", async () => {
			const options = { model: "gpt-3", messages: ["Hello"] };
			const createChatSpy = jest
				.spyOn<any, any>(service, "_createChat")
				.mockResolvedValue({});

			await service.callGpt(options);

			expect(createChatSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					...options,
					user: service._jwtOptions.deviceId,
					nsfw_check: false,
				}),
				"/smith-v2/api/v7/chat_android"
			);
		});
	});

	describe("callVision - Core", () => {
		it("should call create chat with the correct parameters", async () => {
			const options = {
				model: "vision",
				messages: ["Analyze this image"],
			};
			const createChatSpy = jest
				.spyOn<any, any>(service, "_createChat")
				.mockResolvedValue({});
			const cb = jest.fn();

			await service.callVision(options, cb);

			expect(cb).toHaveBeenCalledWith(expect.any(FormData));
			expect(createChatSpy).toHaveBeenCalledWith(
				expect.any(FormData),
				"/smith-v2/api/v7/vision_android"
			);
		});
	});
});
