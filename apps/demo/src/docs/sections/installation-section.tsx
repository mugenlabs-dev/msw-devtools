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
  </section>
);
