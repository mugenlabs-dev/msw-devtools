import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface ContentPageProps {
  children: ReactNode;
  description: string;
  title: string;
}

export const ContentPage = ({ children, description, title }: ContentPageProps) => (
  <article className="mx-auto max-w-[720px] px-6 py-16 font-sans text-text-secondary">
    <p className="mb-3 font-mono text-[12px] text-text-dimmed tracking-wide">
      <Link className="text-accent-blue no-underline hover:underline" to="/">
        @mugenlabs/msw-devtools
      </Link>
      <span aria-hidden="true"> / </span>
      <span>{title}</span>
    </p>
    <h1 className="m-0 font-bold text-3xl text-text-primary tracking-tight">{title}</h1>
    <p className="mt-4 mb-10 text-base text-text-muted leading-relaxed">{description}</p>
    <div className="space-y-5 text-sm text-text-secondary leading-relaxed [&_a]:text-accent-blue [&_a]:no-underline hover:[&_a]:underline [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:text-text-primary [&_li]:ml-5 [&_li]:list-disc [&_p]:m-0 [&_ul]:m-0 [&_ul]:space-y-2">
      {children}
    </div>
  </article>
);
