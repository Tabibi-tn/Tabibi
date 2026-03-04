import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      <section style={{
        textAlign: 'center',
        padding: '5rem 1rem',
        background: '#f5f9ff'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Your Health, Our Priority
        </h1>

        <p style={{
          maxWidth: '600px',
          margin: '0 auto',
          color: '#555'
        }}>
          Connect with trusted healthcare professionals, book appointments easily,
          and manage your health journey in one simple platform.
        </p>

        <div style={{ marginTop: '2rem' }}>
          <Link 
            to="/register"
            style={{
              padding: '10px 20px',
              marginRight: '1rem',
              background: '#2563eb',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none'
            }}
          >
            Get Started
          </Link>

          <Link 
            to="/login"
            style={{
              padding: '10px 20px',
              border: '1px solid #2563eb',
              borderRadius: '6px',
              textDecoration: 'none'
            }}
          >
            Sign In
          </Link>
        </div>
      </section>


      <section style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem' }}>Why Choose Tabibi?</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
          maxWidth: '900px',
          margin: '0 auto'
        }}>

          <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem' }}>🏥</div>
            <h3>Qualified Doctors</h3>
            <p style={{ color: '#666' }}>
              Access experienced healthcare professionals across specialties.
            </p>
          </div>

          <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem' }}>📅</div>
            <h3>Easy Booking</h3>
            <p style={{ color: '#666' }}>
              Schedule appointments in just a few clicks.
            </p>
          </div>

          <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem' }}>🔒</div>
            <h3>Secure Platform</h3>
            <p style={{ color: '#666' }}>
              Your medical data stays private and protected.
            </p>
          </div>

        </div>
      </section>


      <section style={{
        padding: '4rem 1rem',
        background: '#f9fafb',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '2rem' }}>How It Works</h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <h3>1️⃣ Register</h3>
            <p style={{ color: '#666' }}>Create your free account.</p>
          </div>

          <div>
            <h3>2️⃣ Find a Doctor</h3>
            <p style={{ color: '#666' }}>Browse available specialists.</p>
          </div>

          <div>
            <h3>3️⃣ Book Appointment</h3>
            <p style={{ color: '#666' }}>Choose time and confirm.</p>
          </div>
        </div>
      </section>


      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        background: '#111',
        color: '#aaa'
      }}>
        Tabibi — Healthcare Made Simple
      </footer>

    </div>
  )
}