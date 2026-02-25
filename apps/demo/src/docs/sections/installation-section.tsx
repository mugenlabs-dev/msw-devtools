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
      <InstallBlock packages="msw-devtools-plugin" />
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
  </section>
);
