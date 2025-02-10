import { FastifyPluginAsync } from "fastify";
import { S } from "fluent-json-schema";

const status: FastifyPluginAsync = async (fastify): Promise<void> => {
	void fastify.route({
		method: "GET",
		url: "/status",
		schema: {
			tags: ["General"],
			description: "Check if the service is up and running",
			response: {
				200: S.object().prop(
					"ok",
					S.string().description(
						"Indicates if the service is up and running"
					)
				),
			},
		},
		handler: async () => {
			return {
				ok: true,
			};
		},
	});
};

export default status;
