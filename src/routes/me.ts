import { FastifyPluginAsync } from "fastify";
import { S } from "fluent-json-schema";

const me: FastifyPluginAsync = async (fastify): Promise<void> => {
	void fastify.route({
		method: "GET",
		url: "/me",
		schema: {
			tags: ["General"],
			description: "Get the account details",
			response: {
				200: S.object()
					.prop(
						"current_plan",
						S.enum([
							"standard",
							"premium",
							"enterprise",
							"custom",
						]).description(
							"The current subscription plan of the account"
						)
					)
					.prop(
						"plan_expiry_date",
						S.raw({
							type: "string",
							format: "date-time",
							nullable: true,
						}).description(
							"The expiry date of the current subscription plan, if applicable"
						)
					)
					.prop(
						"current_rpm",
						S.number().description(
							"The current requests per minute (RPM) rate of the account"
						)
					)
					.prop(
						"created_at",
						S.string().description(
							"The ISO 8601 formatted date when the account was created"
						)
					),
			},
		},
		handler: async (request) => {
			return {
				current_plan: request.user.plan,
				plan_expiry_date: request.user.expiry,
				current_rpm: request.user.rpm,
				created_at: request.user.created_at.toISOString(),
			};
		},
	});
};

export default me;
