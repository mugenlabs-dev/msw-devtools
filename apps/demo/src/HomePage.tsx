import { useCallback, useEffect, useState } from "react";
import { useQuery as useUrqlQuery, gql } from "urql";
import { useQuery as useTanStackQuery } from "@tanstack/react-query";
import useSWR from "swr";
import { useQuery as useApolloQuery, gql as apolloGql } from "@apollo/client";
import axios from "axios";
import { useMockRefetch } from "msw-devtool";
import { Separator } from "@base-ui/react/separator";

// --- GraphQL Queries ---

const GET_SNORLAX = gql`
  query GetSnorlax {
    pokemon_v2_pokemon(where: { id: { _eq: 143 } }) {
      id
      name
      height
      weight
      pokemon_v2_pokemontypes {
        pokemon_v2_type { name }
      }
      pokemon_v2_pokemonsprites {
        sprites
      }
    }
  }
`;

const GET_PANCHAM = apolloGql`
  query GetPancham {
    pokemon_v2_pokemon(where: { id: { _eq: 674 } }) {
      id
      name
      height
      weight
      pokemon_v2_pokemontypes {
        pokemon_v2_type { name }
      }
      pokemon_v2_pokemonsprites {
        sprites
      }
    }
  }
`;

// --- Type Colors ---

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
	ghost: { bg: "#735797", color: "#e8d5ff" },
	poison: { bg: "#a040a0", color: "#f0d0f0" },
	normal: { bg: "#a8a878", color: "#1a1a1a" },
	fire: { bg: "#f08030", color: "#1a1a1a" },
	water: { bg: "#6890f0", color: "#1a1a1a" },
	grass: { bg: "#78c850", color: "#1a1a1a" },
	electric: { bg: "#f8d030", color: "#1a1a1a" },
	psychic: { bg: "#f85888", color: "#fff" },
	ice: { bg: "#98d8d8", color: "#1a1a1a" },
	dragon: { bg: "#7038f8", color: "#fff" },
	dark: { bg: "#705848", color: "#f0e0d0" },
	fairy: { bg: "#ee99ac", color: "#1a1a1a" },
	fighting: { bg: "#c03028", color: "#fff" },
	flying: { bg: "#a890f0", color: "#1a1a1a" },
	bug: { bg: "#a8b820", color: "#1a1a1a" },
	rock: { bg: "#b8a038", color: "#1a1a1a" },
	ground: { bg: "#e0c068", color: "#1a1a1a" },
	steel: { bg: "#b8b8d0", color: "#1a1a1a" },
};

// --- Types ---

type PokemonData = {
	name: string;
	sprite: string;
	shinySprite?: string;
	types: string[];
};

type PokemonCardProps = {
	badge: { label: string; bg: string; color: string };
	method: string;
	library: string;
	data: PokemonData | null;
	loading: boolean;
	error: string | null;
	onRefetch: () => void;
};

// --- Card Component ---

function PokemonCard({
	badge,
	method,
	library,
	data,
	loading,
	error,
	onRefetch,
}: PokemonCardProps) {
	const [hovered, setHovered] = useState(false);

	return (
		<div
			style={{
				background: "var(--card-bg)",
				borderRadius: "16px",
				border: "1px solid var(--border-primary)",
				overflow: "hidden",
				transition: "border-color 0.2s, box-shadow 0.2s, background 0.3s",
				borderColor: hovered ? "var(--border-secondary)" : "var(--border-primary)",
				boxShadow: hovered ? "0 0 20px rgba(128,128,128,0.05)" : "none",
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Header */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "14px 18px",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "6px",
						flexWrap: "wrap",
					}}
				>
					<span
						style={{
							fontSize: "10px",
							padding: "3px 8px",
							borderRadius: "6px",
							background: badge.bg,
							color: badge.color,
							fontWeight: 700,
							textTransform: "uppercase",
							letterSpacing: "0.5px",
						}}
					>
						{badge.label}
					</span>
					<span
						style={{
							fontSize: "10px",
							padding: "3px 8px",
							borderRadius: "6px",
							background: "var(--badge-method-bg)",
							color: "var(--badge-method-color)",
							fontWeight: 700,
							transition: "background 0.3s, color 0.3s",
						}}
					>
						{method}
					</span>
					<span
						style={{
							fontSize: "10px",
							padding: "3px 8px",
							borderRadius: "6px",
							background: "var(--badge-lib-bg)",
							color: "var(--badge-lib-color)",
							fontWeight: 600,
							transition: "background 0.3s, color 0.3s",
						}}
					>
						{library}
					</span>
				</div>
				<button
					type="button"
					onClick={onRefetch}
					style={{
						fontSize: "10px",
						padding: "4px 12px",
						borderRadius: "8px",
						border: "1px solid var(--border-secondary)",
						background: "transparent",
						color: "var(--text-dimmed)",
						cursor: "pointer",
						fontWeight: 500,
						transition: "all 0.15s",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.borderColor = "var(--border-tertiary)";
						e.currentTarget.style.color = "var(--text-secondary)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.borderColor = "var(--border-secondary)";
						e.currentTarget.style.color = "var(--text-dimmed)";
					}}
				>
					Refetch
				</button>
			</div>

			<Separator
				style={{
					height: "1px",
					border: "none",
					background: "var(--border-primary)",
					margin: 0,
				}}
			/>

			{/* Body */}
			<div
				style={{
					padding: "24px 18px 28px",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					minHeight: "220px",
					justifyContent: "center",
				}}
			>
				{loading && (
					<span style={{ color: "var(--text-dimmed)", fontSize: "13px" }}>Loading…</span>
				)}

				{error && (
					<div
						style={{
							textAlign: "center",
							display: "flex",
							flexDirection: "column",
							gap: "6px",
						}}
					>
						<span style={{ color: "#ef4444", fontSize: "13px" }}>Error</span>
						<span
							style={{
								color: "var(--text-muted)",
								fontSize: "11px",
								fontFamily: "monospace",
								maxWidth: "200px",
								wordBreak: "break-word",
							}}
						>
							{error}
						</span>
					</div>
				)}

				{!loading && !error && data && (
					<>
						<div
							style={{
								width: "120px",
								height: "120px",
								borderRadius: "50%",
								background: "var(--bg-primary)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								marginBottom: "16px",
								transition: "background 0.3s",
							}}
						>
							<img
								src={
									hovered && data.shinySprite
										? data.shinySprite
										: data.sprite
								}
								alt={data.name}
								style={{
									width: "96px",
									height: "96px",
									imageRendering: "pixelated",
									transition: "transform 0.2s",
									transform: hovered ? "scale(1.1)" : "scale(1)",
								}}
							/>
						</div>

						<h3
							style={{
								margin: "0 0 12px 0",
								fontSize: "20px",
								fontWeight: 700,
								color: "var(--text-primary)",
								textTransform: "capitalize",
								letterSpacing: "0.5px",
							}}
						>
							{data.name}
						</h3>

						<div
							style={{
								display: "flex",
								gap: "6px",
								justifyContent: "center",
							}}
						>
							{data.types.map((type) => {
								const colors = TYPE_COLORS[type] ?? {
									bg: "#555",
									color: "#fff",
								};
								return (
									<span
										key={type}
										style={{
											fontSize: "11px",
											padding: "3px 12px",
											borderRadius: "20px",
											background: colors.bg,
											color: colors.color,
											fontWeight: 600,
											textTransform: "capitalize",
										}}
									>
										{type}
									</span>
								);
							})}
						</div>
					</>
				)}

				{!loading && !error && !data && (
					<span style={{ color: "var(--text-dimmed)", fontSize: "13px" }}>
						No data available
					</span>
				)}
			</div>
		</div>
	);
}

// --- REST Fetcher ---

function useRestPokemon(url: string, operationName: string) {
	const [data, setData] = useState<PokemonData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchData = useCallback(() => {
		setLoading(true);
		setError(null);
		fetch(url)
			.then((res) => {
				if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
				return res.json();
			})
			.then((json) => {
				setData({
					name: json.name,
					sprite: json.sprites?.front_default ?? "",
					shinySprite: json.sprites?.front_shiny ?? "",
					types:
						json.types?.map(
							(t: { type: { name: string } }) => t.type.name,
						) ?? [],
				});
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setData(null);
				setLoading(false);
			});
	}, [url]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Auto-refetch when mock config changes in the devtools.
	// This is the plain-fetch equivalent of the library adapters.
	useMockRefetch(operationName, fetchData);

	return { data, error, loading, refetch: fetchData };
}

// --- Pokemon Cards ---

function GengarCard() {
	const { data, error, loading, refetch } = useRestPokemon(
		"https://pokeapi.co/api/v2/pokemon/94",
		"GET Gengar",
	);

	return (
		<PokemonCard
			badge={{ label: "REST", bg: "var(--badge-rest-bg)", color: "var(--badge-rest-color)" }}
			method="GET"
			library="fetch"
			data={data}
			loading={loading}
			error={error}
			onRefetch={refetch}
		/>
	);
}

function CharizardCard() {
	const { data, error, isLoading, refetch } = useTanStackQuery({
		queryKey: ["pokemon", "charizard"],
		queryFn: async () => {
			const res = await fetch("https://pokeapi.co/api/v2/pokemon/6");
			if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
			return res.json();
		},
	});

	const pokemon: PokemonData | null = data
		? {
				name: data.name,
				sprite: data.sprites?.front_default ?? "",
				shinySprite: data.sprites?.front_shiny ?? "",
				types:
					data.types?.map(
						(t: { type: { name: string } }) => t.type.name,
					) ?? [],
			}
		: null;

	return (
		<PokemonCard
			badge={{ label: "REST", bg: "var(--badge-rest-bg)", color: "var(--badge-rest-color)" }}
			method="GET"
			library="@tanstack/query"
			data={pokemon}
			loading={isLoading}
			error={error?.message ?? null}
			onRefetch={() => refetch()}
		/>
	);
}

const swrFetcher = (url: string) =>
	fetch(url).then((res) => {
		if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
		return res.json();
	});

function TyranitarCard() {
	const { data, error, isLoading, mutate } = useSWR(
		"https://pokeapi.co/api/v2/pokemon/248",
		swrFetcher,
	);

	const pokemon: PokemonData | null = data
		? {
				name: data.name,
				sprite: data.sprites?.front_default ?? "",
				shinySprite: data.sprites?.front_shiny ?? "",
				types:
					data.types?.map(
						(t: { type: { name: string } }) => t.type.name,
					) ?? [],
			}
		: null;

	return (
		<PokemonCard
			badge={{ label: "REST", bg: "var(--badge-rest-bg)", color: "var(--badge-rest-color)" }}
			method="GET"
			library="swr"
			data={pokemon}
			loading={isLoading}
			error={error?.message ?? null}
			onRefetch={() => mutate()}
		/>
	);
}

type GraphQLPokemon = {
	id: number;
	name: string;
	height: number;
	weight: number;
	pokemon_v2_pokemontypes: { pokemon_v2_type: { name: string } }[];
	pokemon_v2_pokemonsprites: {
		sprites: { front_default: string; front_shiny?: string };
	}[];
};

function mapGraphQLPokemon(
	pokemon: GraphQLPokemon | undefined,
): PokemonData | null {
	if (!pokemon) return null;
	return {
		name: pokemon.name,
		sprite:
			pokemon.pokemon_v2_pokemonsprites?.[0]?.sprites?.front_default ?? "",
		shinySprite:
			pokemon.pokemon_v2_pokemonsprites?.[0]?.sprites?.front_shiny ?? "",
		types: pokemon.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name),
	};
}

function SnorlaxCard() {
	const [result, reexecute] = useUrqlQuery<{
		pokemon_v2_pokemon: GraphQLPokemon[];
	}>({ query: GET_SNORLAX });

	const { data: raw, fetching, error } = result;
	const pokemon = mapGraphQLPokemon(raw?.pokemon_v2_pokemon?.[0]);

	return (
		<PokemonCard
			badge={{ label: "GraphQL", bg: "var(--badge-graphql-bg)", color: "var(--badge-graphql-color)" }}
			method="QUERY"
			library="urql"
			data={pokemon}
			loading={fetching}
			error={error?.message ?? null}
			onRefetch={() => reexecute({ requestPolicy: "network-only" })}
		/>
	);
}

function PanchamCard() {
	const {
		data: raw,
		loading,
		error,
		refetch,
	} = useApolloQuery<{
		pokemon_v2_pokemon: GraphQLPokemon[];
	}>(GET_PANCHAM);

	const pokemon = mapGraphQLPokemon(raw?.pokemon_v2_pokemon?.[0]);

	return (
		<PokemonCard
			badge={{ label: "GraphQL", bg: "var(--badge-graphql-bg)", color: "var(--badge-graphql-color)" }}
			method="QUERY"
			library="apollo"
			data={pokemon}
			loading={loading}
			error={error?.message ?? null}
			onRefetch={() => refetch()}
		/>
	);
}

function SalamenceCard() {
	const [data, setData] = useState<PokemonData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchData = useCallback(() => {
		setLoading(true);
		setError(null);
		axios
			.post("https://beta.pokeapi.co/graphql/v1beta", {
				operationName: "GetSalamence",
				query: `
          query GetSalamence {
            pokemon_v2_pokemon(where: { id: { _eq: 373 } }) {
              id
              name
              height
              weight
              pokemon_v2_pokemontypes {
                pokemon_v2_type { name }
              }
              pokemon_v2_pokemonsprites {
                sprites
              }
            }
          }
        `,
			})
			.then((res) => {
				const pokemon = mapGraphQLPokemon(
					res.data?.data?.pokemon_v2_pokemon?.[0],
				);
				setData(pokemon);
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setData(null);
				setLoading(false);
			});
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useMockRefetch("GetSalamence", fetchData);

	return (
		<PokemonCard
			badge={{ label: "GraphQL", bg: "var(--badge-graphql-bg)", color: "var(--badge-graphql-color)" }}
			method="QUERY"
			library="axios"
			data={data}
			loading={loading}
			error={error}
			onRefetch={fetchData}
		/>
	);
}

// --- Page ---

export function HomePage() {
	return (
		<div
			style={{
				maxWidth: "1000px",
				margin: "0 auto",
				padding: "48px 24px 160px",
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
			}}
		>
			<div style={{ textAlign: "center", marginBottom: "48px" }}>
				<h1
					style={{
						fontSize: "28px",
						fontWeight: 700,
						color: "var(--text-primary)",
						margin: "0 0 8px 0",
						transition: "color 0.3s",
					}}
				>
					msw-devtool Playground
				</h1>
				<p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px" }}>
					Toggle mocks in the DevTools panel below to see responses change in
					real-time.
				</p>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
					gap: "20px",
				}}
			>
				<GengarCard />
				<SnorlaxCard />
				<CharizardCard />
				<TyranitarCard />
				<PanchamCard />
				<SalamenceCard />
			</div>
		</div>
	);
}
