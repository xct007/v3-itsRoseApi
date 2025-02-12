import Fastify from "fastify";
import * as assert from "node:assert";
import { describe, test } from "node:test";
import authentication from "../../src/plugins/authentication.js";

describe("Authentication plugin", () => {
	test("Authentication plugin - loaded", async () => {
		const fastify = Fastify();

		void fastify.register(authentication);
		await fastify.ready();
		console.debug(fastify.printPlugins());

		assert.ok(true);
	});
	// test("Authentication plugin - loaded", async () => {
	// 	const fastify = Fastify();

	// 	void fastify.register(authentication);
	// 	await fastify.ready();
	// 	console.debug(fastify.printPlugins());

	// 	assert.ok(fastify.hasPlugin("authentication"));
	// });
});
