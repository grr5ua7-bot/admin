import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeletedOrders, restoreOrder } from '../services/orderService';
import './DeleteHistory.css';

const DeleteHistory = () => {
  const navigate = useNavigate();
  const [deletedOrders, setDeletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDeletedOrders();
  }, []);

  const loadDeletedOrders = async () => {
    setLoading(true);
    try {
      const result = await getDeletedOrders();
      if (result.success) {
        setDeletedOrders(result.orders || []);
      } else {
        setDeletedOrders([]);
      }
    } catch (error) {
      console.error('Error loading deleted orders:', error);
      setDeletedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ TEAM NAME FIX (ALL POSSIBLE FIELDS)
  const getTeamName = (order) => {
    return (
      order.team ||
      order.teamName ||
      order.team_name ||
      order.teamname ||
      order.club ||
      order.teamDetails?.name ||
      'N/A'
    );
  };

  // ⭐ PLAYER NAMES FIX
  const getPlayerNames = (players) => {
    if (!players || players.length === 0) return 'N/A';

    return players
      .map((p) => {
        if (typeof p === 'string') return p;
        return p.name || p.playerName || p.fullName || 'Unknown';
      })
      .join(', ');
  };

  const filteredOrders = deletedOrders.filter((order) => {
    const orderId =
      order.orderId ||
      order.originalId?.substring(0, 8).toUpperCase() ||
      'N/A';

    const matchesSearch =
      orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTeamName(order).toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-GB');
    }
    return new Date(timestamp).toLocaleDateString('en-GB');
  };

  const handleRestore = async (orderId) => {
    const confirmRestore = window.confirm(
      'Are you sure you want to restore this order?'
    );

    if (!confirmRestore) return;

    try {
      const result = await restoreOrder(orderId);

      if (result.success) {
        alert('✅ Order restored successfully!');
        loadDeletedOrders();
      } else {
        alert(`❌ Error restoring order: ${result.error}`);
      }
    } catch (error) {
      console.error('Restore error:', error);
      alert('❌ Error restoring order!');
    }
  };

  if (loading) {
    return (
      <div className="delete-history">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading delete history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="delete-history">
      <div className="page-header">
        <div>
          <button
            className="back-btn"
            onClick={() => navigate('/orders')}
          >
            ← Back to Orders
          </button>
          <h1>📜 Delete History</h1>
          <p>View and restore deleted orders</p>
        </div>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search deleted orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Team Name</th>
                <th>Players</th>
                <th>Status</th>
                <th>Deleted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td>
                      <strong>
                        {order.orderId ||
                          order.originalId?.substring(0, 8).toUpperCase() ||
                          'N/A'}
                      </strong>
                    </td>

                    {/* ✅ TEAM NAME FIXED */}
                    <td>{getTeamName(order)}</td>

                    {/* ✅ PLAYER NAMES */}
                    <td>{getPlayerNames(order.players)}</td>

                    <td>
                      <span className={`badge badge-${order.status}`}>
                        {order.status}
                      </span>
                    </td>

                    <td>{formatDate(order.deletedAt)}</td>

                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleRestore(order.id)}
                      >
                        ↻ Restore
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    {searchTerm
                      ? 'No deleted orders match your search'
                      : 'No deleted orders in history'}
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

export default DeleteHistory;
