// LoginPage.jsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import HotelReview from './HotelReview';
import SignUpPage from './SignUp';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!email || !password) {
      setMessageType('error');
      setMessage('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage(data.message);
        setLoggedInEmail(email);
        setIsLoggedIn(true);
      } else {
        if (response.status === 404) {
          setMessageType('error');
          setMessage('Account not found. Please sign up first.');
          setShowSignUp(true);
        } else if (response.status === 401) {
          setMessageType('error');
          setMessage('Incorrect password. Please try again.');
        } else {
          setMessageType('error');
          setMessage(data.detail || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessageType('error');
      setMessage('Failed to connect to server. Please make sure the backend is running on http://localhost:8000');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInEmail('');
    setEmail('');
    setPassword('');
    setRememberMe(false);
    setMessage('');
    setMessageType('');
  };

  const handleSignUpSuccess = (userEmail) => {
    setLoggedInEmail(userEmail);
    setEmail(userEmail);
    setShowSignUp(false);
    setIsLoggedIn(true);
    setMessageType('success');
    setMessage('Account created and logged in.');
  };

  if (showSignUp) {
    return (
      <SignUpPage 
        onBackToLogin={() => setShowSignUp(false)}
        onSignUpSuccess={handleSignUpSuccess}
      />
    );
  }

  if (isLoggedIn) {
    return <HotelReview onLogout={handleLogout} userEmail={loggedInEmail} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100vw',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        backgroundColor: '#f3f4f6',
        alignItems: 'stretch',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'center',
          padding: '4rem',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ marginBottom: '3rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '3.5rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#047857',
                  borderRadius: '6px',
                }}
              />
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                Resenas
              </span>
            </div>

            <h1
              style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '1rem',
                lineHeight: '1.2',
              }}
            >
              Sign in
            </h1>

            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Don't have an account?{' '}
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowSignUp(true);
                }}
                style={{ color: '#047857', fontWeight: '500', textDecoration: 'none' }}
              >
                Create now
              </a>
            </p>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '0.75rem',
              }}
            >
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (message) setMessage('');
              }}
              placeholder="example@gmail.com"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                backgroundColor: 'white',
                color: '#000000',
                opacity: isLoading ? 0.6 : 1
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#047857';
                e.target.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '0.75rem',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (message) setMessage('');
                }}
                placeholder="••••••"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '1rem 3.5rem 1rem 1.25rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  backgroundColor: 'white',
                  color: '#000000',
                  opacity: isLoading ? 0.6 : 1
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#047857';
                  e.target.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                style={{
                  position: 'absolute',
                  right: '1.25rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem',
            }}
          >
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              cursor: 'pointer', 
              fontSize: '1rem' 
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  cursor: isLoading ? 'not-allowed' : 'pointer', 
                  accentColor: '#047857' 
                }}
              />
              <span style={{ color: '#4b5563' }}>Remember me</span>
            </label>

            <a 
              href="#" 
              style={{ 
                fontSize: '1rem', 
                color: '#4b5563', 
                fontWeight: '500', 
                textDecoration: 'none',
                pointerEvents: isLoading ? 'none' : 'auto',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Forgot Password?
            </a>
          </div>

          {message && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                borderRadius: "8px",
                backgroundColor: messageType === "error" ? "#fee2e2" : "#d1fae5",
                color: messageType === "error" ? "#b91c1c" : "#065f46",
                border: `1px solid ${messageType === "error" ? "#dc2626" : "#10b981"}`,
                fontWeight: "500"
              }}
            >
              {message}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#9ca3af' : '#047857',
              color: 'white',
              padding: '1rem',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '1.1rem',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '2rem',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              if (!isLoading) e.target.style.backgroundColor = '#065f46';
            }}
            onMouseOut={(e) => {
              if (!isLoading) e.target.style.backgroundColor = '#047857';
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div style={{
            position: 'relative',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              borderTop: '1px solid #d1d5db'
            }}></div>
            <span style={{
              position: 'relative',
              backgroundColor: 'white',
              padding: '0 1rem',
              color: '#6b7280',
              fontSize: '1rem'
            }}>OR</span>
          </div>

          <button
            type="button"
            disabled={isLoading}
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              padding: '1rem',
              borderRadius: '10px',
              fontWeight: '500',
              fontSize: '1.1rem',
              backgroundColor: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'background-color 0.2s',
              opacity: isLoading ? 0.6 : 1
            }}
            onMouseOver={(e) => {
              if (!isLoading) e.target.style.backgroundColor = '#f9fafb';
            }}
            onMouseOut={(e) => {
              if (!isLoading) e.target.style.backgroundColor = 'white';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span style={{ color: '#4b5563' }}>Continue with Google</span>
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}
        />
        <div style={{ textAlign: 'center', color: 'white', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: '1.3' }}>
            Welcome to Resanas
          </h2>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '400px', margin: '0 auto' }}>
            Manage hotel reviews by analyzing the sentiment expressed in customer feedback.
          </p>
        </div>
      </div>
    </div>
  );
}
