import * as functions from "./functions";
import * as schema from "./schema";
import { GptVulcanService } from "./vulcan";

export class GptApi extends GptVulcanService {
	schema = schema;

	constructor() {
		super();
	}

	private _isInternalFunction(fns: any[], fn: any) {
		return fns.some((f) => f.name === fn);
	}
	private _stringifyMessagesContent(messages: any) {
		messages.map((m: any) => {
			if (typeof m.content === "object") {
				m.content = JSON.stringify(m.content);
			}
		});
	}

	private async _handleFunctionCall(fn_response: any, body: any) {
		const { name, arguments: parameters } = fn_response;
		const fn_data = await functions[name as keyof typeof functions](
			JSON.parse(parameters)
		);

		body.messages.push({
			role: "function",
			name: fn_response.name,
			content: JSON.stringify(fn_data.response),
		});

		body.functions = body.functions!.filter(
			(fn: any) => fn.name !== fn_response.name
		);

		const { message } = await this.callGpt(body).then(
			(data) => data.choices[0]
		);
		if (fn_data.key === "images") {
			Object.assign(message, {
				[fn_data.key]: fn_data[fn_data.key as keyof typeof fn_data],
			});
		}
		return message;
	}

	async chat(options: any) {
		const {
			model,
			messages,
			functions: user_fn,
			tool_choice,
			tools,
		} = options;

		const internal_functions = Object.keys(functions).map(
			(fn) => functions[fn as keyof typeof functions].descriptor
		);

		const used_fns = internal_functions.concat(user_fn || []);
		const body = {
			model,
			messages,
			...(used_fns.length > 0 && { functions: used_fns }),
			tool_choice,
			tools,
		};
		this._stringifyMessagesContent(body.messages);

		const data = await this.callGpt(body);
		const choice = data.choices[0];

		const function_call = choice?.message?.function_call || null;
		if (
			function_call &&
			this._isInternalFunction(internal_functions, function_call.name)
		) {
			choice.message = await this._handleFunctionCall(
				function_call,
				body
			);
		}

		return {
			model: data.model,
			message: choice.message,
		};
	}

	createCb(fields: any) {
		return (form: FormData) => {
			form.append(
				"images[]",
				new Blob([fields.data], { type: "image/*" }),
				fields.originalName
			);
			return form;
		};
	}
}

export const gpt = new GptApi();
