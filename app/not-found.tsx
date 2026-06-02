import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="shell" style={{ paddingTop: 100, textAlign: 'center' }}>
      <div className="serif" style={{ fontSize: 40 }}>404</div>
      <p className="muted">Sayfa bulunamadı · Page not found</p>
      <Link href="/" className="btn btn-accent" style={{ marginTop: 16, display: 'inline-flex' }}>
        Ana sayfa · Home
      </Link>
    </main>
  );
}
