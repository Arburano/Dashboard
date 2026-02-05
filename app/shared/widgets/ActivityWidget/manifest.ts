import type { WidgetManifest } from "../../types";

export const activityWidgetManifest: WidgetManifest = {
  key: "activity",
  title: "Activity",
  minHeight: 120,
  eventsHandled: ["session:start", "session:finish"],
};
