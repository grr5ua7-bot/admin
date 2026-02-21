import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../services/orderService';
import jsPDF from 'jspdf';
import './OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const result = await getOrderById(id);
      if (result.success) {
        setOrder(result.order);
        setCurrentStatus(result.order.status || 'pending');
      } else {
        setOrder(null);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setOrder(null);
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

  const handleStatusChange = async (newStatus) => {
    setCurrentStatus(newStatus);
    const result = await updateOrderStatus(id, newStatus);
    if (result.success) loadOrder();
  };

  const handleDownloadPDF = () => {
    console.log('📥 PDF Download button clicked!');
    
    if (!order) {
      console.error('❌ No order data available');
      alert('Order data not loaded. Please refresh the page.');
      return;
    }

    console.log('✅ Order data:', order);

    try {
      const doc = new jsPDF();
      console.log('✅ jsPDF initialized');

      // Header with background
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('⚽ MASTOI SPORTS', 105, 18, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Order Receipt', 105, 30, { align: 'center' });

      // Reset text color
      doc.setTextColor(0, 0, 0);

      // Order Info Box
      doc.setFillColor(240, 240, 240);
      doc.rect(10, 45, 190, 35, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Order Information:', 15, 53);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Order ID: ${order.orderId || order.id.substring(0, 8).toUpperCase()}`, 15, 60);
      doc.text(`Team: ${order.team || 'N/A'}`, 15, 66);
      doc.text(`Date: ${formatDate(order.createdAt || order.date)}`, 120, 60);
      doc.text(`Status: ${currentStatus.toUpperCase()}`, 120, 66);
      doc.text(`Total Players: ${order.players?.length || 0}`, 15, 72);

      console.log('✅ Header and order info added');

      // Players Table Header
      let yPos = 90;
      doc.setFillColor(37, 99, 235);
      doc.rect(10, yPos, 190, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('#', 15, yPos + 7);
      doc.text('Player Name', 30, yPos + 7);
      doc.text('Jersey', 85, yPos + 7);
      doc.text('Size', 110, yPos + 7);
      doc.text('Bazo Type', 135, yPos + 7);
      doc.text('Shirt Type', 170, yPos + 7);

      // Reset for table body
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');

      // Players Data
      const playersArray = order.players
        ? Array.isArray(order.players)
          ? order.players
          : Object.values(order.players)
        : [];

      console.log('👥 Players array:', playersArray);

      yPos += 10;
      let rowCount = 0;

      playersArray.forEach((player, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(10, yPos, 190, 10, 'F');
        }

        doc.text(String(index + 1), 15, yPos + 7);
        doc.text(player.name || player.playerName || 'N/A', 30, yPos + 7);
        doc.text(player.jerseyNumber || player.jerseyNo || 'N/A', 85, yPos + 7);
        doc.text(player.size || 'N/A', 110, yPos + 7);
        doc.text(player.bazoType || 'N/A', 135, yPos + 7);
        doc.text(player.shirtType || 'N/A', 170, yPos + 7);

        yPos += 10;
        rowCount++;

        // Add new page if needed
        if (yPos > 270 && index < playersArray.length - 1) {
          doc.addPage();
          yPos = 20;
          
          // Repeat table header on new page
          doc.setFillColor(37, 99, 235);
          doc.rect(10, yPos, 190, 10, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.text('#', 15, yPos + 7);
          doc.text('Player Name', 30, yPos + 7);
          doc.text('Jersey', 85, yPos + 7);
          doc.text('Size', 110, yPos + 7);
          doc.text('Bazo Type', 135, yPos + 7);
          doc.text('Shirt Type', 170, yPos + 7);
          
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          yPos += 10;
        }
      });

      console.log('✅ Table added with', rowCount, 'rows');

      // Footer
      yPos += 15;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.text('Thank you for choosing MASTOI SPORTS!', 105, yPos, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text('gr7675367@gmail.com', 105, yPos + 7, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Made with ❤️ by GAUTAMS Worlds', 105, yPos + 15, { align: 'center' });

      console.log('✅ Footer added');

      // Download
      const fileName = `MASTOI_Order_${order.orderId || order.id.substring(0, 8)}.pdf`;
      console.log('💾 Saving as:', fileName);
      
      doc.save(fileName);
      console.log('✅ PDF download triggered!');
      
      alert('✅ PDF downloaded successfully! Check your Downloads folder.');
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      alert(`❌ Error creating PDF: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="order-details">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/orders')}>
            ← Back to Orders
          </button>
          <h1>Order Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/orders')}>
            ← Back to Orders
          </button>
          <h1>Order Details</h1>
          <p>Order ID: {order.orderId || order.id.substring(0, 8).toUpperCase()}</p>
        </div>
        <button className="btn btn-primary" onClick={handleDownloadPDF}>
          📥 Download PDF
        </button>
      </div>

      <div className="order-grid">
        <div className="card order-info-card">
          <div className="card-title">
            <h2>⚽ Order Information</h2>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <label>Order ID</label>
              <p className="info-value">{order.orderId || order.id.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className="info-item">
              <label>Team Name</label>
              <p className="info-value">{order.team || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Order Date</label>
              <p className="info-value">{formatDate(order.createdAt || order.date)}</p>
            </div>
            <div className="info-item">
              <label>Total Players</label>
              <p className="info-value">{order.players?.length || 0}</p>
            </div>
            <div className="info-item">
              <label>Status</label>
              <p className="info-value">
                <span className={getStatusBadge(currentStatus)}>{currentStatus}</span>
              </p>
            </div>
          </div>
          <div className="status-actions">
            <label>Update Status:</label>
            <div className="status-buttons">
              {['pending', 'processing', 'completed'].map((status) => (
                <button
                  key={status}
                  className={`status-btn ${currentStatus === status ? 'active' : ''}`}
                  onClick={() => handleStatusChange(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card players-card">
          <div className="card-title">
            <h2>👕 Player Details</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Jersey #</th>
                  <th>Size</th>
                  <th>Bazo Type</th>
                  <th>Shirt Type</th>
                </tr>
              </thead>
              <tbody>
                {(order.players || []).map((player, index) => (
                  <tr key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                    <td>{index + 1}</td>
                    <td><strong>{player.name || player.playerName || 'N/A'}</strong></td>
                    <td><span className="jersey-number">{player.jerseyNumber || player.jerseyNo || 'N/A'}</span></td>
                    <td>{player.size || 'N/A'}</td>
                    <td>{player.bazoType || 'N/A'}</td>
                    <td>{player.shirtType || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="footer">
        Made with ❤️ by <strong>GAUTAMS Worlds</strong>
      </div>
    </div>
  );
};

export default OrderDetails;
