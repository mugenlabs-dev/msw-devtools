import { type ErrorComponentProps, Link, useRouter } from "@tanstack/react-router";
import { AlertTriangle, Compass } from "lucide-react";
import { useEffect } from "react";

import { captureException } from "./lib/analytics";

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
    {children}
  </div>
);

export const ErrorPage = ({ error }: ErrorComponentProps) => {
  const router = useRouter();

  useEffect(() => {
    const { pathname } = window.location;
    // Loaded lazily so the landing page bundle does not pull in the plugin.
    import("@mugenlabs/msw-devtools")
      .then(({ useMockStore }) => {
        captureException(error, {
          library: pathname.split("/")[2] ?? null,
          route: pathname,
          worker_status: useMockStore.getState().workerStatus,
        });
      })
      .catch(() => {
        captureException(error, { route: pathname });
      });
  }, [error]);

  return (
    <Shell>
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-red-500/15">
        <AlertTriangle className="text-red-400" size={28} />
      </div>
      <h1 className="text-text-primary m-0 text-2xl font-bold">Something went wrong</h1>
      <p className="text-text-muted mt-3 text-sm text-pretty">
        {error instanceof Error ? error.message : String(error)}
      </p>
      <button
        className="pressable border-border-secondary text-text-primary hover:bg-bg-tertiary mt-6 rounded-md border px-4 py-2 text-sm transition-colors"
        onClick={() => {
          void router.invalidate();
        }}
        type="button"
      >
        Try again
      </button>
    </Shell>
  );
};

export const NotFoundPage = () => (
  <Shell>
    <div className="bg-accent-blue/15 mb-6 flex size-16 items-center justify-center rounded-full">
      <Compass className="text-accent-blue" size={28} />
    </div>
    <h1 className="text-text-primary m-0 text-2xl font-bold">Page not found</h1>
    <p className="text-text-muted mt-3 text-sm text-pretty">There is nothing at this address.</p>
    <Link
      className="pressable border-border-secondary text-text-primary hover:bg-bg-tertiary mt-6 rounded-md border px-4 py-2 text-sm no-underline transition-colors"
      to="/"
    >
      Back to the docs
    </Link>
  </Shell>
);
