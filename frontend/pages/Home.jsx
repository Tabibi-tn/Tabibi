import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      
      <h1>Tabibi</h1>
      <p>healthcare platform </p>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/Register" style={{ marginRight: '1rem' }}>
          Register
        </Link>
        <Link to="/Login">
          Login
        </Link>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h3>Planned Features</h3>
        <p>- Browse doctors</p>
        <p>- Book appointments</p>
        <p>- Patient dashboard</p>
      </div>

      <footer style={{ marginTop: '4rem', fontSize: '0.9rem' }}>
        Tabibi
      </footer>

    </div>
  )
}