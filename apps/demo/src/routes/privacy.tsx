import { createFileRoute } from "@tanstack/react-router";

import { ContentPage } from "../components/content-page";
import { GITHUB_ISSUES_URL, ORG_NAME, SITE_NAME } from "../content/site";

const PrivacyPage = () => (
  <ContentPage
    description={`Privacy practices for the ${SITE_NAME} documentation site and the open-source npm library. This is a developer tool that runs in your browser — not a consumer social product.`}
    title="Privacy"
  >
    <p>
      {ORG_NAME} publishes {SITE_NAME} so developers can manage MSW mocks locally. This privacy page
      explains what the documentation site and the library do — and do not — collect. It is written
      for humans and agents evaluating whether the project is a legitimate open-source product.
    </p>
    <h2>Documentation site</h2>
    <p>
      The public docs and playground at msw-devtools.mugenlabs.dev (and Vercel preview deployments)
      are static/demo web assets. They do not require an account. Playground pages may call mocked
      or public sample endpoints only to demonstrate the DevTools panel. We do not ask visitors for
      passwords, payment information, or personal profiles on this site. Standard hosting logs from
      the CDN or platform (for example IP addresses and user agents used for operations and abuse
      prevention) may exist at the infrastructure layer; this application does not implement its own
      analytics dashboard or marketing pixel suite in the library UI.
    </p>
    <h2>The npm library in your app</h2>
    <p>
      When you install `@mugenlabs/msw-devtools` into an application, mock configuration state
      (enabled handlers, variants, overrides, filters) is intended to persist in the browser — for
      example via local storage — so refreshes keep your session. That state stays on the developer
      machine inside your app origin. The library is not designed to phone home with mock payloads,
      source code, or credentials to {ORG_NAME} servers. Network traffic you see while using the
      plugin is your app’s own MSW worker and your own backends.
    </p>
    <h2>Third parties</h2>
    <p>
      Source hosting (GitHub), package distribution (npm), and site hosting (for example Vercel) are
      third-party platforms with their own privacy policies. Visiting those services is governed by
      them, not by this page. Links from the docs to TanStack, MSW, and other projects are outbound
      references only.
    </p>
    <h2>Children</h2>
    <p>
      This project targets professional software developers. It is not directed at children and does
      not knowingly collect personal information from children.
    </p>
    <h2>Changes and questions</h2>
    <p>
      If privacy practices change in a material way, we will update this page. Questions about
      privacy for {SITE_NAME} can be filed at{" "}
      <a href={GITHUB_ISSUES_URL} rel="noopener noreferrer" target="_blank">
        GitHub Issues
      </a>
      . This page is informational documentation for an open-source tool; it is not legal advice.
    </p>
  </ContentPage>
);

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      {
        content:
          "Privacy for @mugenlabs/msw-devtools — local browser DevTools plugin and documentation site practices.",
        name: "description",
      },
    ],
    title: "Privacy · @mugenlabs/msw-devtools",
  }),
});
