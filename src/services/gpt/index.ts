import * as schema from "./schema";
import { GptVulcanService } from "./vulcan";

export class GptApi extends GptVulcanService {
	schema = schema;

	constructor() {
		super();
	}

	async chat(options: any) {
		const {
			model,
			messages,
			// functions: user_fn,
			tool_choice,
			tools,
		} = options;

		const body = {
			model,
			messages,
			// ...(used_fns.length > 0 && { functions: used_fns }),
			tool_choice,
			tools,
		};

		const data = await this.callGpt(body);
		return {
			model,
			message: data.choices[0].message,
		};
	}

	// private _createCb(fields: any) {
	// 	return (form: FormData) => {
	// 		form.append(
	// 			"images[]",
	// 			new Blob([fields.data], { type: "image/*" }),
	// 			fields.originalName
	// 		);
	// 		return form;
	// 	};
	// }
}
export const gpt = new GptApi();
