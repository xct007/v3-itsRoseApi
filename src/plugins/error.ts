import fp from "fastify-plugin";

const ALLOWED_ERROR = ["ApiError", "UnauthorizedError"];

const validateStatusCode = (code: string | number) => {
	// code is number and between 200 and 500
	if (typeof code === "number") {
		return code >= 200 && code <= 500 ? code : 500;
	}
	return 500;
};

export default fp(async (fastify) => {
	void fastify.setErrorHandler((error, request, reply) => {
		const statusCode = validateStatusCode(error.statusCode || error.code);
		if (statusCode === 500) {
			fastify.log.error(error);
		}
		// if (!(error.name === "ApiError") && statusCode !== 429) {
		if (!ALLOWED_ERROR.includes(error.name) && statusCode !== 429) {
			error.message =
				"An internal server issue is preventing the request from being processed. Please ensure that your request parameters are correct and try again.";
			fastify.log.error(error);
		}

		const errro_validation = (error.validation || [])?.[0] || {};
		const message = errro_validation?.message || error.message;
		reply.status(statusCode).send({
			status: false,
			message,
			result: {
				...errro_validation,
				...(error?.validationContext
					? { context: error.validationContext }
					: {}),
			},
		});
	});

	void fastify.setNotFoundHandler((request, reply) => {
		reply.code(404).send({
			status: false,
			message: `Route ${request.method}:${request.url} not found - Please check your URL and try again.`,
			result: {},
		});
	});
});
