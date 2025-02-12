import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import fastifyCors from "@fastify/cors";
import fastifyUnderPressure from "@fastify/under-pressure";
import { FastifyPluginAsync } from "fastify";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import "./error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type AppOptions = {
	// Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
	fastify,
	opts
): Promise<void> => {
	// Place here your custom code!

	void fastify.register(fastifyUnderPressure, {
		maxEventLoopDelay: 1000,
		maxHeapUsedBytes: 5000000000,
		maxRssBytes: 5000000000,
		maxEventLoopUtilization: 0.98,
		pressureHandler(request, reply, type, value) {
			request.log.info(
				`Under pressure: ${type} value ${value}, breaking the glass`
			);
			void reply.code(503).send({
				status: false,
				message: "Service Unavailable",
			});
		},
	});

	void fastify.register(fastifyCors, {
		origin: "*",
		methods: ["GET", "POST"],
		allowedHeaders: ["Authorization", "Content-Type"],
	});

	// Do not touch the following lines

	// This loads all plugins defined in plugins
	// those should be support plugins that are reused
	// through your application
	void fastify.register(AutoLoad, {
		dir: path.join(__dirname, "plugins"),
		options: opts,
		forceESM: true,
	});

	// This loads all plugins defined in routes
	// define your routes in one of these
	void fastify.register(AutoLoad, {
		dir: path.join(__dirname, "routes"),
		options: opts,
		forceESM: true,
	});
};

export default app;
export { app, options };
