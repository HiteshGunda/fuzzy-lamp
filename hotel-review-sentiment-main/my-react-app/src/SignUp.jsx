import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUpPage({ onBackToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // In SignUp.jsx, update the handleSignUp function:
const handleSignUp = async (e) => {
  if (e && e.preventDefault) e.preventDefault();
  
  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  if (!fullName || !email || !password) {
    alert('Please fill in all fields');
    return;
  }

  try {const API_URL = import.meta.env.VITE_API_URL;

    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      // Call the success callback with the email
      if (onSignUpSuccess) onSignUpSuccess(email);
    } else {
      alert(data.detail || 'Sign up failed. Please try again.');
    }
  } catch (error) {
    console.error('Sign up error:', error);
    alert('Failed to connect to server. Please make sure the backend is running on http://localhost:8000');
  }
};

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
      {/* Left Side - Sign Up Form */}
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
          {/* Logo */}
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
              Sign up
            </h1>

            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Already have an account?{' '}
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onBackToLogin) onBackToLogin();
                }}
                style={{ color: '#047857', fontWeight: '500', textDecoration: 'none' }}
              >
                Sign in
              </a>
            </p>
          </div>

          {/* Full Name Field */}
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
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
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

          {/* Email Field */}
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
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

          {/* Password Field */}
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1.25rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '2rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '0.75rem',
              }}
            >
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
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
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '1.25rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            onClick={handleSignUp}
            style={{
              width: '100%',
              backgroundColor: '#047857',
              color: 'white',
              padding: '1rem',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '1.1rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#065f46')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#047857')}
          >
            Sign up
          </button>
        </div>
      </div>

      {/* Right Side - Background/Branding */}
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
            Join Resanas Today
          </h2>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '400px', margin: '0 auto' }}>
            Start managing and analyzing hotel reviews with AI-powered sentiment analysis.
          </p>
        </div>
      </div>
    </div>
  );
}