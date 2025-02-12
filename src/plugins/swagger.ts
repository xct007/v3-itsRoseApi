import Swagger from "@fastify/swagger";
// import fastifySwaggerUi from "@fastify/swagger-ui";
import fp from "fastify-plugin";
import { S } from "fluent-json-schema";
import { description, tags } from "../locals/swagger.js";

// locals
const servers = [
	{
		url:
			process.env.NODE_ENV === "development"
				? "http://localhost:3333"
				: "https://v3-api.itsrose.rest",
		description: "Production server",
	},
	{
		url:
			process.env.NODE_ENV === "development"
				? "http://localhost:3333"
				: "https://v3-api.lovita.io",
		description: "Production server (alias)",
	},
];

const addErrorResponses = (obj: any) => {
	for (const path in obj.openapiObject.paths) {
		const method = Object.keys(obj.openapiObject.paths[path])[0];
		const responses = obj.openapiObject.paths[path][method].responses;

		// modify the 200 response
		// { ... } => { status: true, message: "success", result: { ... } }
		if (responses["200"] && responses["200"].content) {
			responses["200"].content["application/json"].schema = S.object()
				.title("Success Response")
				.prop("status", S.boolean().required().default(true))
				.description("Status of the request")
				.prop("message", S.string().required().default("success"))
				.description("Additional message")
				.prop(
					"result",
					S.raw(responses["200"].content["application/json"].schema)
				)
				.description("Result of the request")
				.valueOf();
		}

		responses["400"] = {
			description: "Invalid request error",
			content: {
				"application/json": {
					schema: {
						description: "Invalid request error",
						$ref: "#/components/schemas/ResponseSchema",
					},
				},
			},
		};
		responses["401"] = {
			description: "Authorization error",
			content: {
				"application/json": {
					schema: {
						description: "Authorization error",
						$ref: "#/components/schemas/ResponseSchema",
					},
				},
			},
		};
		responses["500"] = {
			description: "Internal server error",
			content: {
				"application/json": {
					schema: {
						description: "Internal server error",
						$ref: "#/components/schemas/ResponseSchema",
					},
				},
			},
		};
	}
	return obj;
};

const scalarOpenApi = () => {
	const config = {
		spec: {
			url: "/docs/json",
		},
		metaData: {
			title: "Developer API Reference",
			description: "ItsRose x Lovita API reference for developers",
		},
		theme: "deepSpace",
	};
	const configString = JSON.stringify(config).split('"').join("&quot;");

	return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Developer API Reference</title>
</head>
<body>
<script
  id="api-reference"
  type="application/json"
  data-configuration="${configString}">
</script>
<script src="https://scdn.lovita.io/static/scalar%40api-reference_standalone%401.25.61.js"></script>
</body>
</html>
  `;
};

export default fp(async (fastify) => {
	void fastify.addSchema(
		S.object()
			.id("ResponseSchema")
			.title("Response Schema")
			.prop("status", S.boolean().required().default(false))
			.description("Status of the request")
			.prop("message", S.string().required())
			.description("Additional message")
			.prop("result", S.raw({}))
			.description("Result of the request")
			.valueOf()
	);

	void fastify.register(Swagger, {
		refResolver: {
			buildLocalReference(json, _baseUri, _fragment, i) {
				// This mirrors the default behaviour
				// see: https://github.com/fastify/fastify-swagger/blob/1b53e376b4b752481643cf5a5655c284684383c3/lib/mode/dynamic.js#L17
				if (!json.title && json.$id) {
					json.title = json.$id;
				}
				// Fallback if no $id is present
				if (!json.$id) {
					return `def-${i}`;
				}

				return `${json.$id}`;
			},
		},
		openapi: {
			info: {
				title: "ItsRose API",
				description,
				version: "1.0.0",
			},
			tags,
			servers,
			components: {
				securitySchemes: {
					bearerAuth: {
						type: "http",
						scheme: "bearer",
						description:
							"Get your token from API [Dashboard](https://dash.itsrose.rest)",
					},
				},
			},
			security: [{ bearerAuth: [] }],
		},
		transformObject: addErrorResponses,
	});

	void fastify.get("/docs/json", async (_request, reply) => {
		reply.send(fastify.swagger());
	});
	void fastify.get("/docs", async (_request, reply) => {
		reply.type("text/html").send(scalarOpenApi());
	});
});
