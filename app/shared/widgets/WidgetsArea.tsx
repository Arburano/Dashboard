import type { ReactNode } from "react";

interface WidgetEntry {
  key: string;
  title: string;
  element: ReactNode;
}

export function WidgetsArea({ widgets }: { widgets: WidgetEntry[] }) {
  return (
    <aside className="widgets-area">
      <h2>Widgets</h2>
      {widgets.map((widget) => (
        <section className="widget-card" key={widget.key}>
          <h3>{widget.title}</h3>
          {widget.element}
        </section>
      ))}
    </aside>
  );
}
