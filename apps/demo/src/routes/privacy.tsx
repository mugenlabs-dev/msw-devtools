import { createFileRoute } from "@tanstack/react-router";

import { ContentPage } from "../components/content-page";
import { SITE_NAME } from "../content/site";

const PrivacyPage = () => (
  <ContentPage description={`Privacy for ${SITE_NAME}.`} title="Privacy">
    <p>This documentation site does not require an account.</p>
    <p>The project adds no analytics or tracking.</p>
    <p>The library keeps its settings in your browser and sends nothing to Mugenlabs.</p>
    <p>The software is provided as-is under the MIT license.</p>
  </ContentPage>
);

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      {
        content: `Privacy for ${SITE_NAME} — no accounts, no analytics, local browser settings only.`,
        name: "description",
      },
    ],
    title: "Privacy · @mugenlabs/msw-devtools",
  }),
});
