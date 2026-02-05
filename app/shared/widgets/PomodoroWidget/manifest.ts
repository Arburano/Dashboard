import type { WidgetManifest } from "../../types";

export const pomodoroWidgetManifest: WidgetManifest = {
  key: "pomodoro",
  title: "Pomodoro",
  minHeight: 120,
  eventsHandled: ["session:start", "timer:tick", "session:finish"],
};
