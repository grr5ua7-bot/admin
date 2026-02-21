import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { getAllOrders } from '../services/orderService';
import { getAllUsers } from '../services/userService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const ordersResult = await getAllOrders();
      if (ordersResult.success) {
        const orders = ordersResult.orders || [];

        const pending = orders.filter(o => o.status === 'pending').length;
        const completed = orders.filter(o => o.status === 'completed').length;

        setStats({
          totalOrders: orders.length,
          pendingOrders: pending,
          completedOrders: completed,
          totalUsers: 0,
        });

        // Recent 4 orders
        setRecentOrders(orders.slice(0, 4));
      } else {
        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalUsers: 0,
        });
        setRecentOrders([]);
      }

      // Users
      const usersResult = await getAllUsers();
      if (usersResult.success) {
        setStats(prev => ({
          ...prev,
          totalUsers: usersResult.users?.length || 0,
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalUsers: 0,
      });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => `badge badge-${status}`;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString('en-GB');
    return new Date(timestamp).toLocaleDateString('en-GB');
  };

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to MASTOI SPORTS Admin Panel</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3 className="counter">{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3 className="counter">{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3 className="counter">{stats.completedOrders}</h3>
            <p>Completed Orders</p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3 className="counter">{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Recent Orders</h2>
          <a href="/orders" className="view-all-link">View All →</a>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Team Name</th>
                <th>Players</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleOrderClick(order.id)}
                    className="clickable-row"
                  >
                    <td><strong>{order.orderId || order.id.substring(0, 8).toUpperCase()}</strong></td>
                    {/* ✅ Corrected Team Name */}
                    <td>{order.teamName || 'N/A'}</td>
                    <td>{Array.isArray(order.players) ? order.players.length : Object.values(order.players || {}).length}</td>
                    <td>
                      <span className={getStatusBadge(order.status)}>{order.status}</span>
                    </td>
                    <td>{formatDate(order.createdAt || order.date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No orders yet. Create your first order!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="footer">
        Made with ❤️ by <strong>GAUTAMS Worlds</strong>
      </div>
    </div>
  );
};

export default Dashboard;
