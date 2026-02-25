import { Link } from "@tanstack/react-router";
import { BookOpen, Gamepad2, Github } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";

import { GradualBlur } from "./gradual-blur";
import { ThemeToggle } from "./theme-toggle";

// --- Hover handlers ---

const handleLogoMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.transform = "scale(1.02)";
};

const handleLogoMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.transform = "scale(1)";
};

const handleNavIconMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  if (el.dataset.active !== "true") {
    el.style.color = "var(--text-secondary)";
    el.style.background = "var(--bg-tertiary)";
  }
  el.style.transform = "translateY(-1px)";
};

const handleNavIconMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  if (el.dataset.active !== "true") {
    el.style.color = "var(--text-muted)";
    el.style.background = "transparent";
  }
  el.style.transform = "translateY(0)";
};

// --- NavIcon ---

const navIconBase =
  "flex items-center justify-center rounded-lg text-sm font-medium h-8 w-8 transition-[color,background,transform,box-shadow] duration-150";

const NavIcon = ({ children, isActive }: { children: ReactNode; isActive: boolean }) => (
  // biome-ignore lint/a11y/noStaticElementInteractions: cosmetic hover effects only
  <span
    className={navIconBase}
    data-active={isActive}
    onMouseEnter={handleNavIconMouseEnter}
    onMouseLeave={handleNavIconMouseLeave}
    role="presentation"
    style={{
      background: isActive ? "var(--bg-tertiary)" : "transparent",
      boxShadow: isActive ? "0 0 0 1px var(--border-secondary)" : "none",
      color: isActive ? "var(--text-primary)" : "var(--text-muted)",
    }}
  >
    {children}
  </span>
);

// --- Layout ---

export const Layout = ({ children }: { children: ReactNode }) => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(
    scrollY,
    "change",
    useCallback(
      (latest: number) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 100) {
          setHidden(true);
        } else {
          setHidden(false);
        }
      },
      [scrollY]
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
        className="sticky top-0 z-50 border-border-primary border-b bg-header-bg shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-[20px] transition-[background,border-color,box-shadow] duration-300"
        transition={{ duration: 0.3, ease: "easeInOut" }}
        variants={{
          hidden: { y: "-100%" },
          visible: { y: 0 },
        }}
      >
        <div className="mx-auto flex h-[60px] max-w-[720px] items-center justify-between px-6">
          <Link
            className="flex items-center gap-3 no-underline transition-transform duration-200"
            onMouseEnter={handleLogoMouseEnter}
            onMouseLeave={handleLogoMouseLeave}
            to="/"
          >
            <img
              alt="msw-devtool logo"
              className="h-8 w-8 rounded-lg"
              height={32}
              src={`${import.meta.env.BASE_URL}logo.svg`}
              width={32}
            />
            <span className="font-bold font-mono text-lg text-text-primary tracking-tight transition-colors duration-300">
              msw-devtool
            </span>
          </Link>

          <nav className="flex items-center gap-0.5">
            <Link
              activeOptions={{ exact: true }}
              aria-label="Docs"
              className="no-underline"
              title="Docs"
              to="/"
            >
              {({ isActive }) => (
                <NavIcon isActive={isActive}>
                  <BookOpen size={16} />
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
                  <Gamepad2 size={16} />
                </NavIcon>
              )}
            </Link>

            <a
              aria-label="GitHub repository"
              className="no-underline"
              href="https://github.com/Yagogc/msw-devtool"
              rel="noopener noreferrer"
              target="_blank"
              title="GitHub"
            >
              <NavIcon isActive={false}>
                <Github size={16} />
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
