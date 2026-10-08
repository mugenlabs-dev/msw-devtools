import { createFileRoute } from "@tanstack/react-router";

import { ContentPage } from "../components/content-page";
import { GITHUB_ISSUES_URL, SITE_NAME } from "../content/site";

const ContactPage = () => (
  <ContentPage description={`How to reach the maintainers of ${SITE_NAME}.`} title="Contact">
    <p>
      Open a{" "}
      <a href={GITHUB_ISSUES_URL} rel="noopener noreferrer" target="_blank">
        GitHub Issue
      </a>{" "}
      on the project repository. That is the only contact method. This is an open-source project
      with no support guarantees.
    </p>
  </ContentPage>
);

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      {
        content: `Contact ${SITE_NAME} via GitHub Issues.`,
        name: "description",
      },
    ],
    title: "Contact · @mugenlabs/msw-devtools",
  }),
});
