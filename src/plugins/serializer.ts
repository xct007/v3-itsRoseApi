import fp from "fastify-plugin";

export default fp(async (fastify) => {
	void fastify.setReplySerializer((payload, code) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (payload && (payload as any)?.openapiObject) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
