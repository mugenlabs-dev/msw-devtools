/**
 * MSW handlers for all Pokemon endpoints in the demo.
 * 30 unique Pokemon across 5 playground pages, each with realistic mock responses.
 */
import { HttpResponse, http } from "msw";
import { graphql } from "msw/graphql";

// ---------------------------------------------------------------------------
// Shared response helpers
// ---------------------------------------------------------------------------

const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

/** Link-scoped GraphQL API — works the same on MSW 2 and 3. */
const pokeGraphql = graphql.link("https://beta.pokeapi.co/graphql/v1beta");

const gqlPokemonResponse = (pokemon: {
  height: number;
  id: number;
  name: string;
  types: string[];
  weight: number;
}) => ({
  data: {
    pokemon_v2_pokemon: [
      {
        height: pokemon.height,
        id: pokemon.id,
        name: pokemon.name,
        pokemon_v2_pokemonsprites: [
          {
            sprites: {
              front_default: `${SPRITE_BASE}/${pokemon.id}.png`,
              front_shiny: `${SPRITE_BASE}/shiny/${pokemon.id}.png`,
            },
          },
        ],
        pokemon_v2_pokemontypes: pokemon.types.map((t) => ({
          pokemon_v2_type: { name: t },
        })),
        weight: pokemon.weight,
      },
    ],
  },
});

const restPokemonResponse = (pokemon: {
  height: number;
  id: number;
  name: string;
  types: string[];
  weight: number;
}) => ({
  height: pokemon.height,
  id: pokemon.id,
  name: pokemon.name,
  sprites: {
    front_default: `${SPRITE_BASE}/${pokemon.id}.png`,
    front_shiny: `${SPRITE_BASE}/shiny/${pokemon.id}.png`,
  },
  types: pokemon.types.map((t) => ({ type: { name: t } })),
  weight: pokemon.weight,
});

// ---------------------------------------------------------------------------
// TanStack Query page — 3 REST + 3 GraphQL
// ---------------------------------------------------------------------------

/** Charizard — REST */
export const getCharizardHandler = http.get("https://pokeapi.co/api/v2/pokemon/6", () =>
  HttpResponse.json(
    restPokemonResponse({
      height: 17,
      id: 6,
      name: "charizard",
      types: ["fire", "flying"],
      weight: 905,
    })
  )
);

/** Gengar — REST */
export const getGengarHandler = http.get("https://pokeapi.co/api/v2/pokemon/94", () =>
  HttpResponse.json(
    restPokemonResponse({
      height: 15,
      id: 94,
      name: "gengar",
      types: ["ghost", "poison"],
      weight: 405,
    })
  )
);

/** Tyranitar — REST */
export const getTyranitarHandler = http.get("https://pokeapi.co/api/v2/pokemon/248", () =>
  HttpResponse.json(
    restPokemonResponse({
      height: 20,
      id: 248,
      name: "tyranitar",
      types: ["rock", "dark"],
      weight: 2020,
    })
  )
);

/** Pancham — GraphQL */
export const getPanchamHandler = pokeGraphql.query("GetPancham", () =>
  HttpResponse.json(
    gqlPokemonResponse({ height: 6, id: 674, name: "pancham", types: ["fighting"], weight: 80 })
  )
);
export const getPanchamEmptyHandler = pokeGraphql.query("GetPancham", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Salamence — GraphQL */
export const getSalamenceHandler = pokeGraphql.query("GetSalamence", () =>
  HttpResponse.json(
    gqlPokemonResponse({
      height: 15,
      id: 373,
      name: "salamence",
      types: ["dragon", "flying"],
      weight: 1026,
    })
  )
);
export const getSalamenceEmptyHandler = pokeGraphql.query("GetSalamence", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Snorlax — GraphQL */
export const getSnorlaxHandler = pokeGraphql.query("GetSnorlax", () =>
  HttpResponse.json(
    gqlPokemonResponse({ height: 21, id: 143, name: "snorlax", types: ["normal"], weight: 4600 })
  )
);
export const getSnorlaxEmptyHandler = pokeGraphql.query("GetSnorlax", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

// ---------------------------------------------------------------------------
// SWR page — 3 REST + 3 GraphQL
// ---------------------------------------------------------------------------

/** Garchomp — REST */
export const getGarchompHandler = http.get("https://pokeapi.co/api/v2/pokemon/445", () =>
  HttpResponse.json(
    restPokemonResponse({
      height: 19,
      id: 445,
      name: "garchomp",
      types: ["dragon", "ground"],
      weight: 950,
    })
  )
);

/** Lucario — REST */
export const getLucarioHandler = http.get("https://pokeapi.co/api/v2/pokemon/448", () =>
  HttpResponse.json(
    restPokemonResponse({
      height: 12,
      id: 448,
      name: "lucario",
      types: ["fighting", "steel"],
      weight: 540,
    })
  )
);

/** Blaziken — REST */
export const getBlazikenHandler = http.get("https://pokeapi.co/api/v2/pokemon/257", () =>
  HttpResponse.json(
    restPokemonResponse({
      height: 19,
      id: 257,
      name: "blaziken",
      types: ["fire", "fighting"],
      weight: 520,
    })
  )
);

/** Gardevoir — GraphQL */
export const getGardevoirHandler = pokeGraphql.query("GetGardevoir", () =>
  HttpResponse.json(
    gqlPokemonResponse({
      height: 16,
      id: 282,
      name: "gardevoir",
      types: ["psychic", "fairy"],
      weight: 484,
    })
  )
);
export const getGardevoirEmptyHandler = pokeGraphql.query("GetGardevoir", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Scizor — GraphQL */
export const getScizorHandler = pokeGraphql.query("GetScizor", () =>
  HttpResponse.json(
    gqlPokemonResponse({
      height: 18,
      id: 212,
      name: "scizor",
      types: ["bug", "steel"],
      weight: 1180,
    })
  )
);
export const getScizorEmptyHandler = pokeGraphql.query("GetScizor", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Togekiss — GraphQL */
export const getTogekissHandler = pokeGraphql.query("GetTogekiss", () =>
  HttpResponse.json(
    gqlPokemonResponse({
      height: 15,
      id: 468,
      name: "togekiss",
      types: ["fairy", "flying"],
      weight: 380,
    })
  )
);
export const getTogekissEmptyHandler = pokeGraphql.query("GetTogekiss", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

// ---------------------------------------------------------------------------
// URQL page — all GraphQL
// ---------------------------------------------------------------------------

/** Eevee — GraphQL */
export const getEeveeHandler = pokeGraphql.query("GetEevee", () =>
  HttpResponse.json(
    gqlPokemonResponse({ height: 3, id: 133, name: "eevee", types: ["normal"], weight: 65 })
  )
);
export const getEeveeEmptyHandler = pokeGraphql.query("GetEevee", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Lapras — GraphQL */
export const getLaprasHandler = pokeGraphql.query("GetLapras", () =>
  HttpResponse.json(
    gqlPokemonResponse({
      height: 25,
      id: 131,
      name: "lapras",
      types: ["water", "ice"],
      weight: 2200,
    })
  )
);
export const getLaprasEmptyHandler = pokeGraphql.query("GetLapras", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Alakazam — GraphQL */
export const getAlakazamHandler = pokeGraphql.query("GetAlakazam", () =>
  HttpResponse.json(
    gqlPokemonResponse({ height: 15, id: 65, name: "alakazam", types: ["psychic"], weight: 480 })
  )
);
export const getAlakazamEmptyHandler = pokeGraphql.query("GetAlakazam", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Arcanine — GraphQL */
export const getArcanineHandler = pokeGraphql.query("GetArcanine", () =>
  HttpResponse.json(
    gqlPokemonResponse({ height: 19, id: 59, name: "arcanine", types: ["fire"], weight: 1550 })
  )
);
export const getArcanineEmptyHandler = pokeGraphql.query("GetArcanine", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Steelix — GraphQL */
export const getSteelixHandler = pokeGraphql.query("GetSteelix", () =>
  HttpResponse.json(
    gqlPokemonResponse({
      height: 92,
      id: 208,
      name: "steelix",
      types: ["steel", "ground"],
      weight: 4000,
    })
  )
);
export const getSteelixEmptyHandler = pokeGraphql.query("GetSteelix", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Heracross — GraphQL */
export const getHeracrossHandler = pokeGraphql.query("GetHeracross", () =>
  HttpResponse.json(
    gqlPokemonResponse({
      height: 15,
      id: 214,
      name: "heracross",
      types: ["bug", "fighting"],
      weight: 540,
    })
  )
);
export const getHeracrossEmptyHandler = pokeGraphql.query("GetHeracross", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

// ---------------------------------------------------------------------------
// Apollo page — all GraphQL
// ---------------------------------------------------------------------------

/** Rayquaza — GraphQL */
export const getRayquazaHandler = pokeGraphql.query("GetRayquaza", () =>
  HttpResponse.json(
    gqlPokemonResponse({
      height: 70,
      id: 384,
      name: "rayquaza",
      types: ["dragon", "flying"],
      weight: 2065,
    })
  )
);
export const getRayquazaEmptyHandler = pokeGraphql.query("GetRayquaza", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Metagross — GraphQL */
export const getMetagrossHandler = pokeGraphql.query("GetMetagross", () =>
  HttpResponse.json(
    gqlPokemonResponse({
      height: 16,
      id: 376,
      name: "metagross",
      types: ["steel", "psychic"],
      weight: 5500,
    })
  )
);
export const getMetagrossEmptyHandler = pokeGraphql.query("GetMetagross", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Milotic — GraphQL */
export const getMiloticHandler = pokeGraphql.query("GetMilotic", () =>
  HttpResponse.json(
    gqlPokemonResponse({ height: 62, id: 350, name: "milotic", types: ["water"], weight: 1620 })
  )
);
export const getMiloticEmptyHandler = pokeGraphql.query("GetMilotic", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Absol — GraphQL */
export const getAbsolHandler = pokeGraphql.query("GetAbsol", () =>
  HttpResponse.json(
    gqlPokemonResponse({ height: 12, id: 359, name: "absol", types: ["dark"], weight: 470 })
  )
);
export const getAbsolEmptyHandler = pokeGraphql.query("GetAbsol", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Flygon — GraphQL */
export const getFlygonHandler = pokeGraphql.query("GetFlygon", () =>
  HttpResponse.json(
    gqlPokemonResponse({
      height: 20,
      id: 330,
      name: "flygon",
      types: ["ground", "dragon"],
      weight: 820,
    })
  )
);
export const getFlygonEmptyHandler = pokeGraphql.query("GetFlygon", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Aggron — GraphQL */
export const getAggronHandler = pokeGraphql.query("GetAggron", () =>
  HttpResponse.json(
    gqlPokemonResponse({
      height: 21,
      id: 306,
      name: "aggron",
      types: ["steel", "rock"],
      weight: 3600,
    })
  )
);
export const getAggronEmptyHandler = pokeGraphql.query("GetAggron", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

// ---------------------------------------------------------------------------
// RTK Query page — 3 REST + 3 GraphQL
// ---------------------------------------------------------------------------

/** Infernape — REST */
export const getInfernapeHandler = http.get("https://pokeapi.co/api/v2/pokemon/392", () =>
  HttpResponse.json(
    restPokemonResponse({
      height: 12,
      id: 392,
      name: "infernape",
      types: ["fire", "fighting"],
      weight: 550,
    })
  )
);

/** Weavile — REST */
export const getWeavileHandler = http.get("https://pokeapi.co/api/v2/pokemon/461", () =>
  HttpResponse.json(
    restPokemonResponse({
      height: 11,
      id: 461,
      name: "weavile",
      types: ["dark", "ice"],
      weight: 340,
    })
  )
);

/** Zoroark — REST */
export const getZoroarkHandler = http.get("https://pokeapi.co/api/v2/pokemon/571", () =>
  HttpResponse.json(
    restPokemonResponse({ height: 16, id: 571, name: "zoroark", types: ["dark"], weight: 811 })
  )
);

/** Volcarona — GraphQL */
export const getVolcaronaHandler = pokeGraphql.query("GetVolcarona", () =>
  HttpResponse.json(
    gqlPokemonResponse({
      height: 16,
      id: 637,
      name: "volcarona",
      types: ["bug", "fire"],
      weight: 460,
    })
  )
);
export const getVolcaronaEmptyHandler = pokeGraphql.query("GetVolcarona", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Hydreigon — GraphQL */
export const getHydreigonHandler = pokeGraphql.query("GetHydreigon", () =>
  HttpResponse.json(
    gqlPokemonResponse({
      height: 18,
      id: 635,
      name: "hydreigon",
      types: ["dark", "dragon"],
      weight: 1600,
    })
  )
);
export const getHydreigonEmptyHandler = pokeGraphql.query("GetHydreigon", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

/** Chandelure — GraphQL */
export const getChandelureHandler = pokeGraphql.query("GetChandelure", () =>
  HttpResponse.json(
    gqlPokemonResponse({
      height: 10,
      id: 609,
      name: "chandelure",
      types: ["ghost", "fire"],
      weight: 343,
    })
  )
);
export const getChandelureEmptyHandler = pokeGraphql.query("GetChandelure", () =>
  HttpResponse.json({ data: { pokemon_v2_pokemon: [] } })
);

// ---------------------------------------------------------------------------
// Fetch + Axios page — all REST
// ---------------------------------------------------------------------------

/** Mimikyu — REST */
export const getMimikyuHandler = http.get("https://pokeapi.co/api/v2/pokemon/778", () =>
  HttpResponse.json(
    restPokemonResponse({
      height: 2,
      id: 778,
      name: "mimikyu",
      types: ["ghost", "fairy"],
      weight: 7,
    })
  )
);

/** Umbreon — REST */
export const getUmbreonHandler = http.get("https://pokeapi.co/api/v2/pokemon/197", () =>
  HttpResponse.json(
    restPokemonResponse({ height: 10, id: 197, name: "umbreon", types: ["dark"], weight: 270 })
  )
);

/** Espeon — REST */
export const getEspeonHandler = http.get("https://pokeapi.co/api/v2/pokemon/196", () =>
  HttpResponse.json(
    restPokemonResponse({ height: 9, id: 196, name: "espeon", types: ["psychic"], weight: 265 })
  )
);

/** Sylveon — REST */
export const getSylveonHandler = http.get("https://pokeapi.co/api/v2/pokemon/700", () =>
  HttpResponse.json(
    restPokemonResponse({ height: 10, id: 700, name: "sylveon", types: ["fairy"], weight: 235 })
  )
);

/** Mewtwo — REST */
export const getMewtwoHandler = http.get("https://pokeapi.co/api/v2/pokemon/150", () =>
  HttpResponse.json(
    restPokemonResponse({ height: 20, id: 150, name: "mewtwo", types: ["psychic"], weight: 1220 })
  )
);

/** Dragonite — REST */
export const getDragoniteHandler = http.get("https://pokeapi.co/api/v2/pokemon/149", () =>
  HttpResponse.json(
    restPokemonResponse({
      height: 22,
      id: 149,
      name: "dragonite",
      types: ["dragon", "flying"],
      weight: 2100,
    })
  )
);
