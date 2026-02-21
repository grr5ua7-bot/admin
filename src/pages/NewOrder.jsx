import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addOrder } from '../services/orderService';
import { getSettings } from '../services/settingsService';
import './NewOrder.css';

const NewOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    kidsSizes: [],
    adultSizes: [],
    bazoTypes: [],
    shirtTypes: []
  });

  const [formData, setFormData] = useState({
    orderId: '',
    team: '',
    status: 'pending'
  });

  const [players, setPlayers] = useState([
    {
      name: '',
      jerseyNumber: '',
      size: '',
      bazoType: '',
      shirtType: ''
    }
  ]);

  useEffect(() => {
    loadSettings();
    generateOrderId();
  }, []);

  const loadSettings = async () => {
    const result = await getSettings();
    if (result.success) {
      setSettings(result.settings);
    }
  };

  const generateOrderId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let orderId = '';
    for (let i = 0; i < 8; i++) {
      orderId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, orderId }));
  };

  const handleAddPlayer = () => {
    setPlayers([...players, {
      name: '',
      jerseyNumber: '',
      size: '',
      bazoType: '',
      shirtType: ''
    }]);
  };

  const handleRemovePlayer = (index) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const handlePlayerChange = (index, field, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index][field] = value;
    setPlayers(updatedPlayers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      ...formData,
      players: players.filter(p => p.name.trim() !== '')
    };

    const result = await addOrder(orderData);
    
    if (result.success) {
      alert('Order created successfully!');
      navigate('/orders');
    } else {
      alert('Error creating order: ' + result.error);
    }
    
    setLoading(false);
  };

  const allSizes = [...(settings.kidsSizes || []), ...(settings.adultSizes || [])];

  return (
    <div className="new-order">
      <div className="page-header">
        <div>
          <h1>➕ Create New Order</h1>
          <p>Add a new jersey order for your team</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/orders')}>
          ← Back to Orders
        </button>
      </div>

      <form onSubmit={handleSubmit} className="order-form">
        <div className="card">
          <h2>📋 Order Information</h2>
          
          <div className="form-row">
            <div className="input-group">
              <label>Order ID *</label>
              <input
                type="text"
                value={formData.orderId}
                onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                required
                readOnly
              />
            </div>

            <div className="input-group">
              <label>Team Name *</label>
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({...formData, team: e.target.value})}
                placeholder="Enter team name"
                required
              />
            </div>

            <div className="input-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header-flex">
            <h2>👕 Players ({players.length})</h2>
            <button type="button" className="btn btn-secondary" onClick={handleAddPlayer}>
              + Add Player
            </button>
          </div>

          <div className="players-list">
            {players.map((player, index) => (
              <div key={index} className="player-card">
                <div className="player-header">
                  <h3>Player {index + 1}</h3>
                  {players.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-player-btn"
                      onClick={() => handleRemovePlayer(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="player-form">
                  <div className="input-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                      placeholder="Player name"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Jersey Number *</label>
                    <input
                      type="text"
                      value={player.jerseyNumber}
                      onChange={(e) => handlePlayerChange(index, 'jerseyNumber', e.target.value)}
                      placeholder="10"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Size *</label>
                    <select
                      value={player.size}
                      onChange={(e) => handlePlayerChange(index, 'size', e.target.value)}
                      required
                    >
                      <option value="">Select size</option>
                      <optgroup label="Kids (5-14 years)">
                        {settings.kidsSizes?.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Adults (15-30 years)">
                        {settings.adultSizes?.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Bazo Type *</label>
                    <select
                      value={player.bazoType}
                      onChange={(e) => handlePlayerChange(index, 'bazoType', e.target.value)}
                      required
                    >
                      <option value="">Select type</option>
                      {settings.bazoTypes?.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Shirt Type *</label>
                    <select
                      value={player.shirtType}
                      onChange={(e) => handlePlayerChange(index, 'shirtType', e.target.value)}
                      required
                    >
                      <option value="">Select type</option>
                      {settings.shirtTypes?.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Creating...' : '✓ Create Order'}
          </button>
          <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate('/orders')}>
            Cancel
          </button>
        </div>
      </form>

      <div className="footer">
        Made with ❤️ by <strong>GAUTAMS Worlds</strong>
      </div>
    </div>
  );
};

export default NewOrder;