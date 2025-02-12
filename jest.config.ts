import { type JestConfigWithTsJest, createDefaultEsmPreset } from "ts-jest";

const presetConfig = createDefaultEsmPreset({
	tsconfig: "<rootDir>/tsconfig.json",
});
const config: JestConfigWithTsJest = {
	...presetConfig,
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	transform: {
		"^.+\\.(t|j)sx?$": [
			"@swc/jest",
			{
				sourceMaps: "inline",
				jsc: {
					parser: {
						syntax: "typescript",
						tsx: false,
					},
					transform: {
						react: {
							runtime: "automatic",
						},
					},
					target: "es2020",
					loose: false,
					externalHelpers: false,
					keepClassNames: true,
				},
				module: {
					type: "es6",
					strict: true,
					strictMode: true,
				},
			},
		],
	},
	testPathIgnorePatterns: ["/node_modules/", "/dist/"],
	modulePathIgnorePatterns: ["<rootDir>/dist/"],
	collectCoverageFrom: ["src/services/**/*.ts", "src/libs/**/*.ts"],
	coverageProvider: "v8",
	coverageReporters: ["text", "lcov"],
	testEnvironment: "node",
	prettierPath: "<rootDir>/node_modules/prettier",
	setupFiles: ["<rootDir>/jest.setup.ts"],
	transformIgnorePatterns: ["node_modules/(?!.*\\.mjs$)"],
	extensionsToTreatAsEsm: [".ts"],
	verbose: true,
};

export default config;
