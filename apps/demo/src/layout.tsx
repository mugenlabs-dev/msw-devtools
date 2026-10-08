import { Link } from "@tanstack/react-router";
import { BookOpen, Gamepad2 } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { GithubIcon } from "./components/icons/github";
import { GradualBlur } from "./gradual-blur";
import { prefersReducedMotion } from "./lib/utils";
import { ThemeToggle } from "./theme-toggle";

const navIconBase =
  "hit-44 pressable flex items-center justify-center rounded-lg text-sm font-medium h-8 w-8 text-text-muted transition-[color,background,transform,box-shadow] duration-150 hover:text-text-secondary hover:bg-bg-tertiary hover:-translate-y-px data-[active=true]:bg-bg-tertiary data-[active=true]:text-text-primary data-[active=true]:shadow-[0_0_0_1px_var(--border-secondary)]";

const NavIcon = ({ children, isActive }: { children: ReactNode; isActive: boolean }) => (
  <span className={navIconBase} data-active={isActive}>
    {children}
  </span>
);

export const Layout = ({ children }: { children: ReactNode }) => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      setReduceMotion(mq.matches);
    };
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
    };
  }, []);

  useMotionValueEvent(
    scrollY,
    "change",
    useCallback(
      (latest: number) => {
        if (reduceMotion) {
          setHidden(false);
          return;
        }
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 100) {
          setHidden(true);
        } else {
          setHidden(false);
        }
      },
      [scrollY, reduceMotion]
    )
  );

  return (
    <>
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-bg-primary focus:px-4 focus:py-2 focus:text-text-primary focus:shadow-lg"
        href="#main-content"
      >
        Skip to content
      </a>
      <motion.header
        animate={hidden ? "hidden" : "visible"}
        className="sticky top-0 z-50 h-[var(--header-height)] border-border-primary border-b bg-header-bg shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-[20px] transition-[background,border-color,box-shadow] duration-300"
        transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeInOut" }}
        variants={{
          hidden: { y: "-100%" },
          visible: { y: 0 },
        }}
      >
        <div className="mx-auto flex h-[var(--header-height)] max-w-[720px] items-center justify-between px-6">
          <Link
            className="pressable flex items-center gap-3 no-underline transition-transform duration-200 hover:scale-[1.02]"
            to="/"
          >
            <img
              alt="msw-devtools logo"
              className="h-8 w-8 rounded-lg"
              height={32}
              src={`${import.meta.env.BASE_URL}logo.png`}
              width={32}
            />
            <span className="font-bold font-mono text-lg text-text-primary tracking-tight transition-colors duration-300">
              @mugenlabs/msw-devtools
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              activeOptions={{ exact: true }}
              aria-label="Docs"
              className="no-underline"
              title="Docs"
              to="/"
            >
              {({ isActive }) => (
                <NavIcon isActive={isActive}>
                  <BookOpen aria-hidden className="icon-flex-none size-[1lh]" size={16} />
                </NavIcon>
              )}
            </Link>

            <Link
              aria-label="Playground"
              className="no-underline"
              title="Playground"
              to="/playground"
            >
              {({ isActive }) => (
                <NavIcon isActive={isActive}>
                  <Gamepad2 aria-hidden className="icon-flex-none size-[1lh]" size={16} />
                </NavIcon>
              )}
            </Link>

            <a
              aria-label="GitHub repository"
              className="no-underline"
              href="https://github.com/mugenlabs-dev/msw-devtools"
              rel="noopener noreferrer"
              target="_blank"
              title="GitHub"
            >
              <NavIcon isActive={false}>
                <GithubIcon aria-hidden className="icon-flex-none flex size-[1lh]" size={16} />
              </NavIcon>
            </a>

            <div className="ml-1">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </motion.header>

      <main id="main-content">{children}</main>

      <GradualBlur direction="bottom" height="120px" layers={5} maxBlur={10} />
    </>
  );
};
