import React, { useEffect, useState, useContext } from 'react'
import api from '../api'
import { AuthContext } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function AdminDashboard(){
  const { user } = useContext(AuthContext)
  const [users, setUsers] = useState([])
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [stats, setStats] = useState({ users: 0, doctors: 0, patients: 0, appointments: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [selectedDoctor, setSelectedDoctor] = useState(null)

  useEffect(() => { load() }, [])

  async function load(){
    try {
      const [usersRes, pendingRes, statsRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/doctors/pending'),
        api.get('/dashboard/admin-stats').catch(() => ({ data: {} }))
      ])
      setUsers(usersRes.data)
      setPendingDoctors(pendingRes.data)
      setStats(statsRes.data)
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserActive = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}/toggle-active`)
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isActive: !currentStatus } : u
      ))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status')
    }
  }

  const handleApproveDoctor = async (doctorId, status) => {
    let rejectionReason = null
    if (status === 'rejected') {
      rejectionReason = prompt('Please provide a reason for rejection:')
      if (!rejectionReason) return
    }
    
    try {
      await api.put(`/users/doctors/${doctorId}/approve`, { status, rejectionReason })
      setPendingDoctors(pendingDoctors.filter(d => d.id !== doctorId))
      setSelectedDoctor(null)
      const usersRes = await api.get('/users')
      setUsers(usersRes.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update doctor status')
    }
  }

  const getRoleBadgeClass = (role) => {
    const classes = { admin: 'admin', doctor: 'doctor', patient: 'patient' }
    return classes[role] || 'patient'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="text-center" style={{ padding: '3rem' }}>
            <div className="spinner"></div>
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="page-subtitle">Manage your healthcare platform</p>
            </div>
            <Link to="/doctors" className="btn btn-primary">Manage Doctors</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="card stat-card">
            <div className="stat-icon primary">👥</div>
            <div className="stat-value">{stats.users || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon success">👨‍⚕️</div>
            <div className="stat-value">{stats.doctors || 0}</div>
            <div className="stat-label">Doctors</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon warning">🏥</div>
            <div className="stat-value">{stats.patients || 0}</div>
            <div className="stat-label">Patients</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon error">📅</div>
            <div className="stat-value">{stats.appointments || 0}</div>
            <div className="stat-label">Appointments</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('users')}
          >
            All Users ({users.length})
          </button>
          <button 
            className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Doctors ({pendingDoctors.length})
          </button>
        </div>

        {/* Pending Doctors Tab */}
        {activeTab === 'pending' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Pending Doctor Approvals</h3>
            </div>
            <div style={{ padding: '1rem' }}>
              {pendingDoctors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                  No pending doctor approvals
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingDoctors.map(doc => (
                    <div key={doc.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius)'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{doc.User?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{doc.User?.email}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>
                          Specialty: {doc.Specialty?.name || 'N/A'} | License: {doc.licenseNumber || 'N/A'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelectedDoctor(doc)}
                        >
                          View Details
                        </button>
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleApproveDoctor(doc.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleApproveDoctor(doc.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">All Users</h3>
              <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{users.length} users</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>#{u.id}</td>
                        <td style={{ fontWeight: 500 }}>{u.name || 'N/A'}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${getRoleBadgeClass(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {u.role === 'doctor' ? (
                            <span style={{ 
                              display: 'inline-flex',
                              padding: '0.25rem 0.5rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              background: u.Doctor?.status === 'approved' ? 'var(--accent-100)' : u.Doctor?.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                              color: u.Doctor?.status === 'approved' ? 'var(--accent-dark)' : u.Doctor?.status === 'rejected' ? '#dc2626' : '#92400e'
                            }}>
                              {u.Doctor?.status === 'approved' ? 'Approved' : u.Doctor?.status === 'rejected' ? 'Rejected' : 'Pending'}
                            </span>
                          ) : (
                            <span style={{ 
                              display: 'inline-flex',
                              padding: '0.25rem 0.5rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              background: u.isActive ? 'var(--accent-100)' : '#fee2e2',
                              color: u.isActive ? 'var(--accent-dark)' : '#dc2626'
                            }}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </td>
                        <td style={{ color: 'var(--gray-500)' }}>{formatDate(u.createdAt)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {u.role === 'doctor' && u.Doctor?.status === 'pending' && (
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => handleApproveDoctor(u.Doctor.id, 'approved')}
                              >
                                Approve
                              </button>
                            )}
                            {u.role !== 'admin' && (
                              <button 
                                className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                                onClick={() => handleToggleUserActive(u.id, u.isActive)}
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                            {u.role === 'patient' && (
                              <Link to={`/messages/${u.id}`} className="btn btn-sm btn-ghost">Message</Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Doctor Details Modal */}
        {selectedDoctor && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="card" style={{ maxWidth: '700px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">Doctor Application Details</h3>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelectedDoctor(null)}
                  style={{ fontSize: '1.5rem', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                {/* Personal Information */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.75rem', color: 'var(--gray-700)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
                    👤 Personal Information
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Full Name</div>
                      <div style={{ fontWeight: 500 }}>{selectedDoctor.User?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Email</div>
                      <div style={{ fontWeight: 500 }}>{selectedDoctor.User?.email || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.75rem', color: 'var(--gray-700)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
                    💼 Professional Information
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Specialty</div>
                      <div style={{ fontWeight: 500 }}>{selectedDoctor.Specialty?.name || 'Not specified'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>License Number</div>
                      <div style={{ fontWeight: 500 }}>{selectedDoctor.licenseNumber || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Years of Experience</div>
                      <div style={{ fontWeight: 500 }}>{selectedDoctor.experience || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Consultation Fee (TND)</div>
                      <div style={{ fontWeight: 500 }}>{selectedDoctor.fee || 'N/A'}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Clinic Address</div>
                      <div style={{ fontWeight: 500 }}>{selectedDoctor.clinicAddress || 'N/A'}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Professional Bio</div>
                      <div style={{ fontWeight: 500, whiteSpace: 'pre-wrap' }}>{selectedDoctor.bio || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.75rem', color: 'var(--gray-700)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
                    📄 Submitted Documents
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Diploma/Certificate
                      </div>
                      {selectedDoctor.diplomaUrl ? (
                        <a 
                          href={selectedDoctor.diplomaUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          📜 View Diploma
                        </a>
                      ) : (
                        <span style={{ color: 'var(--gray-500)' }}>Not uploaded</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Medical License Document
                      </div>
                      {selectedDoctor.licenseDocUrl ? (
                        <a 
                          href={selectedDoctor.licenseDocUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          📜 View License
                        </a>
                      ) : (
                        <span style={{ color: 'var(--gray-500)' }}>Not uploaded</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Application Status */}
                <div style={{ 
                  padding: '1rem', 
                  background: 'var(--gray-50)', 
                  borderRadius: 'var(--radius)',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Application Status
                  </div>
                  <span style={{ 
                    display: 'inline-flex',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    background: '#fef3c7',
                    color: '#92400e'
                  }}>
                    Pending Review
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleApproveDoctor(selectedDoctor.id, 'rejected')}
                  >
                    Reject Application
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => handleApproveDoctor(selectedDoctor.id, 'approved')}
                  >
                    Approve Doctor
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
