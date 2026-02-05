import type { ReactNode } from "react";
import "./globals.css";
import { WidgetsArea } from "../../../shared/widgets/WidgetsArea";
import { PomodoroWidget } from "../../../shared/widgets/PomodoroWidget";
import { ActivityWidget } from "../../../shared/widgets/ActivityWidget";

const widgets = [
  {
    key: "pomodoro",
    title: "Pomodoro",
    element: <PomodoroWidget />,
  },
  {
    key: "activity",
    title: "Activity",
    element: <ActivityWidget />,
  },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <h1>Life Dashboard</h1>
            <nav>
              <a href="/main">Main</a>
              <a href="/study">Study</a>
            </nav>
            <span className="badge">Local-first</span>
          </aside>
          <main className="main-content">{children}</main>
          <WidgetsArea widgets={widgets} />
        </div>
      </body>
    </html>
  );
}
