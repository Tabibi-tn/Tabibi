import React, { useState, useContext } from 'react'
import api from '../api'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useContext(AuthContext)
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setError('')
    if(!email || !password){ setError('Please enter email and password'); return }
    try{
      setLoading(true)
      const res = await api.post('/auth/login',{ email, password })
      login(res.data.token, res.data.user)
      nav('/dashboard')
    }catch(err){
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.')
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
            <h1>Welcome Back</h1>
            <p>Connect with top healthcare professionals and manage your appointments with ease.</p>
            <div className="auth-features">
              <div className="feature-item">
                <span className="feature-icon">📅</span>
                <span>Easy appointment booking</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💬</span>
                <span>Direct messaging with doctors</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📋</span>
                <span>Medical records management</span>
              </div>
            </div>
          </div>
          <div className="auth-left-pattern"></div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to access your account</p>
            </div>

            <form onSubmit={submit} className="auth-form">
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
                    placeholder="Enter your password"
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

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>

              {error && (
                <div className="form-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>Don't have an account? <Link to="/register">Create Account</Link></p>
            </div>

            <div className="demo-accounts">
              <p className="demo-title">Demo Accounts:</p>
              <div className="demo-items">
                <span>👨‍⚕️ Doctor: doctor@tabibi.test</span>
                <span>👤 Patient: patient@tabibi.test</span>
                <span>🔑 Password: any</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}