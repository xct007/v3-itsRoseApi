import * as assert from "node:assert";
import { test } from "node:test";
import { build } from "../helper.js";

test("General route /status", async (t) => {
	const app = await build(t);

	const res = await app.inject({
		url: "/status",
	});
	assert.deepStrictEqual(JSON.parse(res.payload), {
		ok: true,
	});
});
