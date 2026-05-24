// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [longUrl, setLongUrl] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
      const res = await axios.get('https://url-shortener-dmyt.onrender.com/myurls', { 
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
    try {
      await axios.post('https://url-shortener-dmyt.onrender.com/shorten', 
        { originalUrl: longUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLongUrl('');
      fetchUrls(token);
    } catch (err) {
      setError('Failed to shorten URL');
    }
  };

  // ✅ NEW: Logout Function
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
        <form onSubmit={handleSubmit} className="create-form">
          <input 
            type="url" 
            placeholder="Paste long URL here (https://...)" 
            value={longUrl} 
            onChange={(e) => setLongUrl(e.target.value)} 
            required 
          />
          <button type="submit" className="btn btn-primary">Shorten</button>
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
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => (
                <tr key={url.id}>
                  <td className="truncate" title={url.original_url}>{url.original_url}</td>
                  <td>
                    <a href={`https://url-shortener-dmyt.onrender.com/${url.short_code}`} target="_blank" rel="noopener noreferrer">
                      https://url-shortener-dmyt.onrender.com/{url.short_code}
                    </a>
                  </td>
                  <td>{url.click_count}</td>
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