import { Link } from "@tanstack/react-router";
import { BookOpen, Gamepad2 } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { GithubIcon } from "./components/icons/github";
import { GradualBlur } from "./gradual-blur";
import { prefersReducedMotion } from "./lib/utils";
import { ThemeToggle } from "./theme-toggle";

const navLinkBase =
  "hit-44 pressable inline-flex items-center gap-[0.4em] rounded-md px-3 py-1.5 font-medium text-sm text-text-muted transition-[color,background] duration-150 hover:text-text-secondary data-[active=true]:bg-accent-purple/15 data-[active=true]:text-accent-purple";

/** Icon plus label; the label hides on narrow screens, where the link keeps its aria-label. */
const NavLabel = ({
  children,
  icon,
  isActive,
}: {
  children: ReactNode;
  icon: ReactNode;
  isActive: boolean;
}) => (
  <span className={navLinkBase} data-active={isActive}>
    {icon}
    <span className="max-sm:hidden">{children}</span>
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
        className="focus:bg-bg-primary focus:text-text-primary sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:shadow-lg"
        href="#main-content"
      >
        Skip to content
      </a>
      <motion.header
        animate={hidden ? "hidden" : "visible"}
        className="site-header border-border-primary bg-header-bg sticky top-0 z-50 border-b shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-[20px] transition-[background,border-color,box-shadow] duration-300"
        transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeInOut" }}
        variants={{
          hidden: { y: "-100%" },
          visible: { y: 0 },
        }}
      >
        <div className="site-header__inner shell shell-content flex items-center justify-between">
          <Link
            className="pressable flex items-center gap-3 no-underline transition-transform duration-200 hover:scale-[1.02]"
            to="/"
          >
            <img
              alt=""
              className="h-8 w-8 rounded-lg"
              height={32}
              src={`${import.meta.env.BASE_URL}logo.png`}
              width={32}
            />
            <span className="text-text-primary text-lg font-semibold transition-colors duration-300">
              MSW DevTools
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              activeOptions={{ exact: true }}
              aria-label="Docs"
              className="no-underline"
              title="Docs"
              to="/"
            >
              {({ isActive }) => (
                <NavLabel
                  icon={<BookOpen aria-hidden className="icon-flex-none" size={14} />}
                  isActive={isActive}
                >
                  Docs
                </NavLabel>
              )}
            </Link>

            <Link
              aria-label="Playground"
              className="no-underline"
              title="Playground"
              to="/playground"
            >
              {({ isActive }) => (
                <NavLabel
                  icon={<Gamepad2 aria-hidden className="icon-flex-none" size={14} />}
                  isActive={isActive}
                >
                  Playground
                </NavLabel>
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
              <NavLabel
                icon={<GithubIcon aria-hidden className="icon-flex-none flex" size={14} />}
                isActive={false}
              >
                GitHub
              </NavLabel>
            </a>

            <div className="ms-1">
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
