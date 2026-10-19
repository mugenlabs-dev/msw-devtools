# Standing rules

From Yago (2026-10-19). Every worker follows these.

1. **Ship report.** Any run that ships something (a push to main, a deploy, a PR opened, or a PR going green) must end with a full ship report: the PR or commit link, the deploy state, which checks passed, and screenshot paths for visual work. Never reply "nothing to send" or "same status" after a ship.
2. **Visual changes.** Unless the brief picks one approach, deliver 2–3 options as screenshots in one round so Yago can choose, and keep every constraint the brief lists. Never swap the test you were asked for with a weaker one. Before calling visual work done, look at the screenshot yourself and say in one line what you checked.
3. **Small asks.** One worker, no side agents, and one push at the end.

## CI baseline

From Yago (2026-10-19).

- A docs-only change (`*.md` files and the `docs/` directory) skips the CI jobs. A path filter sets each job `if`, so the skipped check still reports.
- Pull requests run the full test suite. The suite finishes in under 2 minutes, so CI does not select affected tests. Shared code, config, and dependency changes run the full suite when that filter is on. `main` and the nightly run use the full suite.
- A change runs this workflow once. Pull requests use `pull_request`. `main` uses `push`. The nightly schedule runs the suite and does not deploy.
- Each job sets `timeout-minutes` from its run history, about 3 times the median. Storybook is 10 minutes because one browser install took 5 minutes.
- CI does not cache the pnpm store or Playwright browsers. On recorded runs the cache did not beat a fresh install.
- The full suite finishes in under 10 minutes, so CI does not shard it.
- A commit deploys production once, from the promote job. Vercel Git does not deploy `main`. A docs-only commit does not release or deploy.
