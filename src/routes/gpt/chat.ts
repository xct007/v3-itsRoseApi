import { FastifyPluginAsync } from "fastify";

const status: FastifyPluginAsync = async (fastify): Promise<void> => {
	void fastify.route({
		method: "POST",
		url: "/chat",
		schema: {
			tags: ["GPT"],
			summary: "Chat",
			description: "Chat with the GPT model",
			body: fastify.services.gpt.schema.chat.body,
			response: {
				200: fastify.services.gpt.schema.chat.response,
			},
		},
		handler: async (request) => {
			const result = await fastify.services.gpt.chat(request.body);
			return result;
		},
	});
};

export default status;
