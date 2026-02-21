import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrders, deleteMultipleOrders } from '../services/orderService';
import './AllOrders.css';

const AllOrders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showDeleteMode, setShowDeleteMode] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await getAllOrders();
      if (result.success) {
        setOrders(result.orders || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED — team name search for ALL possible fields
  const filteredOrders = orders.filter((order) => {
    const orderId = order.orderId || order.id.substring(0, 8).toUpperCase();

    const teamName =
      order.team?.name ||
      order.teamName ||
      order.team_name ||
      order.team ||
      '';

    const matchesSearch =
      orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teamName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    return `badge badge-${status}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-GB');
    }
    return new Date(timestamp).toLocaleDateString('en-GB');
  };

  const handleOrderClick = (orderId) => {
    if (!showDeleteMode) {
      navigate(`/orders/${orderId}`);
    }
  };

  const handleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0) {
      alert('Please select orders to delete!');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedOrders.length} order(s)?\n\nThey will be moved to Delete History.`
    );

    if (!confirmDelete) return;

    try {
      const result = await deleteMultipleOrders(selectedOrders);

      if (result.success) {
        alert(`✅ Successfully deleted ${result.deletedCount} order(s)!`);
        setSelectedOrders([]);
        setShowDeleteMode(false);
        loadOrders();
      } else {
        alert(`❌ Error deleting orders: ${result.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Error deleting orders!');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteMode(false);
    setSelectedOrders([]);
  };

  if (loading) {
    return (
      <div className="all-orders">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-orders">
      <div className="page-header">
        <div>
          <h1>📦 All Orders</h1>
          <p>Manage and track your jersey orders</p>
        </div>

        <div className="header-actions">
          {!showDeleteMode ? (
            <button
              className="btn btn-danger"
              onClick={() => setShowDeleteMode(true)}
            >
              🗑️ Delete Orders
            </button>
          ) : (
            <>
              <button
                className="btn btn-danger"
                onClick={handleDeleteSelected}
                disabled={selectedOrders.length === 0}
              >
                Delete Selected ({selectedOrders.length})
              </button>

              <button className="btn btn-outline" onClick={handleCancelDelete}>
                Cancel
              </button>
            </>
          )}

          <button
            className="btn btn-secondary"
            onClick={() => navigate('/history')}
          >
            📜 Delete History
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search by Order ID or Team Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Orders
          </button>

          <button
            className={`filter-btn ${
              filterStatus === 'pending' ? 'active' : ''
            }`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </button>

          <button
            className={`filter-btn ${
              filterStatus === 'processing' ? 'active' : ''
            }`}
            onClick={() => setFilterStatus('processing')}
          >
            Processing
          </button>

          <button
            className={`filter-btn ${
              filterStatus === 'completed' ? 'active' : ''
            }`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {showDeleteMode && (
        <div className="delete-mode-banner">
          <span>🗑️ Delete Mode Active - Select orders to delete</span>

          <button className="select-all-btn" onClick={handleSelectAll}>
            {selectedOrders.length === filteredOrders.length
              ? '☑️ Deselect All'
              : '☐ Select All'}
          </button>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {showDeleteMode && <th>Select</th>}
                <th>Order ID</th>
                <th>Team Name</th>
                <th>Players</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => {
                  const teamName =
                    order.team?.name ||
                    order.teamName ||
                    order.team_name ||
                    order.team ||
                    'N/A';

                  return (
                    <tr
                      key={order.id}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => handleOrderClick(order.id)}
                      className={`clickable-row ${
                        selectedOrders.includes(order.id) ? 'selected' : ''
                      }`}
                    >
                      {showDeleteMode && (
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                            className="order-checkbox"
                          />
                        </td>
                      )}

                      <td>
                        <strong>
                          {order.orderId ||
                            order.id.substring(0, 8).toUpperCase()}
                        </strong>
                      </td>

                      {/* ✅ TEAM NAME FIX */}
                      <td>{teamName}</td>

                      <td>{order.players?.length || 0}</td>

                      <td>
                        <span className={getStatusBadge(order.status)}>
                          {order.status}
                        </span>
                      </td>

                      <td>
                        {formatDate(order.createdAt || order.date)}
                      </td>

                      <td>
                        <button
                          className="btn-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderClick(order.id);
                          }}
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={showDeleteMode ? '7' : '6'}
                    className="no-data"
                  >
                    {searchTerm || filterStatus !== 'all'
                      ? 'No orders match your search'
                      : 'No orders found. Create your first order!'}
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

export default AllOrders;
