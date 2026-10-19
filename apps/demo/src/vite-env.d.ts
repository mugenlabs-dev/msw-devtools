/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** PostHog project key. Analytics stay off when unset or off the production domain. */
  readonly VITE_PUBLIC_POSTHOG_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
