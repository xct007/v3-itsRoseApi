import fastifyRateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";
import { Redis } from "ioredis";

export default fp(async (fastify) => {
	void fastify.register(fastifyRateLimit, {
		max: (req) => {
			if (req.url.includes("/docs")) {
				return 30;
			}
			return req.user.rpm || 3;
		},
		hook: "preHandler",

		// CHANGES: Renew user limitation when user sends a request to the server when still limited.
		continueExceeding: true,
		timeWindow: "1 minute",
		keyGenerator: (req) => {
			if (req.url.includes("/docs")) {
				return req.ip;
			}
			return req.user.apiKey + req.url;
		},
		errorResponseBuilder: (req, context) => {
			return {
				statusCode: 429,
				error: "Too Many Requests",
				message: `Request limit reached: As a ${req.user.plan} user, your current plan allows up to ${context.max} requests per ${context.after}. Consider upgrading your plan to increase your limits.`,
			};
		},
		redis: new Redis(getRedisConfig()),
	});
});

const getRedisConfig = () => {
	// on development, use local redis
	if (process.env.NODE_ENV === "development") {
		return {
			host: "localhost",
			port: 6379,
		};
	}
	return {
		host: process.env.REDIS_HOST || "localhost",
		port: Number(process.env.REDIS_PORT) || 6379,
		password: process.env.REDIS_PASSWORD || "",
		username: process.env.REDIS_USERNAME || "",
		connectTimeout: 500,
		maxRetriesPerRequest: 1,
	};
};
