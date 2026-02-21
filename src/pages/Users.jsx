import React, { useState, useEffect } from 'react';
import { getAllUsers, addUser } from '../services/userService';
import './Users.css';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.users || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const result = await addUser({
      ...formData,
      totalOrders: 0,
    });
    
    if (result.success) {
      setShowAddUserModal(false);
      setFormData({ name: '', email: '', phone: '' });
      loadUsers(); // Reload users
    }
  };

  const filteredUsers = users.filter((user) => {
    return (
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    );
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-GB');
    }
    return new Date(timestamp).toLocaleDateString('en-GB');
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="users">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users">
      <div className="page-header">
        <div>
          <h1>Users Management</h1>
          <p>Manage customer accounts and their order history</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddUserModal(true)}>
          + Add User
        </button>
      </div>

      <div className="card">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Orders</th>
                <th>Last Order</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr 
                    key={user.id} 
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleUserClick(user)}
                    className="clickable-row"
                  >
                    <td>{index + 1}</td>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className="order-count">{user.totalOrders || 0}</span>
                    </td>
                    <td>{formatDate(user.lastOrder || user.updatedAt)}</td>
                    <td>
                      <button 
                        className="btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user);
                        }}
                      >
                        👁️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={closeUserDetails}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 User Details</h2>
              <button className="close-btn" onClick={closeUserDetails}>✕</button>
            </div>

            <div className="user-details-content">
              <div className="user-info-section">
                <div className="info-row">
                  <label>Name</label>
                  <p>{selectedUser.name}</p>
                </div>
                <div className="info-row">
                  <label>Email</label>
                  <p>{selectedUser.email}</p>
                </div>
                <div className="info-row">
                  <label>Phone</label>
                  <p>{selectedUser.phone}</p>
                </div>
                <div className="info-row">
                  <label>Total Orders</label>
                  <p className="highlight">{selectedUser.totalOrders} orders</p>
                </div>
                <div className="info-row">
                  <label>Last Order</label>
                  <p>{formatDate(selectedUser.lastOrder || selectedUser.updatedAt)}</p>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-primary">View Orders History</button>
                <button className="btn btn-outline" onClick={closeUserDetails}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Add New User</h2>
              <button className="close-btn" onClick={() => setShowAddUserModal(false)}>✕</button>
            </div>

            <form className="add-user-form" onSubmit={handleAddUser}>
              <div className="input-group">
                <label>Name</label>
                <input 
                  type="text" 
                  placeholder="Enter full name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input 
                  type="email" 
                  placeholder="Enter email address" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Phone</label>
                <input 
                  type="tel" 
                  placeholder="Enter phone number" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required 
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Add User</button>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => {
                    setShowAddUserModal(false);
                    setFormData({ name: '', email: '', phone: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="footer">
        Made with ❤️ by <strong>GAUTAMS Worlds</strong>
      </div>
    </div>
  );
};

export default Users;