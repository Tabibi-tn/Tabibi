import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import  api  from '../api'

export default function Profile() {
  const { user, setUser } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [activeTab, setActiveTab] = useState('profile')
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
    bloodType: user?.bloodType || '',
    allergies: user?.allergies || '',
    medicalConditions: user?.medicalConditions || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await api.put('/users/profile', profileData)
      setUser({ ...user, ...profileData })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update profile' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update password' 
      })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-3" style={{ gap: '2rem' }}>
          {/* Profile Sidebar */}
          <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{
                width: 100,
                height: 100,
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 auto 1rem'
              }}>
                {getInitials(user?.name)}
              </div>
              <h3>{user?.name || 'User'}</h3>
              <p style={{ color: 'var(--gray-500)', textTransform: 'capitalize' }}>
                {user?.role}
              </p>
              <span className={`role-badge ${user?.role}`} style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 500,
                background: user?.role === 'admin' ? 'var(--error)' : 
                           user?.role === 'doctor' ? 'var(--primary)' : 'var(--accent)',
                color: 'white'
              }}>
                {user?.role}
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '1rem' }}>
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  background: activeTab === 'profile' ? 'var(--primary-50)' : 'transparent',
                  color: activeTab === 'profile' ? 'var(--primary)' : 'var(--gray-700)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                👤 Profile Information
              </button>
              <button
                onClick={() => setActiveTab('security')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  background: activeTab === 'security' ? 'var(--primary-50)' : 'transparent',
                  color: activeTab === 'security' ? 'var(--primary)' : 'var(--gray-700)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                🔒 Security
              </button>
              {user?.role === 'patient' && (
                <button
                  onClick={() => setActiveTab('medical')}
                  style={{
                    width: '100%',
                  padding: '0.75rem 1rem',
                    textAlign: 'left',
                    background: activeTab === 'medical' ? 'var(--primary-50)' : 'transparent',
                    color: activeTab === 'medical' ? 'var(--primary)' : 'var(--gray-700)',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  🏥 Medical Information
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ gridColumn: 'span 2' }}>
            {message.text && (
              <div className={`alert alert-${message.type}`} style={{
                padding: '1rem',
                borderRadius: 'var(--radius)',
                marginBottom: '1.5rem',
                background: message.type === 'success' ? 'var(--accent-50)' : '#fee2e2',
                color: message.type === 'success' ? 'var(--accent-dark)' : 'var(--error)',
                border: `1px solid ${message.type === 'success' ? 'var(--accent)' : 'var(--error)'}`
              }}>
                {message.text}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Profile Information</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          className="form-input"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          className="form-input"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          placeholder="Enter your email"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          className="form-input"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          className="form-input"
                          value={profileData.dateOfBirth}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Address</label>
                        <input
                          type="text"
                          name="address"
                          className="form-input"
                          value={profileData.address}
                          onChange={handleProfileChange}
                          placeholder="Enter your address"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Emergency Contact</label>
                        <input
                          type="text"
                          name="emergencyContact"
                          className="form-input"
                          value={profileData.emergencyContact}
                          onChange={handleProfileChange}
                          placeholder="Emergency contact number"
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Change Password</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        className="form-input"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        className="form-input"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-input"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Medical Information Tab (Patient Only) */}
            {activeTab === 'medical' && user?.role === 'patient' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Medical Information</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Blood Type</label>
                        <select
                          name="bloodType"
                          className="form-select"
                          value={profileData.bloodType}
                          onChange={handleProfileChange}
                        >
                          <option value="">Select Blood Type</option>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Allergies</label>
                      <textarea
                        name="allergies"
                        className="form-textarea"
                        value={profileData.allergies}
                        onChange={handleProfileChange}
                        placeholder="List any known allergies"
                        rows={3}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Medical Conditions</label>
                      <textarea
                        name="medicalConditions"
                        className="form-textarea"
                        value={profileData.medicalConditions}
                        onChange={handleProfileChange}
                        placeholder="List any existing medical conditions"
                        rows={3}
                      />
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Medical Info'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}