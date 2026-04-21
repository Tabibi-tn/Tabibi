import React, { useState } from 'react'
import api from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function Register(){
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [role,setRole]=useState('patient')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [success, setSuccess] = useState(false)
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setError('')
    if(!name || !email || !password){ setError('Please complete all fields'); return }
    if(!agreedToTerms){ setError('Please agree to the terms and conditions'); return }
    try{
      setLoading(true)
      await api.post('/auth/register',{ name, email, password, role })
      setSuccess(true)
      setTimeout(() => nav('/login'), 3000)
    }catch(err){
      setError(err?.response?.data?.message || 'Registration failed. Please try again.')
    }finally{ setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Decorative Panel */}
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="brand-logo">
              <span className="brand-icon">🏥</span>
              <span className="brand-name">Tabibi</span>
            </div>
            <h1>Join Tabibi</h1>
            <p>Create your account and start managing your healthcare journey today.</p>
            <div className="auth-features">
              <div className="feature-item">
                <span className="feature-icon">👨‍⚕️</span>
                <span>Access to qualified doctors</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📱</span>
                <span>Book appointments anytime</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure medical records</span>
              </div>
            </div>
          </div>
          <div className="auth-left-pattern"></div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>

            {success ? (
              <div className="form-success" style={{ 
                padding: '1.5rem', 
                background: role === 'doctor' ? '#fff3cd' : '#d4edda',
                borderRadius: 'var(--radius)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {role === 'doctor' ? '⏳' : '✅'}
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>
                  {role === 'doctor' ? 'Registration Submitted!' : 'Account Created!'}
                </h3>
                <p style={{ color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                  {role === 'doctor' 
                    ? 'Your account is pending approval by an administrator. You will be notified once your account is approved.'
                    : 'Your account has been created successfully! You can now log in to book appointments.'}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                  Redirecting to login in 3 seconds...
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input 
                      id="name"
                      type="text" 
                      value={name} 
                      onChange={e=>setName(e.target.value)} 
                      placeholder="Enter your full name"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">✉️</span>
                    <input 
                      id="email"
                      type="email" 
                      value={email} 
                      onChange={e=>setEmail(e.target.value)} 
                      placeholder="Enter your email"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input 
                      id="password"
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={e=>setPassword(e.target.value)} 
                      placeholder="Create a password"
                      className="form-input"
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="role">I am a</label>
                  <div className="role-selector">
                    <label className={`role-card ${role === 'patient' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="patient" 
                        checked={role === 'patient'}
                        onChange={e=>setRole(e.target.value)}
                      />
                      <span className="role-icon">👤</span>
                      <span className="role-label">Patient</span>
                      <span className="role-desc">Book appointments</span>
                    </label>
                    <label className={`role-card ${role === 'doctor' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="doctor" 
                        checked={role === 'doctor'}
                        onChange={e=>setRole(e.target.value)}
                      />
                      <span className="role-icon">👨‍⚕️</span>
                      <span className="role-label">Doctor</span>
                      <span className="role-desc">Manage patients</span>
                    </label>
                  </div>
                </div>

                <label className="checkbox-label terms-checkbox">
                  <input 
                    type="checkbox" 
                    checked={agreedToTerms}
                    onChange={e=>setAgreedToTerms(e.target.checked)}
                  />
                  <span>I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a></span>
                </label>

                {error && (
                  <div className="form-error">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-small"></span>
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Sign In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}