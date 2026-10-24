// Shown instantly when a visitor clicks a menu link, while the page loads.
export default function Loading() {
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <div className="page-loading-bar" />
      <div className="page-loading-cross">✝</div>
      <p>Loading…</p>
    </div>
  );
}
