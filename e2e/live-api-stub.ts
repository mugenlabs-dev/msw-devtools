import type { BrowserContext } from "@playwright/test";

/**
 * Stand-ins for the live PokeAPI and sprite CDN, so "mock off" tests do not
 * depend on third-party uptime or rate limits.
 *
 * Playwright routes the requests MSW passes through (they leave the service
 * worker as real network requests). Mocked requests are answered inside the
 * worker and never reach these routes, so a stubbed body on screen proves the
 * request went past MSW.
 *
 * Set E2E_LIVE_POKEAPI=1 to use the real APIs instead (the nightly CI run does,
 * as a canary for upstream changes).
 */

/** REST ids the demo fetches, with the species name PokeAPI returns. */
const REST_NAMES: Record<string, string> = {
  6: "charizard",
  94: "gengar",
  149: "dragonite",
  150: "mewtwo",
  196: "espeon",
  197: "umbreon",
  248: "tyranitar",
  257: "blaziken",
  392: "infernape",
  445: "garchomp",
  448: "lucario",
  461: "weavile",
  571: "zoroark",
  700: "sylveon",
  778: "mimikyu",
};

const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

/** 1×1 transparent PNG, served for every sprite. */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

const json = (body: unknown) => ({
  body: JSON.stringify(body),
  contentType: "application/json",
  headers: { "access-control-allow-origin": "*" },
});

export const usesLivePokeApi = () => process.env.E2E_LIVE_POKEAPI === "1";

export const stubLivePokeApi = async (context: BrowserContext) => {
  if (usesLivePokeApi()) {
    return;
  }

  await context.route(/^https:\/\/pokeapi\.co\/api\/v2\/pokemon\/\d+$/u, (route) => {
    const id = Number(route.request().url().split("/").at(-1));
    // `abilities` is only in live bodies; the demo's mocks leave it out.
    return route.fulfill(
      json({
        abilities: [{ ability: { name: "network-stub" } }],
        id,
        name: REST_NAMES[id] ?? `pokemon-${id}`,
        sprites: { front_default: `${SPRITE_BASE}/${id}.png` },
        types: [{ type: { name: "normal" } }],
      })
    );
  });

  await context.route("https://beta.pokeapi.co/graphql/v1beta", (route) => {
    if (route.request().method() === "OPTIONS") {
      return route.fulfill({
        headers: {
          "access-control-allow-headers": "*",
          "access-control-allow-methods": "POST",
          "access-control-allow-origin": "*",
        },
        status: 204,
      });
    }
    const { query = "" } = (route.request().postDataJSON() ?? {}) as { query?: string };
    const id = Number(/_eq:\s*(?<id>\d+)/u.exec(query)?.groups?.id ?? 0);
    const name =
      /query\s+Get(?<name>\w+)/u.exec(query)?.groups?.name?.toLowerCase() ?? `pokemon-${id}`;
    return route.fulfill(
      json({
        data: {
          pokemon_v2_pokemon: [
            {
              height: 10,
              id,
              name,
              pokemon_v2_pokemonsprites: [
                { sprites: { front_default: `${SPRITE_BASE}/${id}.png` } },
              ],
              pokemon_v2_pokemontypes: [{ pokemon_v2_type: { name: "normal" } }],
              weight: 100,
            },
          ],
        },
      })
    );
  });

  await context.route(`${SPRITE_BASE}/**`, (route) =>
    route.fulfill({ body: PNG, contentType: "image/png" })
  );
};
