export default function StudyPage() {
  return (
    <section>
      <h2 className="section-title">Study Dashboard</h2>
      <p className="section-note">
        Lesson plan on the left, practice in the center, and widgets on the
        right. Mobile layout will be added later.
      </p>
      <div className="study-grid">
        <div className="study-panel">
          <h3>Plan</h3>
          <ol>
            <li>Review today’s objective.</li>
            <li>Read the theory notes.</li>
            <li>Complete the coding exercise.</li>
          </ol>
        </div>
        <div className="study-panel">
          <h3>Practice</h3>
          <p>Editor/canvas placeholder for the lesson workspace.</p>
        </div>
      </div>
    </section>
  );
}
