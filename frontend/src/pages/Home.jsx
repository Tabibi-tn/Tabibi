import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

const FEATURES = [
  { icon: '🏥', title: 'Expert Doctors', desc: 'Access qualified healthcare professionals across all specialties, verified and approved.' },
  { icon: '📅', title: 'Easy Booking', desc: 'Book appointments in seconds. View real-time availability and choose your preferred slot.' },
  { icon: '💬', title: 'Direct Messaging', desc: 'Communicate securely with your doctor, ask questions, and get timely responses.' },
  { icon: '📋', title: 'Medical Records', desc: 'All your consultations, prescriptions, and health history in one secure place.' },
  { icon: '⭐', title: 'Reviews & Ratings', desc: 'Make informed choices with authentic reviews from verified patients.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'Your health data is protected with enterprise-grade security and privacy.' },
]

const STEPS = [
  { n: 1, title: 'Create Account', desc: 'Sign up as a patient and complete your profile in under a minute.' },
  { n: 2, title: 'Find a Doctor', desc: 'Browse specialists by name, specialty, and read patient reviews.' },
  { n: 3, title: 'Book Appointment', desc: 'Select an available time slot and confirm your visit instantly.' },
]

export default function Home() {
  const { user } = useContext(AuthContext)

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Your Health,<br />Our Priority</h1>
            <p className="hero-subtitle">
              Connect with top healthcare professionals, book appointments instantly,
              and manage your entire health journey in one place.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <div className="text-center" style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 className="section-title">Why Choose Tabibi?</h2>
            <p className="section-subtitle">We make healthcare accessible, convenient, and personalized for everyone.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-description">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '5rem 0', background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="text-center" style={{ maxWidth: 600, margin: '0 auto 3rem' }}>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get started with Tabibi in three simple steps</p>
          </div>
          <div className="grid grid-3">
            {STEPS.map(s => (
              <div key={s.n} className="step-card">
                <div className="step-number">{s.n}</div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--gray-500)', marginBottom: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section style={{ padding: '4rem 0', background: 'white', borderTop: '1px solid var(--gray-100)', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container">
          <div className="grid grid-3" style={{ textAlign: 'center', gap: '2rem' }}>
            {[
              { value: '500+', label: 'Verified Doctors' },
              { value: '10K+', label: 'Patients Served' },
              { value: '50+', label: 'Specialties' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ color: 'var(--gray-500)', marginTop: '0.5rem', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={{ padding: '5rem 0', background: 'var(--bg-hero)', color: 'white' }}>
        <div className="container text-center">
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>Ready to Get Started?</h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: 0.9 }}>
            Join thousands of patients who trust Tabibi for their healthcare needs.
          </p>
          {!user && (
            <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary)', padding: '0.75rem 2.5rem', fontWeight: 600 }}>
              Create Free Account
            </Link>
          )}
          {user && (
            <Link to="/doctors" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary)', padding: '0.75rem 2.5rem', fontWeight: 600 }}>
              Find a Doctor
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--gray-900)', color: 'white', padding: '3rem 0' }}>
        <div className="container">
          <div className="grid grid-3" style={{ gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🏥</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Tabibi</span>
              </div>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: 0 }}>
                Your trusted healthcare platform connecting patients with quality medical professionals.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/doctors" style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>Find Doctors</Link>
                {!user && <Link to="/register" style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>Sign Up</Link>}
                {!user && <Link to="/login" style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>Sign In</Link>}
                {user && <Link to="/dashboard" style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>Dashboard</Link>}
              </div>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</h4>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                📧 support@tabibi.tn
              </p>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: 0 }}>
                📞 +216 71 000 000
              </p>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid var(--gray-800)',
            paddingTop: '1.5rem',
            textAlign: 'center',
            color: 'var(--gray-500)',
            fontSize: '0.875rem'
          }}>
            © {new Date().getFullYear()} Tabibi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
