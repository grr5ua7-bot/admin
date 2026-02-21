import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Settings-new.css';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('site');
  const [loading, setLoading] = useState(false);

  // Site Configuration
  const [siteName, setSiteName] = useState('MASTOI SPORTS');
  const [contactEmail, setContactEmail] = useState('support@mastoisports.com');
  const [contactPhone, setContactPhone] = useState('0331-3932109');
  const [address, setAddress] = useState('Shahdad Kot');

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);

  // Database Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalChats: 0,
    deletedOrders: 0
  });

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsRef = doc(db, 'adminSettings', 'config');
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setSiteName(data.siteName || 'MASTOI SPORTS');
        setContactEmail(data.contactEmail || 'support@mastoisports.com');
        setContactPhone(data.contactPhone || '0331-3932109');
        setAddress(data.address || 'Shahdad Kot');
        setEmailNotifications(data.emailNotifications ?? true);
        setOrderNotifications(data.orderNotifications ?? true);
        setChatNotifications(data.chatNotifications ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const usersSnap = await getDocs(collection(db, 'users'));
      const chatsSnap = await getDocs(collection(db, 'chats'));
      const deletedSnap = await getDocs(collection(db, 'deletedOrders'));

      setStats({
        totalOrders: ordersSnap.size,
        totalUsers: usersSnap.size,
        totalChats: chatsSnap.size,
        deletedOrders: deletedSnap.size
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveSiteSettings = async () => {
    setLoading(true);
    try {
      const settingsRef = doc(db, 'adminSettings', 'config');
      await setDoc(settingsRef, {
        siteName,
        contactEmail,
        contactPhone,
        address,
        emailNotifications,
        orderNotifications,
        chatNotifications,
        updatedAt: new Date()
      });
      alert('✅ Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Error saving settings!');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const orders = [];
      ordersSnap.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });

      const dataStr = JSON.stringify(orders, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mastoi-orders-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      alert('✅ Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('❌ Error exporting data!');
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert('✅ Cache cleared! Please refresh the page.');
  };

  const handleLogoutAllDevices = async () => {
    if (window.confirm('⚠️ This will log you out. Continue?')) {
      try {
        await signOut(auth);
        navigate('/login');
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
  };

  return (
    <div className="settings">
      <div className="page-header">
        <div>
          <h1>⚙️ Settings</h1>
          <p>Manage your admin panel configuration</p>
        </div>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab-btn ${activeTab === 'site' ? 'active' : ''}`}
          onClick={() => setActiveTab('site')}
        >
          🏢 Site Config
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
        <button
          className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => setActiveTab('database')}
        >
          💾 Database
        </button>
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security
        </button>
      </div>

      {/* Site Configuration Tab */}
      {activeTab === 'site' && (
        <div className="card settings-card">
          <h2>🏢 Site Configuration</h2>
          <p className="section-description">Update your business information</p>

          <div className="settings-form">
            <div className="input-group">
              <label>Business Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="MASTOI SPORTS"
              />
            </div>

            <div className="input-group">
              <label>Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="support@mastoisports.com"
              />
            </div>

            <div className="input-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="0331-3932109"
              />
            </div>

            <div className="input-group">
              <label>Business Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shahdad Kot"
              />
            </div>

            <button 
              className="btn btn-primary btn-lg"
              onClick={saveSiteSettings}
              disabled={loading}
            >
              {loading ? '💾 Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card settings-card">
          <h2>🔔 Notification Preferences</h2>
          <p className="section-description">Manage your notification settings</p>

          <div className="settings-toggles">
            <div className="toggle-item">
              <div className="toggle-info">
                <h4>📧 Email Notifications</h4>
                <p>Receive email alerts for important events</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>📦 New Order Alerts</h4>
                <p>Get notified when customers place new orders</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={orderNotifications}
                  onChange={(e) => setOrderNotifications(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>💬 Chat Messages</h4>
                <p>Receive alerts for new customer messages</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={chatNotifications}
                  onChange={(e) => setChatNotifications(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <button 
            className="btn btn-primary btn-lg"
            onClick={saveSiteSettings}
            disabled={loading}
          >
            {loading ? '💾 Saving...' : '💾 Save Preferences'}
          </button>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="card settings-card">
          <h2>💾 Database Management</h2>
          <p className="section-description">Backup and manage your data</p>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>{stats.totalOrders}</h3>
                <p>Total Orders</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <h3>{stats.totalChats}</h3>
                <p>Chat Messages</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🗑️</div>
              <div className="stat-content">
                <h3>{stats.deletedOrders}</h3>
                <p>Deleted Orders</p>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={handleExportData}>
              📥 Export All Data (JSON)
            </button>
            <button className="btn btn-outline" onClick={loadStats}>
              🔄 Refresh Stats
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="card settings-card">
          <h2>🔒 Security & Privacy</h2>
          <p className="section-description">Manage security settings</p>

          <div className="security-actions">
            <div className="security-item">
              <div className="security-icon">🗑️</div>
              <div className="security-info">
                <h4>Clear Cache</h4>
                <p>Clear all cached data from your browser</p>
                <button className="btn btn-outline" onClick={handleClearCache}>
                  Clear Cache
                </button>
              </div>
            </div>

            <div className="security-item">
              <div className="security-icon">🚪</div>
              <div className="security-info">
                <h4>Logout All Devices</h4>
                <p>Sign out from all devices for security</p>
                <button className="btn btn-danger" onClick={handleLogoutAllDevices}>
                  Logout Everywhere
                </button>
              </div>
            </div>

            <div className="security-item">
              <div className="security-icon">🔑</div>
              <div className="security-info">
                <h4>Change Password</h4>
                <p>Update your admin password</p>
                <button className="btn btn-outline" onClick={() => alert('Password change feature coming soon!')}>
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card info-card">
        <div className="info-icon">💡</div>
        <div className="info-content">
          <h3>Quick Tips</h3>
          <p>
            <strong>📊 Regular Backups:</strong> Export your data regularly to prevent data loss<br/>
            <strong>🔔 Stay Updated:</strong> Keep notifications enabled for important alerts<br/>
            <strong>🔒 Security First:</strong> Clear cache and logout periodically for better security
          </p>
        </div>
      </div>

      <div className="footer">
        Made with ❤️ by <strong>GAUTAMS Worlds</strong>
      </div>
    </div>
  );
};

export default Settings;