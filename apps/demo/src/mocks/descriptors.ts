import {
	type GraphQLMockDescriptor,
	type RestMockDescriptor,
	withRestVariants,
	withStandardVariants,
} from "msw-devtool";

// --- GraphQL Descriptors ---

export const graphqlDescriptors: GraphQLMockDescriptor[] = [
	// Snorlax — fetched by URQL
	{
		type: "graphql",
		operationName: "GetSnorlax",
		operationType: "query",
		group: "Pokemon",
		variants: [
			...withStandardVariants({
				pokemon_v2_pokemon: [
					{
						id: 143,
						name: "snorlax",
						height: 21,
						weight: 4600,
						pokemon_v2_pokemontypes: [
							{ pokemon_v2_type: { name: "normal" } },
						],
						pokemon_v2_pokemonsprites: [
							{
								sprites: {
									front_default:
										"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png",
									front_shiny:
										"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/143.png",
								},
							},
						],
					},
				],
			}),
			{
				id: "empty",
				label: "Not Found (empty)",
				data: { pokemon_v2_pokemon: [] },
			},
		],
	},
	// Pancham — fetched by Apollo
	{
		type: "graphql",
		operationName: "GetPancham",
		operationType: "query",
		group: "Pokemon",
		variants: [
			...withStandardVariants({
				pokemon_v2_pokemon: [
					{
						id: 674,
						name: "pancham",
						height: 6,
						weight: 80,
						pokemon_v2_pokemontypes: [
							{ pokemon_v2_type: { name: "fighting" } },
						],
						pokemon_v2_pokemonsprites: [
							{
								sprites: {
									front_default:
										"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/674.png",
									front_shiny:
										"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/674.png",
								},
							},
						],
					},
				],
			}),
			{
				id: "empty",
				label: "Not Found (empty)",
				data: { pokemon_v2_pokemon: [] },
			},
		],
	},
	// Salamence — fetched by Axios (GraphQL POST)
	{
		type: "graphql",
		operationName: "GetSalamence",
		operationType: "query",
		group: "Pokemon",
		variants: [
			...withStandardVariants({
				pokemon_v2_pokemon: [
					{
						id: 373,
						name: "salamence",
						height: 15,
						weight: 1026,
						pokemon_v2_pokemontypes: [
							{ pokemon_v2_type: { name: "dragon" } },
							{ pokemon_v2_type: { name: "flying" } },
						],
						pokemon_v2_pokemonsprites: [
							{
								sprites: JSON.stringify({
									front_default:
										"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/373.png",
									front_shiny:
										"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/373.png",
								}),
							},
						],
					},
				],
			}),
			{
				id: "empty",
				label: "Not Found (empty)",
				data: { pokemon_v2_pokemon: [] },
			},
		],
	},
	// Non-LIVE: registered but never fetched by the demo
	{
		type: "graphql",
		operationName: "GetMewtwo",
		operationType: "query",
		group: "Pokemon (unused)",
		variants: withStandardVariants({
			pokemon_v2_pokemon: [
				{
					id: 150,
					name: "mewtwo",
					height: 20,
					weight: 1220,
					pokemon_v2_pokemontypes: [
						{ pokemon_v2_type: { name: "psychic" } },
					],
					pokemon_v2_pokemonsprites: [
						{
							sprites: {
								front_default:
									"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
							},
						},
					],
				},
			],
		}),
	},
];

// --- REST Descriptors ---

export const restDescriptors: RestMockDescriptor[] = [
	// Gengar — fetched by plain fetch()
	{
		type: "rest",
		operationName: "GET Gengar",
		method: "get",
		path: "https://pokeapi.co/api/v2/pokemon/94",
		group: "Pokemon REST",
		variants: [
			{
				id: "success",
				label: "Success (200)",
				statusCode: 200,
				data: {
					id: 94,
					name: "gengar",
					height: 15,
					weight: 405,
					types: [
						{ type: { name: "ghost" } },
						{ type: { name: "poison" } },
					],
					sprites: {
						front_default:
							"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",
						front_shiny:
							"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/94.png",
					},
				},
			},
			{
				id: "rateLimited",
				label: "Rate Limited (429)",
				statusCode: 429,
				headers: { "Retry-After": "60" },
				data: { detail: "Rate limit exceeded" },
			},
			{
				id: "notFound",
				label: "Not Found (404)",
				statusCode: 404,
				data: { detail: "Not found." },
			},
			{
				id: "networkError",
				label: "Network Error",
				data: null,
				isNetworkError: true,
			},
		],
	},
	// Charizard — fetched by TanStack Query
	{
		type: "rest",
		operationName: "GET Charizard",
		method: "get",
		path: "https://pokeapi.co/api/v2/pokemon/6",
		group: "Pokemon REST",
		variants: [
			{
				id: "success",
				label: "Success (200)",
				statusCode: 200,
				data: {
					id: 6,
					name: "charizard",
					height: 17,
					weight: 905,
					types: [
						{ type: { name: "fire" } },
						{ type: { name: "flying" } },
					],
					sprites: {
						front_default:
							"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
						front_shiny:
							"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png",
					},
				},
			},
			{
				id: "notFound",
				label: "Not Found (404)",
				statusCode: 404,
				data: { detail: "Not found." },
			},
			{
				id: "networkError",
				label: "Network Error",
				data: null,
				isNetworkError: true,
			},
		],
	},
	// Tyranitar — fetched by SWR
	{
		type: "rest",
		operationName: "GET Tyranitar",
		method: "get",
		path: "https://pokeapi.co/api/v2/pokemon/248",
		group: "Pokemon REST",
		variants: [
			...withRestVariants({
				id: 248,
				name: "tyranitar",
				height: 20,
				weight: 2020,
				types: [
					{ type: { name: "rock" } },
					{ type: { name: "dark" } },
				],
				sprites: {
					front_default:
						"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png",
					front_shiny:
						"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/248.png",
				},
			}),
			{
				id: "serverError",
				label: "Server Error (500)",
				statusCode: 500,
				data: { detail: "Internal server error" },
			},
		],
	},
	// Non-LIVE: registered but never fetched by the demo
	{
		type: "rest",
		operationName: "GET Eevee",
		method: "get",
		path: "https://pokeapi.co/api/v2/pokemon/133",
		group: "Pokemon REST (unused)",
		variants: withRestVariants({
			id: 133,
			name: "eevee",
			height: 3,
			weight: 65,
			types: [{ type: { name: "normal" } }],
			sprites: {
				front_default:
					"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
			},
		}),
	},
];
