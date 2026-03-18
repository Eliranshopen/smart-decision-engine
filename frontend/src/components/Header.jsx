import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const { pathname } = useLocation();

  const nav = [
    { to: '/',      label: 'Dashboard' },
    { to: '/news',  label: 'News Feed' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🧠</span>
          <span className="font-bold text-white text-lg tracking-tight">Smart Decision Engine</span>
        </Link>

        <nav className="flex items-center gap-6">
          {nav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors no-underline ${
                pathname === to
                  ? 'text-brand-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
