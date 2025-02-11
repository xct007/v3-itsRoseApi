import fp from "fastify-plugin";
import * as services from "../services";

export default fp(async (fastify) => {
	void fastify.decorate("services", services);
});

declare module "fastify" {
	export interface FastifyInstance {
		services: typeof services;
	}
}
