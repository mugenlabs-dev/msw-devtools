// Points git at .githooks/ on `pnpm install`. Skips quietly outside a git
// checkout (tarball, Docker build) and never replaces a hooks path the
// contributor set themselves.
import { execFileSync } from "node:child_process";

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

try {
  git("rev-parse", "--git-dir");
} catch {
  process.exit(0);
}

let current = "";
try {
  current = git("config", "--get", "core.hooksPath");
} catch {
  // Not set.
}

if (current === "") {
  try {
    git("config", "core.hooksPath", ".githooks");
  } catch {
    // A read-only or locked git config must not fail `pnpm install`.
    console.log(
      "Could not set core.hooksPath; the pre-push lint hook in .githooks/ is not active."
    );
  }
} else if (current !== ".githooks") {
  console.log(
    `core.hooksPath is already "${current}"; leaving it. The pre-push lint hook is in .githooks/.`
  );
}
