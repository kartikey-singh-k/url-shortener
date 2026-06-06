import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import myLogo from '../assets/logo.png';
const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [longUrl, setLongUrl] = useState('');
  
  // Advanced features state variables
  const [customAlias, setCustomAlias] = useState('');
  const [maxClicks, setMaxClicks] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Toggle state variables for the advanced fields
  const [showAlias, setShowAlias] = useState(false);
  const [showClicks, setShowClicks] = useState(false);
  const [showExpiry, setShowExpiry] = useState(false);
  
  const [qrCode, setQrCode] = useState(null);
  const [activeShortCode, setActiveShortCode] = useState('');
  
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
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
      // Only send the advanced data if the toggle is actually turned ON
      const payload = { 
        originalUrl: longUrl,
        customAlias: (showAlias && customAlias) ? customAlias : undefined,
        maxClicks: (showClicks && maxClicks) ? parseInt(maxClicks) : undefined,
        expiresAt: (showExpiry && expiresAt) ? new Date(expiresAt).toISOString() : undefined
      };

      await axios.post(`${API_URL}/shorten`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Clear the form and reset toggles on success
      setLongUrl('');
      setCustomAlias('');
      setMaxClicks('');
      setExpiresAt('');
      setShowAlias(false);
      setShowClicks(false);
      setShowExpiry(false);
      
      fetchUrls(token);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to shorten URL');
      }
    }
  };

  const handleGetQr = async (shortCode) => {
    try {
      const res = await axios.get(`${API_URL}/qr/${shortCode}`);
      setQrCode(res.data.qrCode);
      setActiveShortCode(shortCode);
    } catch (err) {
      console.error('Failed to get QR code', err);
      alert('Could not generate QR code at this time.');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token'); 
      localStorage.removeItem('user');  
      navigate('/login'); 
    }
  };

  return (
    <div className="container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="brand-container">
          <img src={myLogo} alt="Logo" className="nav-logo" />
          <h1>Dashboard</h1>
        </div>

        <div className="user-info">
          <span>{user?.email}</span>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </div>
      
      {/* Create Link Section */}
      <div className="card">
        <h3>Create New Link</h3>
        {error && <p className="error-text">{error}</p>}
        
        <form onSubmit={handleSubmit} className="create-form">
          
          <input 
            type="url" 
            placeholder="Paste long URL here (https://...)" 
            value={longUrl} 
            onChange={(e) => setLongUrl(e.target.value)} 
            required 
          />

          {/* Cleaned up Toggles using CSS classes */}
          <div className="toggle-group">
            <button 
              type="button" 
              className={`toggle-btn ${showAlias ? 'active' : ''}`}
              onClick={() => setShowAlias(!showAlias)}
            >
              {showAlias ? '✓ Custom Alias' : '+ Custom Alias'}
            </button>

            <button 
              type="button" 
              className={`toggle-btn ${showClicks ? 'active' : ''}`}
              onClick={() => setShowClicks(!showClicks)}
            >
              {showClicks ? '✓ Max Clicks' : '+ Max Clicks'}
            </button>

            <button 
              type="button" 
              className={`toggle-btn ${showExpiry ? 'active' : ''}`}
              onClick={() => {
                setShowExpiry(!showExpiry);
                // Fix for the HTML datetime-local input bug
                if (!showExpiry && !expiresAt) {
                  const tomorrow = new Date();
                  tomorrow.setHours(tomorrow.getHours() + 24);
                  setExpiresAt(tomorrow.toISOString().slice(0, 16));
                }
              }}
            >
              {showExpiry ? '✓ Expiry Date' : '+ Expiry Date'}
            </button>
          </div>
          
          {(showAlias || showClicks || showExpiry) && (
            <div className="options-grid">
              {showAlias && (
                <input 
                  type="text" 
                  placeholder="Custom Alias (e.g. summer-sale)" 
                  value={customAlias} 
                  onChange={(e) => setCustomAlias(e.target.value)} 
                />
              )}
              
              {showClicks && (
                <input 
                  type="number" 
                  placeholder="Max Clicks (e.g. 100)" 
                  value={maxClicks} 
                  onChange={(e) => setMaxClicks(e.target.value)} 
                  min="1"
                />
              )}
              
              {showExpiry && (
                <input 
                  type="datetime-local" 
                  value={expiresAt} 
                  onChange={(e) => setExpiresAt(e.target.value)} 
                  title="Expiration Date"
                />
              )}
            </div>
          )}

          <button type="submit" className="btn btn-primary">Shorten Link</button>
        </form>
      </div>

      {/* List Section */}
      <h3>Your Links</h3>
      {urls.length === 0 ? <p>No links yet. Create one above!</p> : (
        <div className="table-responsive">
          <table className="url-table">
            <thead>
              <tr>
                <th>Original URL</th>
                <th>Short Link</th>
                <th>Clicks</th>
                <th>Click Limit</th>
                <th>Expires At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => (
                <tr key={url.id}>
                  <td className="truncate" title={url.original_url}>
                    {url.original_url}
                  </td>
                  <td>
                    <a href={`${API_URL}/${url.short_code}`} target="_blank" rel="noopener noreferrer">
                      {API_URL.replace('https://', '')}/{url.short_code}
                    </a>
                  </td>
                  <td>{url.click_count}</td>
                  <td>{url.max_clicks ? url.max_clicks : '∞'}</td>
                  <td>{url.expires_at ? new Date(url.expires_at).toLocaleString() : 'Never'}</td>
                  <td>
                    <button 
                      type="button"
                      className="btn-secondary" 
                      onClick={() => handleGetQr(url.short_code)}
                    >
                      📱 QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {qrCode && (
        <div className="modal-overlay" onClick={() => setQrCode(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '15px' }}>Scan to Visit</h3>
            <img 
              src={qrCode} 
              alt="QR Code" 
              style={{ borderRadius: '12px', border: '1px solid var(--border)', maxWidth: '100%' }} 
            />
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {/* Native HTML5 Download Attribute */}
              <a 
                href={qrCode} 
                download={`qr-${activeShortCode}.png`} 
                className="btn btn-primary" 
                style={{ textDecoration: 'none' }}
              >
                ⬇️ Download
              </a>
              <button 
                className="btn btn-danger" 
                onClick={() => setQrCode(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;