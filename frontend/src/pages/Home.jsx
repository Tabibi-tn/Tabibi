import React from 'react'
import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useContext(AuthContext)

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Your Health, Our Priority</h1>
            <p className="hero-subtitle">
              Connect with top healthcare professionals, book appointments instantly, 
              and manage your health journey all in one place.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="text-center" style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 className="section-title">Why Choose Tabibi?</h2>
            <p className="section-subtitle">
              We make healthcare accessible, convenient, and personalized for everyone.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon">🏥</div>
              <h3 className="feature-title">Expert Doctors</h3>
              <p className="feature-description">
                Access to a network of qualified and experienced healthcare professionals across various specialties.
              </p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">📅</div>
              <h3 className="feature-title">Easy Booking</h3>
              <p className="feature-description">
                Book appointments with just a few clicks. View doctor availability and schedule at your convenience.
              </p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">Direct Communication</h3>
              <p className="feature-description">
                Message your doctors directly, share documents securely, and get timely responses.
              </p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">Medical Records</h3>
              <p className="feature-description">
                Keep all your medical history, prescriptions, and consultation notes in one secure place.
              </p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">⭐</div>
              <h3 className="feature-title">Reviews & Ratings</h3>
              <p className="feature-description">
                Make informed decisions with authentic reviews from verified patients.
              </p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-description">
                Your health data is protected with enterprise-grade security and privacy standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" style={{ padding: '5rem 0', background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="text-center" style={{ maxWidth: 600, margin: '0 auto 3rem' }}>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Get started with Tabibi in three simple steps
            </p>
          </div>
          <div className="grid grid-3">
            <div className="step-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="step-number" style={{
                width: 60, height: 60, borderRadius: '50%', 
                background: 'var(--primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1rem'
              }}>1</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Create Account</h3>
              <p style={{ color: 'var(--gray-500)' }}>Sign up as a patient and complete your profile</p>
            </div>
            <div className="step-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="step-number" style={{
                width: 60, height: 60, borderRadius: '50%', 
                background: 'var(--primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1rem'
              }}>2</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Find a Doctor</h3>
              <p style={{ color: 'var(--gray-500)' }}>Browse specialists and read reviews</p>
            </div>
            <div className="step-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="step-number" style={{
                width: 60, height: 60, borderRadius: '50%', 
                background: 'var(--primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1rem'
              }}>3</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Book Appointment</h3>
              <p style={{ color: 'var(--gray-500)' }}>Select time slot and confirm your visit</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{ padding: '5rem 0', background: 'var(--bg-hero)', color: 'white' }}>
        <div className="container text-center">
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: 0.9 }}>
            Join thousands of patients who trust Tabibi for their healthcare needs.
          </p>
          {!user && (
            <Link to="/register" className="btn btn-lg" style={{ 
              background: 'white', color: 'var(--primary)', 
              padding: '0.75rem 2rem' 
            }}>
              Create Free Account
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--gray-900)', color: 'white', padding: '3rem 0' }}>
        <div className="container">
          <div className="grid grid-3" style={{ gap: '2rem' }}>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1rem' }}>Tabibi</h4>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>
                Your trusted healthcare platform connecting patients with quality medical professionals.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1rem' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/doctors" style={{ color: 'var(--gray-400)' }}>Find Doctors</Link>
                <Link to="/register" style={{ color: 'var(--gray-400)' }}>Sign Up</Link>
                <Link to="/login" style={{ color: 'var(--gray-400)' }}>Sign In</Link>
              </div>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1rem' }}>Contact</h4>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>
                Email: support@tabibi.com<br/>
                Phone: +1 (555) 123-4567
              </p>
            </div>
          </div>
          <div style={{ 
            borderTop: '1px solid var(--gray-800)', 
            marginTop: '2rem', 
            paddingTop: '1.5rem',
            textAlign: 'center',
            color: 'var(--gray-500)',
            fontSize: '0.875rem'
          }}>
            © 2024 Tabibi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}