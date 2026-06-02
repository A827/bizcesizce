// Shown while a page is loading. Skeleton cards keep it feeling fast.
export default function Loading() {
  return (
    <main className="shell" style={{ paddingTop: 80 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton" style={{ height: i === 0 ? 220 : 150, margin: '16px 0' }} />
      ))}
    </main>
  );
}
