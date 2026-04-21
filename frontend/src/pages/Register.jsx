import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Authentication system coming soon!');
  };

  return (
    <div className="auth-page" style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* Left Panel */}
      <div className="auth-left" style={{
        flex: 1,
        background: 'linear-gradient(135deg, #6BC1FF, #4A90E2)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        minHeight: '100vh' // Make it reach the bottom
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
          <h1>Welcome to Tabibi</h1>
          <p style={{ maxWidth: '250px', margin: '1rem auto' }}>
            Connect with healthcare professionals and manage your appointments easily.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right" style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Register</h2>
          <p style={{ textAlign: 'center', color: '#555', marginBottom: '2rem' }}>
            Fill in your details to create an account
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ padding: '10px', borderRadius: 6, border: '1px solid #ccc' }}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding: '10px', borderRadius: 6, border: '1px solid #ccc' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ padding: '10px', borderRadius: 6, border: '1px solid #ccc' }}
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{ padding: '10px', borderRadius: 6, border: '1px solid #ccc' }}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>

            <button
              type="submit"
              style={{
                padding: '10px',
                borderRadius: 6,
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Register
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Already have an account? <Link to="/login" style={{ color: '#007bff' }}>Login</Link>
          </p>
        </div>
      </div>

    </div>
  );
}