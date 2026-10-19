import type { PostHog } from "posthog-js";

// PostHog for the demo and docs site only; the published package never loads
// analytics. Cookieless, proxied through same-origin /ingest, and loaded on
// demand so visitors who are never tracked do not download posthog-js.

const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;

/** The only hostname analytics may report from. */
const PRODUCTION_HOST = "msw-devtools.mugenlabs.dev";

/**
 * The build that reaches production is first deployed to a preview URL and
 * tested with Playwright, so the page itself must be on the production domain
 * and not driven by an automated browser.
 */
const isProductionVisit = (): boolean =>
  typeof window !== "undefined" &&
  window.location.hostname === PRODUCTION_HOST &&
  !navigator.webdriver;

let clientPromise: Promise<PostHog> | null = null;

export const initPostHog = (): void => {
  if (!(key && isProductionVisit())) {
    return;
  }
  clientPromise = import("posthog-js").then(({ default: posthog }) => {
    posthog.init(key, {
      // No feature flags are used, so skip the flags request on every load.
      advanced_disable_feature_flags: true,
      api_host: "/ingest",
      // Only the curated events below; autocapture would also send clicked
      // element text, which in the playground includes user-visible data.
      autocapture: false,
      capture_dead_clicks: false,
      capture_exceptions: true,
      capture_pageleave: true,
      capture_pageview: false,
      capture_performance: false,
      disable_session_recording: true,
      disable_surveys: true,
      // Nothing persists between sessions and nobody is identified.
      persistence: "memory",
      person_profiles: "identified_only",
      respect_dnt: true,
      ui_host: "https://eu.posthog.com",
    });
    return posthog;
  });
};

/** Run once the client is ready; a no-op whenever analytics are disabled. */
const withClient = (fn: (client: PostHog) => void): void => {
  if (clientPromise) {
    clientPromise.then(fn).catch(() => {
      // posthog-js failed to load (ad blocker, offline); analytics stay off.
    });
  }
};

export const capturePageview = (url: string): void => {
  withClient((client) => client.capture("$pageview", { $current_url: url }));
};

/** Every custom event the site sends, with its properties. Keep names snake_case. */
export interface AnalyticsEvents {
  install_command_copied: { package_manager: string };
  mock_updated: { change_type: string; operation: string; operation_type: string | null };
  package_manager_selected: { package_manager: string };
  section_link_copied: { section: string };
  snippet_copied: { language: string };
  theme_toggled: { theme: "dark" | "light" };
}

export const trackEvent = <Name extends keyof AnalyticsEvents>(
  name: Name,
  props: AnalyticsEvents[Name]
): void => {
  withClient((client) => client.capture(name, props));
};

/**
 * Report an error the app caught itself (route error boundaries). Uncaught
 * errors and unhandled rejections are captured automatically by posthog-js.
 */
export const captureException = (error: unknown, context: Record<string, unknown>): void => {
  const err = error instanceof Error ? error : new Error(String(error));
  withClient((client) =>
    client.captureException(err, { error_source: "route-error-boundary", ...context })
  );
};
