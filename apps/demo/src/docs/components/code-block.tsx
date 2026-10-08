import { useCallback, useEffect, useState } from "react";
import type { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki/bundle/web";

import { CheckIcon } from "../../components/icons/check";
import { CopyIcon } from "../../components/icons/copy";
import { WindowDots } from "./window-dots";

type WebHighlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

let highlighterPromise: Promise<WebHighlighter> | null = null;

const getHighlighter = () => {
  highlighterPromise ??= import("shiki/bundle/web").then(({ createHighlighter }) =>
    createHighlighter({
      langs: ["typescript", "tsx", "bash"],
      themes: ["github-dark"],
    })
  );
  return highlighterPromise;
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [text]);

  return (
    <button
      aria-label="Copy code"
      className={`hit-44 pressable absolute end-2.5 top-2.5 z-[1] flex cursor-pointer items-center justify-center rounded-md border p-[5px_6px] transition-[opacity,background,border-color,color,transform] duration-150 ${
        copied
          ? "border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.15)] text-accent-green opacity-100"
          : "border-white/10 bg-white/5 text-[#888] opacity-60 hover:opacity-100"
      }`}
      onClick={handleCopy}
      type="button"
    >
      {copied ? (
        <CheckIcon aria-hidden className="icon-flex-none flex size-[1cap]" size={14} />
      ) : (
        <CopyIcon aria-hidden className="icon-flex-none flex size-[1cap]" size={14} />
      )}
    </button>
  );
};

export const CodeBlock = ({
  children,
  lang = "typescript",
}: {
  children: string;
  lang?: "typescript" | "tsx" | "bash";
}) => {
  const [html, setHtml] = useState<string | null>(null);
  const trimmed = children.trim();

  useEffect(() => {
    let cancelled = false;
    const loadHighlighter = async () => {
      const hl = await getHighlighter();
      if (cancelled) {
        return;
      }
      const result = hl.codeToHtml(trimmed, {
        lang,
        theme: "github-dark",
      });
      setHtml(result);
    };
    void loadHighlighter();
    return () => {
      cancelled = true;
    };
  }, [trimmed, lang]);

  return (
    <div
      className="code-chrome concentric"
      style={{ ["--_radius" as string]: "12px", ["--_pad" as string]: "0px" }}
    >
      <div className="code-chrome__header flex items-center gap-1.5 bg-white/[0.02] px-4 py-3">
        <WindowDots />
        <span className="ml-auto font-mono text-text-dimmed text-xs">{lang}</span>
      </div>
      <div className="concentric-inner relative" style={{ ["--_radius" as string]: "12px" }}>
        <CopyButton text={trimmed} />
        {html == null ? (
          <pre className="code-scroll-fade m-0 bg-transparent p-4 px-5 font-mono text-[#e0e0e0] text-[13px] leading-relaxed">
            <code>{trimmed}</code>
          </pre>
        ) : (
          <div
            className="shiki-wrapper code-scroll-fade text-[13px] leading-relaxed"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki syntax highlighting output
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  );
};
