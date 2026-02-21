import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up new user
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      // Display user-friendly error messages
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/email-already-in-use':
          setError('Email already in use');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters');
          break;
        default:
          setError('Authentication failed. Please try again.');
      }
      
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="floating-ball ball-1"></div>
        <div className="floating-ball ball-2"></div>
        <div className="floating-ball ball-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <span className="login-icon">⚽</span>
          </div>
          <h1>MASTOI SPORTS</h1>
          <p>Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>

          <div className="login-toggle">
            <button 
              type="button"
              className="toggle-btn"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
            </button>
          </div>

          <div className="login-hint">
            <small>Use your email and password to access the admin panel</small>
          </div>
        </form>

        <div className="login-footer">
          Made by <strong>GAUTAMS Worlds</strong>
        </div>
      </div>
    </div>
  );
};

export default Login;