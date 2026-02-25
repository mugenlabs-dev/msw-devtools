import { Separator } from "@base-ui/react/separator";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

// --- Type Colors ---

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  bug: { bg: "#a8b820", color: "#1a1a1a" },
  dark: { bg: "#705848", color: "#f0e0d0" },
  dragon: { bg: "#7038f8", color: "#fff" },
  electric: { bg: "#f8d030", color: "#1a1a1a" },
  fairy: { bg: "#ee99ac", color: "#1a1a1a" },
  fighting: { bg: "#c03028", color: "#fff" },
  fire: { bg: "#f08030", color: "#1a1a1a" },
  flying: { bg: "#a890f0", color: "#1a1a1a" },
  ghost: { bg: "#735797", color: "#e8d5ff" },
  grass: { bg: "#78c850", color: "#1a1a1a" },
  ground: { bg: "#e0c068", color: "#1a1a1a" },
  ice: { bg: "#98d8d8", color: "#1a1a1a" },
  normal: { bg: "#a8a878", color: "#1a1a1a" },
  poison: { bg: "#a040a0", color: "#f0d0f0" },
  psychic: { bg: "#f85888", color: "#fff" },
  rock: { bg: "#b8a038", color: "#1a1a1a" },
  steel: { bg: "#b8b8d0", color: "#1a1a1a" },
  water: { bg: "#6890f0", color: "#1a1a1a" },
};

// --- Types ---

export interface PokemonData {
  name: string;
  shinySprite?: string;
  sprite: string;
  types: string[];
}

export interface PokemonCardProps {
  badge: { bg: string; color: string; label: string };
  data: PokemonData | null;
  error: string | null;
  library: string;
  loading: boolean;
  method: string;
  onRefetch: () => void;
}

// --- Badges ---

export const REST_BADGE = {
  bg: "var(--badge-rest-bg)",
  color: "var(--badge-rest-color)",
  label: "REST",
};

export const GRAPHQL_BADGE = {
  bg: "var(--badge-graphql-bg)",
  color: "var(--badge-graphql-color)",
  label: "GraphQL",
};

// --- Skeleton ---

export const skeletonKeyframes = `
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.15; }
}
`;

const SkeletonBlock = ({
  width,
  height,
  borderRadius = 6,
  className = "",
}: {
  borderRadius?: number | string;
  className?: string;
  height: number | string;
  width: number | string;
}) => (
  <div
    className={`bg-text-dimmed ${className}`}
    style={{
      animation: "skeleton-pulse 1.5s ease-in-out infinite",
      borderRadius,
      height,
      width,
    }}
  />
);

const CardSkeleton = () => (
  <>
    <SkeletonBlock borderRadius="50%" height={120} width={120} />
    <SkeletonBlock borderRadius={8} className="mt-1" height={20} width={100} />
    <div className="flex gap-1.5">
      <SkeletonBlock borderRadius={20} height={22} width={56} />
      <SkeletonBlock borderRadius={20} height={22} width={56} />
    </div>
  </>
);

// --- Data Mappers ---

export interface GraphQLPokemon {
  height: number;
  id: number;
  name: string;
  pokemon_v2_pokemonsprites: {
    sprites: { front_default: string; front_shiny?: string } | string;
  }[];
  pokemon_v2_pokemontypes: { pokemon_v2_type: { name: string } }[];
  species: {
    name: string;
  };
  weight: number;
}

const parseSprites = (
  raw: { front_default: string; front_shiny?: string } | string | undefined
): { front_default: string; front_shiny?: string } | undefined => {
  if (raw == null) {
    return undefined;
  }
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as { front_default: string; front_shiny?: string };
    } catch {
      return undefined;
    }
  }
  return raw;
};

export const mapGraphQLPokemon = (pokemon: GraphQLPokemon | undefined): PokemonData | null => {
  if (!pokemon) {
    return null;
  }
  const sprites = parseSprites(pokemon.pokemon_v2_pokemonsprites?.[0]?.sprites);
  return {
    name: pokemon.name,
    shinySprite: sprites?.front_shiny ?? "",
    sprite: sprites?.front_default ?? "",
    types: pokemon.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name),
  };
};

interface RestPokemonSpecies {
  name?: unknown;
}

interface RestPokemonResponseNormalized {
  name: string;
  species?: RestPokemonSpecies;
  sprites?: { front_default?: string; front_shiny?: string };
  types?: { type: { name: string } }[];
}

export const mapRestPokemon = (json: RestPokemonResponseNormalized): PokemonData => {
  const speciesName = typeof json.species?.name === "string" ? json.species.name : "";
  const name = speciesName === "" ? json.name : speciesName;
  return {
    name,
    shinySprite: json.sprites?.front_shiny ?? "",
    sprite: json.sprites?.front_default ?? "",
    types: json.types?.map((t) => t.type.name) ?? [],
  };
};

// --- Card Component ---

// --- Glow color helper ---

const getTypeGlowColor = (types: string[] | undefined): string => {
  if (types?.[0] == null) {
    return "rgba(128,128,128,0.08)";
  }
  const primary = TYPE_COLORS[types[0]];
  if (primary == null) {
    return "rgba(128,128,128,0.08)";
  }
  // Convert hex to rgba with low opacity for subtle glow
  const hex = primary.bg;
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.15)`;
};

export const PokemonCard = ({
  badge,
  method,
  library,
  data,
  loading,
  error,
  onRefetch,
}: PokemonCardProps) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

  const glowColor = getTypeGlowColor(data?.types);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: hover events are cosmetic only
    // biome-ignore lint/a11y/noStaticElementInteractions: hover events are cosmetic only
    <div
      className="overflow-hidden rounded-2xl border border-border-primary bg-card-bg transition-[border-color,box-shadow,background,transform] duration-200"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        borderColor: hovered ? "var(--border-secondary)" : undefined,
        boxShadow: hovered ? `0 0 24px ${glowColor}, 0 0 48px ${glowColor}` : undefined,
        transform: hovered ? "translateY(-2px)" : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-[18px] py-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-md px-2 py-[3px] font-bold text-[10px] uppercase tracking-wide"
            style={{ background: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
          <span className="rounded-md bg-badge-method-bg px-2 py-[3px] font-bold text-[10px] text-badge-method-color transition-[background,color] duration-300">
            {method}
          </span>
          <span className="rounded-md bg-badge-lib-bg px-2 py-[3px] font-semibold text-[10px] text-badge-lib-color transition-[background,color] duration-300">
            {library}
          </span>
        </div>
        <button
          className="cursor-pointer rounded-lg border border-border-secondary bg-transparent px-3 py-1 font-medium text-[10px] text-text-dimmed transition-all duration-150 hover:border-border-tertiary hover:text-text-secondary"
          onClick={onRefetch}
          type="button"
        >
          Refetch
        </button>
      </div>

      <Separator className="m-0 h-px border-none bg-border-primary" />

      {/* Body */}
      <div
        className="flex min-h-[220px] flex-col items-center justify-center px-[18px] py-6 pb-7"
        style={{ gap: loading ? 12 : 0 }}
      >
        {loading && <CardSkeleton />}

        {error != null && error !== "" && (
          <div className="flex flex-col gap-1.5 text-center">
            <span className="text-[13px] text-red-500">Error</span>
            <span className="max-w-[200px] break-words font-mono text-[11px] text-text-muted">
              {error}
            </span>
          </div>
        )}

        {!loading && error == null && data != null && (
          <>
            <div
              className="relative mb-4 flex h-[120px] w-[120px] items-center justify-center rounded-full bg-bg-primary transition-[background,transform] duration-200"
              style={{ transform: hovered ? "scale(1.1)" : undefined }}
            >
              <img
                alt={data.name}
                className="h-24 w-24"
                height={96}
                src={data.sprite}
                style={{ imageRendering: "pixelated" }}
                width={96}
              />
              <AnimatePresence>
                {hovered && data.shinySprite != null && data.shinySprite !== "" && (
                  <motion.img
                    alt={`${data.name} shiny`}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 m-auto h-24 w-24"
                    exit={{ opacity: 0 }}
                    height={96}
                    initial={{ opacity: 0 }}
                    src={data.shinySprite}
                    style={{ imageRendering: "pixelated" }}
                    transition={{ duration: 0.3 }}
                    width={96}
                  />
                )}
              </AnimatePresence>
            </div>

            <h3 className="m-0 mb-3 font-bold text-text-primary text-xl capitalize tracking-wide">
              {data.name}
            </h3>

            <div className="flex justify-center gap-1.5">
              {data.types.map((type) => {
                const colors = TYPE_COLORS[type] ?? {
                  bg: "#555",
                  color: "#fff",
                };
                return (
                  <span
                    className="rounded-full px-3 py-[3px] font-semibold text-[11px] capitalize"
                    key={type}
                    style={{ background: colors.bg, color: colors.color }}
                  >
                    {type}
                  </span>
                );
              })}
            </div>
          </>
        )}

        {!loading && error == null && data == null && (
          <span className="text-[13px] text-text-dimmed">No data available</span>
        )}
      </div>
    </div>
  );
};
