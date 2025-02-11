import fp from "fastify-plugin";

export default fp(async (fastify) => {
	void fastify.setReplySerializer((payload, code) => {
		if (payload && (payload as any)?.openapiObject) {
			return JSON.stringify((payload as any).openapiObject);
		}

		if (code >= 400) {
			return JSON.stringify(payload);
		}

		return JSON.stringify({
			status: true,
			message: "Success",
			result: payload,
		});
	});
});
