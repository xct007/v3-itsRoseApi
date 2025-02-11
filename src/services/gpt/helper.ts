export class Helper {
	private static readonly CHARACTERS = "0123456789ABCDEF";

	_generateReqId(): string {
		return `${914948789}${Math.floor(Date.now() / 1000)}`;
	}

	_generateDeviceId(): string {
		let result = "";
		for (let i = 0; i < Helper.CHARACTERS.length; i++) {
			const randomIndex = Math.floor(
				Math.random() * Helper.CHARACTERS.length
			);
			result += Helper.CHARACTERS.charAt(randomIndex);
		}
		return result;
	}

	_lowerCaseObjectKeys(obj: any): any {
		if (Array.isArray(obj)) {
			return obj.map((item) => this._lowerCaseObjectKeys(item));
		}
		if (obj !== null && typeof obj === "object") {
			return Object.keys(obj).reduce(
				(acc: { [key: string]: any }, key) => {
					acc[key.toLowerCase()] = this._lowerCaseObjectKeys(
						obj[key]
					);
					return acc;
				},
				{}
			);
		}
		return obj;
	}
}
