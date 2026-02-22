import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		types: "src/types.ts",
		"adapters/urql": "src/adapters/urql/index.ts",
		"adapters/tanstack-query": "src/adapters/tanstack-query/index.ts",
		"adapters/swr": "src/adapters/swr/index.ts",
		"adapters/apollo": "src/adapters/apollo/index.ts",
		"adapters/axios": "src/adapters/axios/index.ts",
	},
	format: ["esm"],
	dts: true,
	sourcemap: true,
	clean: true,
	external: [
		"react",
		"react-dom",
		"msw",
		"zustand",
		"@tanstack/pacer",
		"@urql/core",
		"wonka",
		"@tanstack/react-query",
		"swr",
		"@apollo/client",
		"graphql",
	],
	outExtension: () => ({ js: ".mjs" }),
});
