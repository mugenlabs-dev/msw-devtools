import { createFileRoute } from "@tanstack/react-router";

import { ContentPage } from "../components/content-page";
import { GITHUB_ISSUES_URL, SITE_NAME } from "../content/site";

const PrivacyPage = () => (
  <ContentPage description={`Privacy for ${SITE_NAME}.`} title="Privacy">
    <p>This documentation site does not require an account.</p>
    <p>
      The site uses PostHog (EU) to count page visits and catch errors. It runs without cookies or
      persistent identifiers and is not used to identify you. The npm library itself sends nothing
      to Mugenlabs.
    </p>
    <p>The library stores mock configuration in your browser and sends nothing to Mugenlabs.</p>
    <p>
      Links to GitHub, npm, and Vercel are governed by those services&apos; own privacy policies.
      Questions go through{" "}
      <a href={GITHUB_ISSUES_URL} rel="noopener noreferrer" target="_blank">
        GitHub Issues
      </a>
      . The software is provided as-is under the MIT license.
    </p>
  </ContentPage>
);

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      {
        content: `Privacy for ${SITE_NAME} — PostHog (EU) for page visits and errors; cookieless; npm library sends nothing to Mugenlabs.`,
        name: "description",
      },
    ],
    title: "Privacy · @mugenlabs/msw-devtools",
  }),
});
