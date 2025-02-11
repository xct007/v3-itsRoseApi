import { S } from "fluent-json-schema";

export const chat = {
	body: S.object()
		.prop("model", S.string().default("gpt-3.5-turbo"))
		.prop(
			"messages",
			S.array()
				.items(
					S.object()
						.prop(
							"role",
							S.string()
								.enum([
									"assistant",
									"user",
									"system",
									"tool",
									"function",
								])
								.required()
						)
						.examples(["user"])
						.prop("content", S.anyOf([S.string(), S.object()]))
						.examples(["Define love in simple way"])
						.prop("name", S.string())
						.examples(["Frieren"])
				)
				.minItems(1)
		),
	response: S.object()
		.prop("model", S.string())
		.prop(
			"message",
			S.object()
				.prop(
					"role",
					S.string().enum(["assistant", "user", "function", "tool"])
				)
				.prop("content", S.oneOf([S.string(), S.null()]))
				.default(null)
				.description("The message content")

				.prop(
					"images",
					S.oneOf([S.null(), S.array().items(S.string())])
				)
				.default(null)
				.description("The generated images base64")

				.prop(
					"function_call",
					S.object()
						.prop("name", S.string())
						.description("The function name")
						.prop("arguments", S.string())
						.description("The function arguments")
				)
				.description("When the model requests a function call")
		),
};

export const vision = {
	body: S.object()
		.prop(
			"data",
			S.string().default(
				JSON.stringify({
					model: "gpt-4o-mini",
					messages: [
						{
							role: "user",
							content: "Give me a description of this image",
						},
					],
				})
			)
		)
		.prop("image", S.raw({ type: "string", format: "binary" }))
		.required(["data", "image"]),
	response: S.object()
		.prop("model", S.string())
		.prop(
			"message",
			S.object()
				.prop(
					"role",
					S.string().enum(["assistant", "user", "function"])
				)
				.prop("content", S.string())
		),
};
