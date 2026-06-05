import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [longUrl, setLongUrl] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(null);

  // Toggle state for each advanced option
  const [showAlias, setShowAlias] = useState(false);
  const [showExpiry, setShowExpiry] = useState(false);
  const [showClicks, setShowClicks] = useState(false);

  // Field values — only sent if toggle is on
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxClicks, setMaxClicks] = useState('');

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'https://url-shortener-dmyt.onrender.com';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchUrls(token);
    }
  }, [navigate]);

  const fetchUrls = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/myurls`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUrls(res.data.urls);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setError('');
    try {
      const payload = {
        originalUrl: longUrl,
        customAlias: showAlias && customAlias ? customAlias : undefined,
        maxClicks: showClicks && maxClicks ? parseInt(maxClicks) : undefined,
        expiresAt: showExpiry && expiresAt ? new Date(expiresAt).toISOString() : undefined,
      };
      await axios.post(`${API_URL}/shorten`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Reset form
      setLongUrl('');
      setCustomAlias('');
      setExpiresAt('');
      setMaxClicks('');
      setShowAlias(false);
      setShowExpiry(false);
      setShowClicks(false);
      fetchUrls(token);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to shorten URL. Please try again.');
      }
    }
  };

  const handleCopy = (shortCode) => {
    const fullUrl = `${API_URL}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(shortCode);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const formatExpiry = (val) => {
    if (!val) return 'Never';
    const d = new Date(val);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="db-root">
      {/* Navbar */}
      <header className="db-nav">
        <div className="db-nav-logo">
          <span className="db-nav-icon">&#9889;</span>
          <span className="db-nav-brand">Url Shortener</span>
        </div>
        <div className="db-nav-right">
          <span className="db-nav-email">{user?.email}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <main className="db-main">
        {/* Create card */}
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Create new link</div>
              <div className="db-card-sub">Shorten any URL with optional advanced controls</div>
            </div>
          </div>

          {error && (
            <div className="db-error">
              <span className="db-error-icon">&#9888;</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="db-form">
            {/* Main URL input */}
            <div className="db-input-wrap">
              <span className="db-input-icon">&#128279;</span>
              <input
                type="url"
                className="db-input"
                placeholder="Paste long URL here (https://...)"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                required
              />
            </div>

            {/* Toggle chips */}
            <div className="db-advanced-section">
              <div className="db-advanced-label">Advanced options</div>
              <div className="db-chips">
                <button
                  type="button"
                  className={`db-chip ${showAlias ? 'db-chip-on' : ''}`}
                  onClick={() => setShowAlias(v => !v)}
                >
                  <span className="db-chip-dot" />
                  <span>Custom alias</span>
                  <span className={`db-chip-toggle ${showAlias ? 'db-chip-toggle-on' : ''}`}>
                    <span className="db-chip-knob" />
                  </span>
                </button>

                <button
                  type="button"
                  className={`db-chip ${showExpiry ? 'db-chip-on' : ''}`}
                  onClick={() => setShowExpiry(v => !v)}
                >
                  <span className="db-chip-dot" />
                  <span>Expiry date</span>
                  <span className={`db-chip-toggle ${showExpiry ? 'db-chip-toggle-on' : ''}`}>
                    <span className="db-chip-knob" />
                  </span>
                </button>

                <button
                  type="button"
                  className={`db-chip ${showClicks ? 'db-chip-on' : ''}`}
                  onClick={() => setShowClicks(v => !v)}
                >
                  <span className="db-chip-dot" />
                  <span>Click limit</span>
                  <span className={`db-chip-toggle ${showClicks ? 'db-chip-toggle-on' : ''}`}>
                    <span className="db-chip-knob" />
                  </span>
                </button>
              </div>
            </div>

            {/* Expanded fields — only render when toggled on */}
            <div className={`db-expanded ${showAlias || showExpiry || showClicks ? 'db-expanded-open' : ''}`}>
              {showAlias && (
                <div className="db-field-group">
                  <label className="db-field-label">Custom alias</label>
                  <div className="db-input-wrap">
                    <span className="db-input-icon">@</span>
                    <input
                      type="text"
                      className="db-input"
                      placeholder="my-custom-link"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      minLength={4}
                      maxLength={20}
                      pattern="[a-zA-Z0-9\-]+"
                    />
                  </div>
                  <span className="db-field-hint">4–20 characters, letters, numbers and hyphens only</span>
                </div>
              )}

              {showExpiry && (
                <div className="db-field-group">
                  <label className="db-field-label">Expiry date and time</label>
                  <div className="db-input-wrap">
                    <span className="db-input-icon">&#128337;</span>
                    <input
                      type="datetime-local"
                      className="db-input"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <span className="db-field-hint">Link returns 410 Gone after this date and time</span>
                </div>
              )}

              {showClicks && (
                <div className="db-field-group">
                  <label className="db-field-label">Maximum clicks</label>
                  <div className="db-input-wrap">
                    <span className="db-input-icon">&#128200;</span>
                    <input
                      type="number"
                      className="db-input"
                      placeholder="e.g. 100"
                      value={maxClicks}
                      onChange={(e) => setMaxClicks(e.target.value)}
                      min={1}
                    />
                  </div>
                  <span className="db-field-hint">Link returns 410 Gone after this many clicks</span>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary">Shorten link</button>
          </form>
        </div>

        {/* Links table */}
        <div className="db-table-section">
          <div className="db-table-header">
            <h3 className="db-table-title">Your links</h3>
            <span className="db-table-count">{urls.length} link{urls.length !== 1 ? 's' : ''}</span>
          </div>

          {urls.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">&#128279;</div>
              <div className="db-empty-text">No links yet. Create one above!</div>
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Original URL</th>
                    <th>Short link</th>
                    <th>Clicks</th>
                    <th>Limit</th>
                    <th>Expires</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((url) => (
                    <tr key={url.id}>
                      <td>
                        <span className="db-url-truncate" title={url.original_url}>
                          {url.original_url}
                        </span>
                      </td>
                      <td>
                        <a
                          href={`${API_URL}/${url.short_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="db-short-link"
                        >
                          /{url.short_code}
                        </a>
                      </td>
                      <td>
                        <span className="db-badge db-badge-blue">{url.click_count}</span>
                      </td>
                      <td>
                        <span className="db-badge db-badge-gray">
                          {url.max_clicks ? url.max_clicks : '∞'}
                        </span>
                      </td>
                      <td>
                        <span className={`db-expiry ${url.expires_at && new Date(url.expires_at) < new Date() ? 'db-expiry-dead' : ''}`}>
                          {formatExpiry(url.expires_at)}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn-copy ${copied === url.short_code ? 'btn-copy-done' : ''}`}
                          onClick={() => handleCopy(url.short_code)}
                          title="Copy short link"
                        >
                          {copied === url.short_code ? '✓ Copied' : 'Copy'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;