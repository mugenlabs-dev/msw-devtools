import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface ContentPageProps {
  children: ReactNode;
  description: string;
  title: string;
}

export const ContentPage = ({ children, description, title }: ContentPageProps) => (
  <article className="shell shell-content text-text-secondary py-16 font-sans">
    <p className="text-text-dimmed mb-3 font-mono text-[12px] tracking-wide">
      <Link className="text-accent-blue no-underline hover:underline" to="/">
        MSW DevTools
      </Link>
      <span aria-hidden="true"> / </span>
      <span>{title}</span>
    </p>
    <h1 className="text-text-primary m-0 text-3xl font-bold tracking-tight">{title}</h1>
    <p className="text-text-muted mt-4 mb-10 text-base leading-relaxed">{description}</p>
    <div className="text-text-secondary [&_a]:text-accent-blue [&_h2]:text-text-primary space-y-5 text-sm leading-relaxed [&_a]:no-underline hover:[&_a]:underline [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ms-5 [&_li]:list-disc [&_p]:m-0 [&_ul]:m-0 [&_ul]:space-y-2">
      {children}
    </div>
  </article>
);
