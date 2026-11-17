export default function Loading() {
  return (
    <main id="main" className="container app-main">
      <div className="loading" role="status">
        Loading ReturnTail…
        <div className="loading-bars" aria-hidden="true">
          <div />
          <div />
          <div />
        </div>
      </div>
    </main>
  );
}
