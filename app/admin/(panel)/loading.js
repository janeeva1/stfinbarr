export default function Loading() {
  return (
    <div className="page-loading" role="status" aria-live="polite" style={{ minHeight: '50vh' }}>
      <div className="page-loading-bar" />
      <div className="page-loading-cross">✝</div>
      <p>Loading…</p>
    </div>
  );
}
