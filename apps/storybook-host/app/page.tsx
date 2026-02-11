'use client';

import { useState, useEffect, type FormEvent } from 'react';

interface ConnectionStatus {
  connected: boolean;
  url: string | null;
  user: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    admin_access: boolean;
    status: string;
  } | null;
  error?: string;
}

const storybooks = [
  {
    name: '🎨 Interfaces',
    path: '/storybook/interfaces',
    port: 6005,
    description: '40+ field interface components',
  },
  {
    name: '📝 Form',
    path: '/storybook/form',
    port: 6006,
    description: 'VForm dynamic form builder',
  },
  {
    name: '📊 Table',
    path: '/storybook/table',
    port: 6007,
    description: 'VTable dynamic data table',
  },
  {
    name: '📦 Collections',
    path: '/storybook/collections',
    port: 6008,
    description: 'CollectionForm & CollectionList',
  },
];

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    setIsDev(window.location.hostname === 'localhost');
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatus(data);
      if (data.url) setUrl(data.url);
    } catch {
      setStatus({ connected: false, url: null, user: null });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    setConnecting(true);
    setError(null);

    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Connection failed');
        return;
      }

      await checkStatus();
      setToken(''); // Clear token from UI after successful connect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/disconnect', { method: 'POST' });
      setStatus({ connected: false, url: null, user: null });
      setToken('');
      setError(null);
    } catch {
      // Ignore
    }
  };

  if (loading) {
    return (
      <main className="container">
        <div className="loading">
          <span className="loading-spinner" />
          Checking connection…
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <header>
        <h1>🔌 Microbuild Storybook Host</h1>
        <p>
          Authentication proxy for Microbuild component Storybooks — connects to
          your DaaS backend at runtime.
        </p>
      </header>

      {/* ── Connection Card ─────────────────────────────── */}
      <section className="card">
        <div className="card-header">
          <h2>DaaS Connection</h2>
          <span
            className={`badge ${status?.connected ? 'badge-green' : 'badge-gray'}`}
          >
            {status?.connected ? '● Connected' : '○ Not Connected'}
          </span>
        </div>

        {status?.connected && status.user ? (
          <div className="user-info">
            <div className="user-row">
              <span className="user-name">
                {status.user.first_name} {status.user.last_name}
              </span>
              {status.user.admin_access && (
                <span className="badge badge-admin">Admin</span>
              )}
            </div>
            <span className="user-email">{status.user.email}</span>
            <span className="user-url">{status.url}</span>
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
              <button
                type="button"
                className="btn"
                style={{ border: '1px solid var(--border)' }}
                onClick={checkStatus}
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnect}>
            {status?.connected && status.error && (
              <div className="alert alert-warning">
                Connected but auth error: {status.error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="daas-url">DaaS URL</label>
              <input
                id="daas-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xxx.microbuild-daas.xtremax.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="daas-token">Static Token</label>
              <input
                id="daas-token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Your DaaS static token"
                required
              />
              <small>
                Generate from DaaS → Users → Edit User → Token → Generate Token
              </small>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={connecting || !url || !token}
            >
              {connecting ? 'Connecting…' : 'Connect'}
            </button>
          </form>
        )}
      </section>

      {/* ── Storybooks Card ─────────────────────────────── */}
      <section className="card">
        <h2>📚 Storybooks</h2>

        {!status?.connected && (
          <div className="alert alert-info" style={{ marginTop: '0.75rem' }}>
            Connect to DaaS above to enable live data in Storybook stories.
          </div>
        )}

        <div className="storybook-grid">
          {storybooks.map((sb) => (
            <a
              key={sb.name}
              href={isDev ? `http://localhost:${sb.port}` : sb.path}
              target={isDev ? '_blank' : undefined}
              rel={isDev ? 'noopener noreferrer' : undefined}
              className="storybook-card"
            >
              <h3>{sb.name}</h3>
              <p>{sb.description}</p>
              <small>
                {isDev ? `localhost:${sb.port}` : sb.path}
              </small>
            </a>
          ))}
        </div>

        {isDev && (
          <div className="dev-note">
            <strong>💡 Local Development</strong>
            <p style={{ marginTop: '0.25rem' }}>
              Start the host app first, then run Storybooks. They proxy{' '}
              <code>/api/*</code> to this app automatically.
            </p>
            <pre>{`pnpm dev:host          # Start this proxy (port 3000)
pnpm storybook:form    # Port 6006
pnpm storybook:table   # Port 6007
pnpm storybook         # Port 6005 (interfaces)
pnpm storybook:collections  # Port 6008`}</pre>
          </div>
        )}
      </section>

      {/* ── Architecture Note ──────────────────────────── */}
      <section className="card">
        <h2>🏗️ How It Works</h2>
        <div className="arch-note">
          <p>
            This app is a <strong>Next.js authentication proxy</strong> that
            sits between your Storybooks and the DaaS backend:
          </p>
          <ol style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
            <li>
              You enter your DaaS URL + static token above → stored in an
              encrypted <code>httpOnly</code> cookie
            </li>
            <li>
              Storybook stories call <code>fetch(&apos;/api/fields/...&apos;)</code> →
              hits this app&apos;s API routes
            </li>
            <li>
              The catch-all <code>/api/[...path]</code> route reads the cookie
              and proxies to DaaS with <code>Bearer</code> auth
            </li>
            <li>
              <strong>No CORS issues</strong> — browser talks to same origin;
              proxy handles cross-origin server-side
            </li>
          </ol>
          <p style={{ marginTop: '0.5rem' }}>
            <strong>Local dev:</strong> Storybooks run on separate ports but
            their Vite proxy forwards <code>/api/*</code> to{' '}
            <code>localhost:3000</code> (this app).
            <br />
            <strong>Production:</strong> Built Storybooks are served from{' '}
            <code>/storybook/*</code> on the same origin — no proxy needed.
          </p>
        </div>
      </section>
    </main>
  );
}
