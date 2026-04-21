import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    console.log({ email, password })
    alert('Authentication system coming soon...')
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh'
    }}>

      <div style={{
        flex: 1,
        background: '#2563eb',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem'
      }}>
        <h1 style={{ fontSize: '2rem' }}>Welcome Back</h1>
        <p style={{ marginTop: '1rem', opacity: 0.9 }}>
          Sign in to manage appointments, connect with doctors,
          and track your healthcare journey.
        </p>

        <div style={{ marginTop: '2rem' }}>
          <p>✔ Easy appointment booking</p>
          <p>✔ Access to medical records</p>
          <p>✔ Secure & private platform</p>
        </div>
      </div>


      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>

        <div style={{ width: '100%', maxWidth: '400px' }}>

          <h2>Sign In</h2>
          <p style={{ color: '#666' }}>
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '6px'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label>Password</label>
              <div style={{ display: 'flex', marginTop: '6px' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    flex: 1,
                    padding: '10px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    padding: '0 10px',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                marginBottom: '1rem',
                color: 'red',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link to="/register">Create Account</Link>
          </p>

        </div>
      </div>

    </div>
  )
}