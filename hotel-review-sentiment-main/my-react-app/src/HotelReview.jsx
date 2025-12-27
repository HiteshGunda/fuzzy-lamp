// HotelReview.jsx
import React, { useState } from 'react';

export default function HotelReview({ onLogout, userEmail }) {
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmitReview = async () => {
    if (!review.trim()) {
      setMessageType('error');
      setMessage('Please write a review first!');
      return;
    }

    setIsSubmitting(true);
    setResult(null);
    setMessage('');
    setMessageType('');

    try {const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          text: review
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze review');
      }

      const data = await response.json();
      setResult(data);
      setMessageType('success');
      setMessage(data.message);
      setReview('');
    } catch (error) {
      console.error('Error:', error);
      setMessageType('error');
      setMessage(`Failed to submit review: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      setResult(null);
      setMessage('');
      setMessageType('');
      onLogout();
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100vw',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      backgroundColor: 'white',
      overflowX: 'hidden'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '4rem',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '600px',
        margin: '2rem'
      }}>
        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#047857',
                borderRadius: '6px'
              }}></div>
              <span style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1f2937'
              }}>Resenas</span>
            </div>

            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem',
              lineHeight: '1.2'
            }}>Hotel Review</h1>

            <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '0.5rem' }}>
              Post your hotel review
            </p>
            <p style={{ color: '#047857', fontSize: '0.9rem', fontWeight: '500' }}>
              Logged in as: {userEmail}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '500',
              color: '#4b5563',
              marginBottom: '0.75rem'
            }}>Your Review</label>
            <textarea
              value={review}
              onChange={(e) => {
                setReview(e.target.value);
                if (message) setMessage('');
              }}
              placeholder="Write your review here..."
              disabled={isSubmitting}
              style={{
                width: '100%',
                height: '150px',
                padding: '1rem 1.25rem',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit',
                resize: 'none',
                backgroundColor: 'white',
                color: '#000000',
                opacity: isSubmitting ? 0.6 : 1
              }}
              onFocus={(e) => {
                if (!isSubmitting) {
                  e.target.style.borderColor = '#047857';
                  e.target.style.boxShadow = '0 0 0 3px rgba(4, 120, 87, 0.1)';
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
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
            onClick={handleSubmitReview}
            disabled={isSubmitting}
            style={{
              width: '100%',
              backgroundColor: isSubmitting ? '#9ca3af' : '#047857',
              color: 'white',
              padding: '1rem',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '1.1rem',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '1rem'
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) e.target.style.backgroundColor = '#065f46';
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) e.target.style.backgroundColor = '#047857';
            }}
          >
            {isSubmitting ? 'Analyzing Review...' : 'Submit Review'}
          </button>

          <button
            onClick={handleLogout}
            disabled={isSubmitting}
            style={{
              width: '100%',
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              padding: '1rem',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '1.1rem',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              opacity: isSubmitting ? 0.6 : 1
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) e.target.style.backgroundColor = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) e.target.style.backgroundColor = '#f3f4f6';
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
