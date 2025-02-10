import { RouteOptions } from "fastify";
import fp from "fastify-plugin";
import { getUserSubscription } from "../database";

export default fp(
	async (fastify) => {
		void fastify.addHook("onRoute", (routeOptions) => {
			// default auth to true
			const shouldAddAuth = routeOptions.config?.auth ?? true;
			const currentRoute = routeOptions.url;

			if (shouldAddAuth && !currentRoute.includes("/docs")) {
				addRouteAuthHook(routeOptions);
			}
		});
	},
	{ name: "authentication" }
);

const addRouteAuthHook = (routeOptions: RouteOptions) => {
	routeOptions.preValidation = async (request, reply) => {
		const { authorization } = request.headers;
		if (!authorization) {
			return reply.unauthorized("Authorization header is missing");
		}

		const [authType, token] = authorization.split(" ");
		if (authType !== "Bearer" || !token) {
			return reply.unauthorized("Authorization header is invalid");
		}

		const user = await getUserSubscription(token);
		if (!user) {
			return reply.unauthorized("Invalid or expired access token");
		}
		request.authenticated = true;
		request.user = {
			plan: user.currentPlan,
			rpm: user.currentRpm,
			expiry: user.planExpiryDate,
			created_at: user.createdAt,
			apiKey: token,
		};
	};

	routeOptions.onRequest = async (request, reply) => {
		// Reject requests with large bodies if not authenticated
		if (
			!request.authenticated &&
			request.headers["content-length"] &&
			parseInt(request.headers["content-length"], 10) > 1024
		) {
			return reply.badRequest("Request body is too large");
		}
	};

	routeOptions.onSend = async (request, reply) => {
		if (request.authenticated) {
			reply.header("x-rpm-remaining", request.user.rpm);
			reply.header("x-plan", request.user.plan);
			if (request.user.expiry) {
				reply.header("x-plan-expiry", String(request.user.expiry));
			}
		}
	};
};

declare module "fastify" {
	interface FastifyRequest {
		authenticated: boolean;
		user: {
			plan: string;
			rpm: number;
			expiry: Date | null;
			apiKey: string;
			created_at: Date;
		};
	}

	interface FastifyContextConfig {
		auth?: boolean;
	}
}
