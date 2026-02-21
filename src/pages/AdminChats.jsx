import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import './AdminChats.css';

const AdminChats = () => {
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const currentUser = auth.currentUser;

  useEffect(() => {
    // Load all messages
    const messagesRef = collection(db, 'chats');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = [];
      snapshot.forEach((doc) => {
        loadedMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(loadedMessages);

      // Extract unique users
      const uniqueUsers = {};
      loadedMessages.forEach(msg => {
        if (!uniqueUsers[msg.userId]) {
          uniqueUsers[msg.userId] = {
            userId: msg.userId,
            userName: msg.userName,
            lastMessage: msg.text,
            timestamp: msg.timestamp,
            unread: msg.status !== 'read' && !msg.isAdmin,
          };
        } else {
          // Update with latest message
          if (msg.timestamp > uniqueUsers[msg.userId].timestamp) {
            uniqueUsers[msg.userId].lastMessage = msg.text;
            uniqueUsers[msg.userId].timestamp = msg.timestamp;
          }
          // Check if has unread
          if (msg.status !== 'read' && !msg.isAdmin) {
            uniqueUsers[msg.userId].unread = true;
          }
        }
      });

      setUsers(Object.values(uniqueUsers).sort((a, b) => 
        (b.timestamp?.toDate?.() || new Date(b.timestamp || 0)) - 
        (a.timestamp?.toDate?.() || new Date(a.timestamp || 0))
      ));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectUser = async (userId) => {
    setSelectedChat(userId);

    // Mark all messages from this user as read
    const userMessages = messages.filter(msg => 
      msg.userId === userId && !msg.isAdmin && msg.status !== 'read'
    );

    for (const msg of userMessages) {
      try {
        const msgRef = doc(db, 'chats', msg.id);
        await updateDoc(msgRef, {
          status: 'read',
          readBy: currentUser ? [currentUser.uid] : ['admin'],
        });
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedChat) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'chats'), {
        text: replyText.trim(),
        userId: currentUser?.uid || 'admin',
        userName: 'Admin',
        timestamp: Timestamp.now(),
        isAdmin: true,
        status: 'sent',
        readBy: [],
      });

      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB');
  };

  const selectedUserMessages = messages.filter(msg => 
    msg.userId === selectedChat || (msg.isAdmin && selectedChat)
  );

  const selectedUserInfo = users.find(u => u.userId === selectedChat);

  return (
    <div className="admin-chats">
      <div className="page-header">
        <div>
          <h1>💬 Customer Chats</h1>
          <p>View and reply to customer messages</p>
        </div>
      </div>

      <div className="chat-container">
        {/* Users List */}
        <div className="users-sidebar">
          <div className="sidebar-header">
            <h3>Conversations</h3>
            <span className="badge badge-primary">{users.length}</span>
          </div>

          <div className="users-list">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.userId}
                  className={`user-item ${selectedChat === user.userId ? 'active' : ''} ${user.unread ? 'unread' : ''}`}
                  onClick={() => selectUser(user.userId)}
                >
                  <div className="user-avatar">
                    <span>{user.userName[0].toUpperCase()}</span>
                  </div>
                  <div className="user-info">
                    <div className="user-header">
                      <h4>{user.userName}</h4>
                      <span className="user-time">{formatDate(user.timestamp)}</span>
                    </div>
                    <p className="user-last-message">
                      {user.lastMessage.substring(0, 40)}
                      {user.lastMessage.length > 40 ? '...' : ''}
                    </p>
                  </div>
                  {user.unread && <div className="unread-badge"></div>}
                </div>
              ))
            ) : (
              <div className="no-users">
                <p>💬 No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    <span>{selectedUserInfo?.userName[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <h3>{selectedUserInfo?.userName}</h3>
                    <span className="user-id">ID: {selectedChat.substring(0, 8)}</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {selectedUserMessages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.isAdmin ? 'admin-message' : 'user-message'}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="message-bubble">
                      {!msg.isAdmin && (
                        <div className="message-sender">{msg.userName}</div>
                      )}
                      <div className="message-text">{msg.text}</div>
                      <div className="message-footer">
                        <span className="message-time">{formatTime(msg.timestamp)}</span>
                        {msg.isAdmin && (
                          <span className="message-status">
                            {msg.status === 'read' ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <div className="reply-container">
                <input
                  type="text"
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                  className="reply-input"
                />
                <button
                  className="btn btn-primary"
                  onClick={sendReply}
                  disabled={!replyText.trim() || loading}
                >
                  {loading ? '⏳' : '📤'} Send
                </button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a user from the sidebar to view messages</p>
            </div>
          )}
        </div>
      </div>

      <div className="footer">
        Made with ❤️ by <strong>GAUTAMS Worlds</strong>
      </div>
    </div>
  );
};

export default AdminChats;