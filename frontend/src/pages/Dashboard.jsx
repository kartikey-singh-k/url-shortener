import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [longUrl, setLongUrl] = useState('');
  
  // Advanced features state variables
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
        {error && <p className="error-text">{error}</p>}
        
        {/* ✅ CLEANED UP FORM: CSS handles the layout now */}
        <form onSubmit={handleSubmit} className="create-form">
          
          <input 
            type="url" 
            placeholder="Paste long URL here (https://...)" 
            value={longUrl} 
            onChange={(e) => setLongUrl(e.target.value)} 
            required 
          />
          
          {/* Advanced Options Grid */}
          <div className="options-grid">
            <input 
              type="text" 
              placeholder="Custom Alias (optional)" 
              value={customAlias} 
              onChange={(e) => setCustomAlias(e.target.value)} 
            />
            <input 
              type="number" 
              placeholder="Max Clicks (optional)" 
              value={maxClicks} 
              onChange={(e) => setMaxClicks(e.target.value)} 
              min="1"
            />
            <input 
              type="datetime-local" 
              value={expiresAt} 
              onChange={(e) => setExpiresAt(e.target.value)} 
              title="Expiration Date (optional)"
            />
          </div>

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