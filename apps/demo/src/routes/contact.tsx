import { createFileRoute } from "@tanstack/react-router";

import { ContentPage } from "../components/content-page";
import {
  GITHUB_ISSUES_URL,
  GITHUB_REPO_URL,
  NPM_URL,
  ORG_HOME_URL,
  ORG_NAME,
  SITE_NAME,
} from "../content/site";

const ContactPage = () => (
  <ContentPage
    description={`How to reach the maintainers of ${SITE_NAME}. Prefer public GitHub Issues so bug reports and questions stay searchable for other developers and agents.`}
    title="Contact"
  >
    <p>
      {SITE_NAME} is maintained by {ORG_NAME} as an open-source library. The supported contact
      channel today is the GitHub issue tracker for the project repository. Open a new issue for
      bugs, questions about the TypeScript API, docs gaps, or playground problems. Include the
      package version from npm, your MSW major version, and a minimal reproduction when you can.
    </p>
    <h2>Primary contact</h2>
    <ul>
      <li>
        GitHub Issues:{" "}
        <a href={GITHUB_ISSUES_URL} rel="noopener noreferrer" target="_blank">
          {GITHUB_ISSUES_URL}
        </a>
      </li>
      <li>
        Repository:{" "}
        <a href={GITHUB_REPO_URL} rel="noopener noreferrer" target="_blank">
          {GITHUB_REPO_URL}
        </a>
      </li>
      <li>
        Package page:{" "}
        <a href={NPM_URL} rel="noopener noreferrer" target="_blank">
          {NPM_URL}
        </a>
      </li>
      <li>
        Organization site:{" "}
        <a href={ORG_HOME_URL} rel="noopener noreferrer" target="_blank">
          {ORG_HOME_URL}
        </a>
      </li>
    </ul>
    <h2>What to expect</h2>
    <p>
      Responses happen on a best-effort basis from the maintainer. There is no paid support SLA, no
      on-call phone line published for this project, and no automated ticket portal.
      Security-sensitive reports should still use GitHub Issues with minimal public detail first, or
      follow any security policy the repository adds later. Pull requests are welcome through the
      normal GitHub contribution flow described in CONTRIBUTING.md.
    </p>
    <h2>Facts still awaiting maintainer confirmation</h2>
    <p>
      A dedicated support email, telephone number, and postal mailing address for {ORG_NAME} are not
      published on this page yet. We deliberately omit invented contact details from both this copy
      and Organization JSON-LD. Once the maintainer supplies authored values, they will appear here
      and in structured data so agents can verify legitimacy without guessing.
    </p>
  </ContentPage>
);

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      {
        content:
          "Contact Mugen Labs about @mugenlabs/msw-devtools via GitHub Issues — bugs, docs, and API questions.",
        name: "description",
      },
    ],
    title: "Contact · @mugenlabs/msw-devtools",
  }),
});
