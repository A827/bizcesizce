'use client';
import { useEffect, useState } from 'react';

// Toggles between light and dark. The initial theme is set before paint by an
// inline script in the root layout (no flash); here we just read & flip it,
// persisting the choice to localStorage.
export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const t = (document.documentElement.dataset.theme as 'dark' | 'light') || 'dark';
    setTheme(t);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* ignore */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'light' ? '#f7f4ec' : '#0d0d0f');
    setTheme(next);
  }

  return (
    <button className="icon-btn" onClick={toggle}
      aria-label={theme === 'dark' ? 'Aydınlık moda geç' : 'Karanlık moda geç'} title="Tema">
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}
