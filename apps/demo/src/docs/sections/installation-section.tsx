import { Package } from "lucide-react";
import { InstallBlock } from "../components/install-block";
import { SectionTitle } from "../components/section-title";
import { prose } from "../styles";

export const InstallationSection = () => (
  <section className="mb-12">
    <SectionTitle id="installation">
      <Package size={20} />
      Installation
    </SectionTitle>
    <p className={prose}>Install the core library:</p>
    <div className="mb-5">
      <InstallBlock packages="@mugenlabs/msw-devtools" />
    </div>
    <p className={prose}>
      This library renders inside{" "}
      <a
        className="text-accent-blue no-underline"
        href="https://tanstack.com/devtools"
        rel="noopener noreferrer"
        target="_blank"
      >
        TanStack DevTools
      </a>
      , so you&apos;ll need that too:
    </p>
    <InstallBlock packages="@tanstack/react-devtools" />
    <p className={`${prose} mt-5`}>
      The package is ESM-only and runs in the browser: MSW needs Service Worker support, so serve
      the app over HTTPS or from localhost. It is safe to import during server rendering:
      registering mocks there only records them, and the worker starts in the browser when the
      plugin mounts.
    </p>
    <p className={`${prose} mt-5`}>
      Compatible with MSW 2 and MSW 3 on the same public API. GraphQL imports differ by major (
      <code className="rounded bg-white/5 px-1 font-mono text-[0.9em]">msw</code> vs{" "}
      <code className="rounded bg-white/5 px-1 font-mono text-[0.9em]">msw/graphql</code>); prefer{" "}
      <code className="rounded bg-white/5 px-1 font-mono text-[0.9em]">graphql.link</code>. The
      public{" "}
      <code className="rounded bg-white/5 px-1 font-mono text-[0.9em]">onUnhandledRequest</code>{" "}
      option maps to MSW 3&apos;s{" "}
      <code className="rounded bg-white/5 px-1 font-mono text-[0.9em]">onUnhandledFrame</code>.
    </p>
    <p className={`${prose} mt-5`}>
      Minimums follow the MSW major you install. The public API of this package is the same on both.
    </p>
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm text-text-secondary">
        <thead>
          <tr className="border-white/10 border-b text-text-dimmed text-xs uppercase tracking-wide">
            <th className="py-2 pr-4 font-medium">Requirement</th>
            <th className="py-2 pr-4 font-medium">MSW 2.x</th>
            <th className="py-2 pr-4 font-medium">MSW 3.x</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-white/5 border-b">
            <td className="py-2 pr-4">msw</td>
            <td className="py-2 pr-4 font-mono text-text-primary">^2.0.0</td>
            <td className="py-2 pr-4 font-mono text-text-primary">^3.0.0</td>
          </tr>
          <tr className="border-white/5 border-b">
            <td className="py-2 pr-4">Node</td>
            <td className="py-2 pr-4 font-mono text-text-primary">≥20</td>
            <td className="py-2 pr-4 font-mono text-text-primary">≥22.12</td>
          </tr>
          <tr className="border-white/5 border-b">
            <td className="py-2 pr-4">TypeScript</td>
            <td className="py-2 pr-4 font-mono text-text-primary">≥5.0</td>
            <td className="py-2 pr-4 font-mono text-text-primary">≥5.9</td>
          </tr>
          <tr>
            <td className="py-2 pr-4">Unhandled requests</td>
            <td className="py-2 pr-4">
              <code className="font-mono text-text-primary">onUnhandledRequest</code>
            </td>
            <td className="py-2 pr-4">
              Same option; mapped to{" "}
              <code className="font-mono text-text-primary">onUnhandledFrame</code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
);
