import * as assert from "node:assert";
import test from "node:test";
import { build } from "../helper.js";

test("General route /me", async (t) => {
	const app = await build(t);

	const res = await app.inject({
		url: "/me",
		headers: {
			authorization: `Bearer ${process.env.TEST_TOKEN}`,
		},
	});

	assert.equal(res.payload, "this is an example");
});
