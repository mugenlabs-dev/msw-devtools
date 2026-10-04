import { type ErrorComponentProps, Link, useRouter } from "@tanstack/react-router";
import { AlertTriangle, Compass } from "lucide-react";

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
    {children}
  </div>
);

export const ErrorPage = ({ error }: ErrorComponentProps) => {
  const router = useRouter();
  return (
    <Shell>
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-red-500/15">
        <AlertTriangle className="text-red-400" size={28} />
      </div>
      <h1 className="m-0 font-bold text-2xl text-text-primary">Something went wrong</h1>
      <p className="mt-3 text-sm text-text-muted">
        {error instanceof Error ? error.message : String(error)}
      </p>
      <button
        className="mt-6 rounded-md border border-border-secondary px-4 py-2 text-sm text-text-primary transition-colors hover:bg-white/5"
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
    <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-accent-blue/15">
      <Compass className="text-accent-blue" size={28} />
    </div>
    <h1 className="m-0 font-bold text-2xl text-text-primary">Page not found</h1>
    <p className="mt-3 text-sm text-text-muted">There is nothing at this address.</p>
    <Link
      className="mt-6 rounded-md border border-border-secondary px-4 py-2 text-sm text-text-primary no-underline transition-colors hover:bg-white/5"
      to="/"
    >
      Back to the docs
    </Link>
  </Shell>
);
