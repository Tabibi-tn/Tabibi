import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ email, password })
    alert('Login incomplete...')
  }

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
      
      <h2>Login</h2>
      <p>login page</p>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" style={{ padding: '8px 16px' }}>
          Login
        </button>
      </form>

      <p style={{ marginTop: '1.5rem' }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>

    </div>
  )
}