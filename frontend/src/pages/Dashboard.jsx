import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [longUrl, setLongUrl] = useState('');
  
  // New state variables for the advanced features
  const [customAlias, setCustomAlias] = useState('');
  const [maxClicks, setMaxClicks] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Use environment variable if available, otherwise fallback to Render URL
  const API_URL = import.meta.env.VITE_API_URL || 'https://url-shortener-dmyt.onrender.com';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData)); // Load user info (email)
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
    setError(''); // Clear previous errors

    try {
      // Construct the payload, setting empty fields to undefined so the DB saves them as NULL
      const payload = { 
        originalUrl: longUrl,
        customAlias: customAlias ? customAlias : undefined,
        maxClicks: maxClicks ? parseInt(maxClicks) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined
      };

      await axios.post(`${API_URL}/shorten`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Clear the form on success
      setLongUrl('');
      setCustomAlias('');
      setMaxClicks('');
      setExpiresAt('');
      
      fetchUrls(token);
    } catch (err) {
      // Display the specific error from the backend (e.g., "Custom alias is already in use")
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to shorten URL');
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token'); // Clear the Badge
      localStorage.removeItem('user');  // Clear user data
      navigate('/login'); // Kick them out
    }
  };

  return (
    <div className="container">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <div className="user-info">
          <span>{user?.email}</span>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </div>
      
      {/* Create Link Section */}
      <div className="card">
        <h3>Create New Link</h3>
        {error && <p className="error-text" style={{color: 'red', fontWeight: 'bold'}}>{error}</p>}
        
        <form onSubmit={handleSubmit} className="create-form">
          <div style={{ marginBottom: '10px' }}>
            <input 
              type="url" 
              placeholder="Paste long URL here (https://...)" 
              value={longUrl} 
              onChange={(e) => setLongUrl(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            />
          </div>
          
          {/* Advanced Options Row */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Custom Alias (optional)" 
              value={customAlias} 
              onChange={(e) => setCustomAlias(e.target.value)} 
              style={{ flex: '1 1 150px', padding: '8px' }}
            />
            <input 
              type="number" 
              placeholder="Max Clicks (optional)" 
              value={maxClicks} 
              onChange={(e) => setMaxClicks(e.target.value)} 
              min="1"
              style={{ flex: '1 1 150px', padding: '8px' }}
            />
            <input 
              type="datetime-local" 
              value={expiresAt} 
              onChange={(e) => setExpiresAt(e.target.value)} 
              style={{ flex: '1 1 150px', padding: '8px' }}
              title="Expiration Date (optional)"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Shorten Link</button>
        </form>
      </div>

      {/* List Section */}
      <h3>Your Links</h3>
      {urls.length === 0 ? <p>No links yet. Create one above!</p> : (
        <div className="table-responsive">
          <table className="url-table" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Original URL</th>
                <th>Short Link</th>
                <th>Clicks</th>
                <th>Click Limit</th>
                <th>Expires At</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => (
                <tr key={url.id}>
                  <td className="truncate" title={url.original_url} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;