import Fastify from "fastify";
import * as assert from "node:assert";
import { test } from "node:test";
import Support from "../../src/plugins/support.js";

test("support works standalone", async (t) => {
	const fastify = Fastify();
	void fastify.register(Support);
	await fastify.ready();

	assert.equal(fastify.someSupport(), "hugs");
});
